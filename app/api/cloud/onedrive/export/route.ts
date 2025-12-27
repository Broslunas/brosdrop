import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.ONEDRIVE_CLIENT_ID;
    const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET;

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { fileIds } = await req.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'IDs de archivo requeridos' }, { status: 400 });
    }

    await dbConnect();

    // Get stored token
    const tokenDoc = await CloudToken.findOne({
      userId: session.user.id,
      provider: 'onedrive',
    });

    if (!tokenDoc) {
      return NextResponse.json({ error: 'No conectado a OneDrive' }, { status: 401 });
    }

    let accessToken = tokenDoc.accessToken;

    // Refresh token if needed
    if (tokenDoc.expiresAt && new Date() > tokenDoc.expiresAt && tokenDoc.refreshToken) {
      const newToken = await refreshAccessToken(tokenDoc.refreshToken);
      if (newToken) {
        accessToken = newToken;
      }
    }

    // Get file documents from database
    const FileModel = (await import('@/models/File')).default;
    const files = await FileModel.find({
      _id: { $in: fileIds },
      userId: session.user.id,
    });

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se encontraron archivos' }, { status: 404 });
    }

    let uploadedCount = 0;

    // Upload each file to OneDrive
    for (const file of files) {
      try {
        // Get file from R2
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: file.key,
        });

        const s3Response = await s3Client.send(command);
        const fileBuffer = await s3Response.Body?.transformToByteArray();

        if (!fileBuffer) continue;

        // Upload to OneDrive (simple upload for files < 4MB)
        if (fileBuffer.length < 4 * 1024 * 1024) {
          const uploadResponse = await fetch(
            `https://graph.microsoft.com/v1.0/me/drive/root:/${file.originalName}:/content`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': file.mimeType,
              },
              body: fileBuffer,
            }
          );

          if (uploadResponse.ok) {
            uploadedCount++;
          }
        } else {
          // For larger files, use upload session
          // Create upload session
          const sessionResponse = await fetch(
            `https://graph.microsoft.com/v1.0/me/drive/root:/${file.originalName}:/createUploadSession`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                item: { '@microsoft.graph.conflictBehavior': 'rename' },
              }),
            }
          );

          if (!sessionResponse.ok) continue;

          const session = await sessionResponse.json();
          const uploadUrl = session.uploadUrl;

          // Upload in chunks (using simple single chunk for now)
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Length': fileBuffer.length.toString(),
              'Content-Range': `bytes 0-${fileBuffer.length - 1}/${fileBuffer.length}`,
            },
            body: fileBuffer,
          });

          if (uploadResponse.ok) {
            uploadedCount++;
          }
        }
      } catch (error) {
        console.error(`Failed to export file ${file._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      count: uploadedCount,
      total: files.length,
    });
  } catch (error) {
    console.error('OneDrive export error:', error);
    return NextResponse.json(
      { error: 'Error al exportar archivos' },
      { status: 500 }
    );
  }
}

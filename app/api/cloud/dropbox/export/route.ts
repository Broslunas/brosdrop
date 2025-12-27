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
    const clientId = process.env.DROPBOX_CLIENT_ID;
    const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
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
      provider: 'dropbox',
    });

    if (!tokenDoc) {
      return NextResponse.json({ error: 'No conectado a Dropbox' }, { status: 401 });
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

    // Upload each file to Dropbox
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

        // Upload to Dropbox
        const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({
              path: `/${file.originalName}`,
              mode: 'add',
              autorename: true,
            }),
          },
          body: fileBuffer,
        });

        if (uploadResponse.ok) {
          uploadedCount++;
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
    console.error('Dropbox export error:', error);
    return NextResponse.json(
      { error: 'Error al exportar archivos' },
      { status: 500 }
    );
  }
}

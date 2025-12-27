import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';
import { CLOUD_LIMITS } from '@/lib/cloudProviders';

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

    // Check plan limits
    const userModel = (await import('@/models/User')).default;
    const user = await userModel.findOne({ email: session.user.email });
    const planName = user?.plan || 'free';
    const limits = CLOUD_LIMITS[planName as keyof typeof CLOUD_LIMITS];

    if (!limits?.canImport) {
      return NextResponse.json(
        { error: 'Tu plan no permite importar archivos' },
        { status: 403 }
      );
    }

    // Download files from OneDrive
    const files = [];
    
    for (const fileId of fileIds) {
      try {
        // Get file metadata
        const metaResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!metaResponse.ok) continue;

        const metadata = await metaResponse.json();

        // Check size limit
        if (metadata.size && metadata.size > limits.maxImportSize) {
          continue;
        }

        // Get download URL
        const downloadUrl = metadata['@microsoft.graph.downloadUrl'];
        
        if (!downloadUrl) continue;

        // Download file
        const contentResponse = await fetch(downloadUrl);

        if (!contentResponse.ok) continue;

        const blob = await contentResponse.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64 = buffer.toString('base64');

        files.push({
          name: metadata.name,
          mimeType: metadata.file?.mimeType || 'application/octet-stream',
          size: metadata.size,
          url: `data:${metadata.file?.mimeType || 'application/octet-stream'};base64,${base64}`,
        });
      } catch (error) {
        console.error(`Failed to import file ${fileId}:`, error);
      }
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('OneDrive import error:', error);
    return NextResponse.json(
      { error: 'Error al importar archivos' },
      { status: 500 }
    );
  }
}

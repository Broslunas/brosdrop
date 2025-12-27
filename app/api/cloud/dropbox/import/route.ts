import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';
import { CLOUD_LIMITS } from '@/lib/cloudProviders';

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

    // Download files from Dropbox
    const files = [];
    
    for (const fileId of fileIds) {
      try {
        // First get metadata to check file path
        const listResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '',
            recursive: false,
          }),
        });

        const listData = await listResponse.json();
        const fileEntry = listData.entries.find((e: any) => e.id === fileId);

        if (!fileEntry) continue;

        // Check size limit
        if (fileEntry.size && fileEntry.size > limits.maxImportSize) {
          continue;
        }

        // Download file
        const downloadResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({ path: fileEntry.path_lower }),
          },
        });

        if (!downloadResponse.ok) continue;

        const blob = await downloadResponse.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64 = buffer.toString('base64');

        files.push({
          name: fileEntry.name,
          mimeType: 'application/octet-stream',
          size: fileEntry.size,
          url: `data:application/octet-stream;base64,${base64}`,
        });
      } catch (error) {
        console.error(`Failed to import file ${fileId}:`, error);
      }
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Dropbox import error:', error);
    return NextResponse.json(
      { error: 'Error al importar archivos' },
      { status: 500 }
    );
  }
}

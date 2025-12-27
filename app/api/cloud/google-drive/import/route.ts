import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';
import { CLOUD_LIMITS } from '@/lib/cloudProviders';

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;

    const response = await fetch('https://oauth2.googleapis.com/token', {
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
      provider: 'google-drive',
    });

    if (!tokenDoc) {
      return NextResponse.json({ error: 'No conectado a Google Drive' }, { status: 401 });
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

    // Download files from Google Drive
    const files = [];
    const skipped = [];
    
    console.log('📥 Starting import for', fileIds.length, 'files');
    
    for (const fileId of fileIds) {
      try {
        console.log('🔍 Processing file:', fileId);
        
        // Get file metadata
        const metaResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!metaResponse.ok) {
          console.error('❌ Failed to get metadata:', metaResponse.status, metaResponse.statusText);
          skipped.push({ fileId, reason: 'metadata_error' });
          continue;
        }

        const metadata = await metaResponse.json();
        console.log('📄 File metadata:', metadata.name, metadata.mimeType, metadata.size);

        // Handle Google Workspace files (Docs, Sheets, Slides)
        const isGoogleDoc = metadata.mimeType?.startsWith('application/vnd.google-apps');
        let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        let finalMimeType = metadata.mimeType;
        let finalName = metadata.name;

        if (isGoogleDoc) {
          console.log('📝 Google Workspace file detected, exporting...');
          // Export Google Docs as PDF or appropriate format
          const exportFormats: Record<string, { mimeType: string; extension: string }> = {
            'application/vnd.google-apps.document': { mimeType: 'application/pdf', extension: '.pdf' },
            'application/vnd.google-apps.spreadsheet': { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: '.xlsx' },
            'application/vnd.google-apps.presentation': { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extension: '.pptx' },
          };

          const exportFormat = exportFormats[metadata.mimeType];
          if (exportFormat) {
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportFormat.mimeType)}`;
            finalMimeType = exportFormat.mimeType;
            if (!finalName.includes('.')) {
              finalName += exportFormat.extension;
            }
            console.log('📤 Exporting as:', finalMimeType);
          } else {
            console.warn('⚠️ Unsupported Google Workspace type:', metadata.mimeType);
            skipped.push({ fileId, reason: 'unsupported_type', name: metadata.name });
            continue;
          }
        }

        // Check size limit (only for regular files with size)
        if (metadata.size && metadata.size > limits.maxImportSize) {
          console.warn('⚠️ File too large:', metadata.size, '>', limits.maxImportSize);
          skipped.push({ fileId, reason: 'too_large', name: metadata.name, size: metadata.size });
          continue;
        }

        // Download file content
        console.log('⬇️ Downloading from:', downloadUrl);
        const contentResponse = await fetch(downloadUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!contentResponse.ok) {
          console.error('❌ Download failed:', contentResponse.status, contentResponse.statusText);
          skipped.push({ fileId, reason: 'download_error', name: metadata.name });
          continue;
        }

        const blob = await contentResponse.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64 = buffer.toString('base64');

        console.log('✅ Successfully imported:', finalName, buffer.length, 'bytes');

        files.push({
          name: finalName,
          mimeType: finalMimeType,
          size: buffer.length,
          url: `data:${finalMimeType};base64,${base64}`,
        });
      } catch (error) {
        console.error(`💥 Failed to import file ${fileId}:`, error);
        skipped.push({ fileId, reason: 'error', error: String(error) });
      }
    }

    console.log('🎉 Import complete:', files.length, 'files imported,', skipped.length, 'skipped');

    return NextResponse.json({ 
      files,
      skipped: skipped.length > 0 ? skipped : undefined
    });
  } catch (error) {
    console.error('Google Drive import error:', error);
    return NextResponse.json(
      { error: 'Error al importar archivos' },
      { status: 500 }
    );
  }
}

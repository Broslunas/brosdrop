import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';

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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
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
        await CloudToken.updateOne(
          { _id: tokenDoc._id },
          { 
            accessToken: newToken,
            expiresAt: new Date(Date.now() + 3600 * 1000),
          }
        );
      }
    }

    // List files from OneDrive
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/drive/root/children?$top=100',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch files from OneDrive');
    }

    const data = await response.json();

    // Transform OneDrive format to our format
    const files = data.value
      .filter((item: any) => item.file) // Only files, not folders
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        modifiedTime: item.lastModifiedDateTime,
        webViewLink: item.webUrl,
        downloadUrl: item['@microsoft.graph.downloadUrl'],
      }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('OneDrive files error:', error);
    return NextResponse.json(
      { error: 'Error al obtener archivos' },
      { status: 500 }
    );
  }
}

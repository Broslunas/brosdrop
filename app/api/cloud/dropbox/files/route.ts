import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';

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
        await CloudToken.updateOne(
          { _id: tokenDoc._id },
          { 
            accessToken: newToken,
            expiresAt: new Date(Date.now() + 14400 * 1000), // 4 hours
          }
        );
      }
    }

    // List files from Dropbox
    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: '',
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        limit: 100,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch files from Dropbox');
    }

    const data = await response.json();

    // Transform Dropbox format to our format
    const files = data.entries
      .filter((entry: any) => entry['.tag'] === 'file')
      .map((entry: any) => ({
        id: entry.id,
        name: entry.name,
        size: entry.size,
        modifiedTime: entry.client_modified,
      }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Dropbox files error:', error);
    return NextResponse.json(
      { error: 'Error al obtener archivos' },
      { status: 500 }
    );
  }
}

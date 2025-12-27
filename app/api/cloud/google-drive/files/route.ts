import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';

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
      provider: 'google-drive',
    });

    if (!tokenDoc) {
      return NextResponse.json({ error: 'No conectado a Google Drive' }, { status: 401 });
    }

    let accessToken = tokenDoc.accessToken;

    // Check if token is expired and refresh if needed
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

    // List files from Google Drive
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?' +
      'pageSize=100&' +
      'fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&' +
      'orderBy=modifiedTime desc',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch files from Google Drive');
    }

    const data = await response.json();

    return NextResponse.json({ files: data.files || [] });
  } catch (error) {
    console.error('Google Drive files error:', error);
    return NextResponse.json(
      { error: 'Error al obtener archivos' },
      { status: 500 }
    );
  }
}

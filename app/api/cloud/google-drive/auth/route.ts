import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/cloud/google-drive/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Drive no configurado' },
        { status: 500 }
      );
    }

    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${session.user.id}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google Drive auth error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar autenticación' },
      { status: 500 }
    );
  }
}

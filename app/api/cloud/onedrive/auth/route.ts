import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const clientId = process.env.ONEDRIVE_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/cloud/onedrive/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'OneDrive no configurado' },
        { status: 500 }
      );
    }

    const scopes = ['Files.ReadWrite', 'offline_access'].join(' ');

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${session.user.id}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('OneDrive auth error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar autenticación' },
      { status: 500 }
    );
  }
}

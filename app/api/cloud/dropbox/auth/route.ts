import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const clientId = process.env.DROPBOX_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/cloud/dropbox/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Dropbox no configurado' },
        { status: 500 }
      );
    }

    const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `token_access_type=offline&` +
      `state=${session.user.id}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Dropbox auth error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar autenticación' },
      { status: 500 }
    );
  }
}

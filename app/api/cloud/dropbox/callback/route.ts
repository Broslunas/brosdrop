import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    if (error) {
      return new NextResponse(
        `<html><body><script>
          window.opener.postMessage({ type: 'cloud-auth-error', error: '${error}' }, '*');
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const clientId = process.env.DROPBOX_CLIENT_ID;
    const clientSecret = process.env.DROPBOX_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/cloud/dropbox/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Save tokens to database
    await dbConnect();

    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : undefined;

    await CloudToken.findOneAndUpdate(
      { userId: state, provider: 'dropbox' },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Return success page that closes popup
    return new NextResponse(
      `<html><body><script>
        window.opener.postMessage({ type: 'cloud-auth-success', provider: 'dropbox' }, '*');
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Dropbox callback error:', error);
    return new NextResponse(
      `<html><body><script>
        window.opener.postMessage({ type: 'cloud-auth-error', error: 'callback_failed' }, '*');
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

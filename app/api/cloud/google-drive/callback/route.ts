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

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/cloud/google-drive/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
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
      { userId: state, provider: 'google-drive' },
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
        window.opener.postMessage({ type: 'cloud-auth-success', provider: 'google-drive' }, '*');
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Google Drive callback error:', error);
    return new NextResponse(
      `<html><body><script>
        window.opener.postMessage({ type: 'cloud-auth-error', error: 'callback_failed' }, '*');
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

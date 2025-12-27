import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import CloudToken from '@/models/CloudToken';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await dbConnect();

    // Find all cloud tokens for this user
    const tokens = await CloudToken.find({ 
      userId: session.user.id 
    }).select('provider');

    const providers = tokens.map(t => t.provider);

    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Failed to get cloud connections:', error);
    return NextResponse.json(
      { error: 'Error al obtener conexiones' },
      { status: 500 }
    );
  }
}

// Disconnect a provider
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { provider } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: 'Provider requerido' }, { status: 400 });
    }

    await dbConnect();

    await CloudToken.deleteOne({ 
      userId: session.user.id,
      provider 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect provider:', error);
    return NextResponse.json(
      { error: 'Error al desconectar' },
      { status: 500 }
    );
  }
}

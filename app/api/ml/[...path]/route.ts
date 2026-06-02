import { NextRequest, NextResponse } from 'next/server'

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8001'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const endpoint = params.path.join('/')
    const response = await fetch(`${ML_API_URL}/api/v1/${endpoint}`, {
      method: 'GET',
      headers: { 'Accept': 'image/png, application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `ML API error: ${response.status}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: { 'Content-Type': contentType },
    })
  } catch (error: any) {
    console.error('ML API Proxy Error:', error)
    return NextResponse.json(
      { error: 'Motor de ML indisponível no momento.' },
      { status: 503 }
    )
  }
}

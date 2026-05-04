import { NextRequest, NextResponse } from 'next/server'

// URL da API de Machine Learning (pasta Anomalias) — porta separada da API principal
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8001'

// Proxy genérico para qualquer GET na API de ML: GET /api/ml/[...path]
// Ex: /api/ml/cidadesmaisanomalas → http://localhost:8001/cidadesmaisanomalas
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const endpoint = params.path.join('/')
    const response = await fetch(`${ML_API_URL}/sql/${endpoint}`, {
      method: 'GET',
      headers: { 'Accept': 'image/png, application/json' },
      // Cache de 5 minutos — os gráficos não mudam a cada requisição
      next: { revalidate: 300 },
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

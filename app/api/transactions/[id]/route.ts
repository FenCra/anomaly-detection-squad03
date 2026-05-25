import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const response = await fetch(`${API_URL}/sql/transactions/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Route GET Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PATCH /api/transactions/{id} — Julgamento do Analista (Caso de Uso: Julgar Transação)
// Encaminha o veredito final ao FastAPI para persistência no banco de dados.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()

    // O FastAPI (backend) espera um PUT na rota /fraude e o is_fraude como query parameter
    const isFraudeQuery = body.is_fraude ? 'true' : 'false'
    const url = `${API_URL}/sql/transactions/${id}/fraude?is_fraude=${isFraudeQuery}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Route PATCH Error:', error)
    return NextResponse.json(
      { error: error.message || 'Falha ao registrar julgamento no servidor' },
      { status: 500 }
    )
  }
}

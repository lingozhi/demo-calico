import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const path = body.path
    const apiUrl = `http://dev.chimerai.cn:11118/v1/${path}`
    debugger
    delete body.path

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ai-token': '534dc1cc256cd9c3f1b62f14900fa5978SnLbY',
        terminal: '4',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error.message)
    return NextResponse.json({ error: `Failed to proxy the request: ${error.message}` }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * This is a catch-all API route that proxies requests to the FastAPI backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const queryString = searchParams ? `?${searchParams}` : ''

  // Get the API URL from environment variables or use default
  const apiUrl = process.env.API_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${apiUrl}/${path}${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying GET request to /${path}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch data from /${path}` },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')

  // Get the API URL from environment variables or use default
  const apiUrl = process.env.API_URL || 'http://localhost:8000'

  try {
    const body = await request.json()

    const response = await fetch(`${apiUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying POST request to /${path}:`, error)
    return NextResponse.json(
      { error: `Failed to post data to /${path}` },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')

  // Get the API URL from environment variables or use default
  const apiUrl = process.env.API_URL || 'http://localhost:8000'

  try {
    const body = await request.json()

    const response = await fetch(`${apiUrl}/${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying PUT request to /${path}:`, error)
    return NextResponse.json(
      { error: `Failed to put data to /${path}` },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')

  // Get the API URL from environment variables or use default
  const apiUrl = process.env.API_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${apiUrl}/${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying DELETE request to /${path}:`, error)
    return NextResponse.json(
      { error: `Failed to delete data from /${path}` },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gameId = params.id

  // Get the API URL from environment variables or use default
  const apiUrl = process.env.API_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${apiUrl}/games/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching game ${gameId}:`, error)

    // Return a fallback game object if the API fails
    return NextResponse.json({
      game_id: parseInt(gameId),
      game_name: `Game ${gameId}`,
      description: "Game details unavailable",
      created_at: new Date().toISOString(),
    })
  }
}

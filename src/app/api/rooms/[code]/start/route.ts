import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SAMPLE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=800',
    question: 'Quem é esse icônico professor de química transformado em mestre do crime?',
    answer: 'Walter White',
    hints: ['Breaking Bad', 'Heisenberg']
  },
  {
    url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    question: 'Em que filme acompanhamos Neo na descoberta de que o mundo é uma simulação?',
    answer: 'The Matrix',
    hints: ['Pílula vermelha ou azul', 'Keanu Reeves']
  },
  {
    url: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?auto=format&fit=crop&q=80&w=800',
    question: 'Qual o nome desse personagem da Nintendo conhecido por salvar a Princesa Peach?',
    answer: 'Super Mario',
    hints: ['Encanador italiano', 'Cogumelos']
  },
  {
    url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800',
    question: 'Qual é o nome do navio inafundável que protagoniza um dos maiores épicos do cinema?',
    answer: 'Titanic',
    hints: ['Jack e Rose', 'Iceberg']
  },
  {
    url: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&q=80&w=800',
    question: 'Quem é conhecido mundialmente como o Rei do Pop e criador do Moonwalk?',
    answer: 'Michael Jackson',
    hints: ['Thriller', 'Billie Jean']
  },
  {
    url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800',
    question: 'Qual o nome da série da Netflix que explora o Mundo Invertido nos anos 80?',
    answer: 'Stranger Things',
    hints: ['Eleven', 'Demogorgon']
  },
  {
    url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800',
    question: 'Quem é o super-herói amigo da vizinhança que usa um traje vermelho e azul?',
    answer: 'Homem-Aranha',
    hints: ['Peter Parker', 'Marvel']
  },
  {
    url: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?auto=format&fit=crop&q=80&w=800',
    question: 'Qual o nome do bruxo mais famoso de Hogwarts?',
    answer: 'Harry Potter',
    hints: ['O Menino que Sobreviveu', 'Gryffindor']
  },
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = createAdminClient()
    const body = await request.json()
    const { sessionId } = body

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.host_id !== sessionId) {
      return NextResponse.json({ error: 'Only host can start the game' }, { status: 403 })
    }

    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)

    if (playersError) throw playersError

    if (!players || players.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 players to start' }, { status: 400 })
    }

    const shuffledImages = [...SAMPLE_IMAGES].sort(() => Math.random() - 0.5)
    const roundsToCreate = shuffledImages.slice(0, room.total_rounds)

    const roundsData = roundsToCreate.map((img, index) => ({
      room_id: room.id,
      round_number: index + 1,
      image_url: img.url,
      question: img.question,
      answer: img.answer,
      answer_hints: img.hints,
      status: 'pending'
    }))

    const { error: roundsError } = await supabase
      .from('rounds')
      .insert(roundsData)

    if (roundsError) {
      console.error('Database Error (Rounds Table):', roundsError)
      if (roundsError.message.includes('column "question" does not exist')) {
        return NextResponse.json({
          error: 'Database schema out of sync. Please run the SQL migration.',
          details: 'Column "question" is missing in "rounds" table.'
        }, { status: 500 })
      }
      throw roundsError
    }

    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({
        status: 'playing',
        current_round: 1,
        time_per_round: 20,
        updated_at: new Date().toISOString()
      })
      .eq('id', room.id)

    if (updateRoomError) throw updateRoomError

    // Activate the first round with a timestamp
    const { error: activateRoundError } = await supabase
      .from('rounds')
      .update({
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('room_id', room.id)
      .eq('round_number', 1)

    if (activateRoundError) throw activateRoundError

    const { error: updatePlayersError } = await supabase
      .from('players')
      .update({ status: 'playing' })
      .eq('room_id', room.id)

    if (updatePlayersError) throw updatePlayersError

    const { data: firstRound } = await supabase
      .from('rounds')
      .select('*')
      .eq('room_id', room.id)
      .eq('round_number', 1)
      .single()

    return NextResponse.json({
      success: true,
      round: firstRound
    })
  } catch (error: any) {
    console.error('Error starting game:', error)
    return NextResponse.json({
      error: 'Failed to start game',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

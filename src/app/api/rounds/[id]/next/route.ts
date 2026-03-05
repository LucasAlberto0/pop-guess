import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: currentRoundId } = await params
        const supabase = createAdminClient()
        const body = await request.json()
        const { sessionId } = body

        // 1. Get current round and room info
        const { data: currentRound, error: roundError } = await supabase
            .from('rounds')
            .select('*, room:rooms(*)')
            .eq('id', currentRoundId)
            .single()

        if (roundError || !currentRound) {
            return NextResponse.json({ error: 'Round not found' }, { status: 404 })
        }

        // 2. Security check
        if (currentRound.room.host_id !== sessionId) {
            return NextResponse.json({ error: 'Only host can trigger next round' }, { status: 403 })
        }

        // 3. Check for a winner (>= 120 points)
        const { data: winner } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', currentRound.room.id)
            .gte('score', 120)
            .order('score', { ascending: false })
            .limit(1)
            .single()

        if (winner) {
            // Finish game if someone reached 120 points
            await supabase
                .from('rooms')
                .update({
                    status: 'finished',
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentRound.room.id)

            return NextResponse.json({
                success: true,
                gameFinished: true,
                winner
            })
        }

        const nextRoundNumber = currentRound.round_number + 1

        // 4. Find next round
        const { data: nextRoundExist } = await supabase
            .from('rounds')
            .select('*')
            .eq('room_id', currentRound.room.id)
            .eq('round_number', nextRoundNumber)
            .single()

        let nextRound;

        if (nextRoundExist) {
            const { data } = await supabase
                .from('rounds')
                .update({
                    status: 'active',
                    started_at: new Date().toISOString()
                })
                .eq('id', nextRoundExist.id)
                .select()
                .single()
            nextRound = data
        } else {
            // Generate a new round since no more are pre-assigned
            // In a real app we'd fetch from a large pool, for now we reuse SAMPLE_IMAGES but random
            // This is a simple fallback
            const SAMPLE_IMAGES = [
                { url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=800', answer: 'Walter White' },
                { url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800', answer: 'The Matrix' },
                { url: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?auto=format&fit=crop&q=80&w=800', answer: 'Super Mario' },
                { url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800', answer: 'Titanic' },
                { url: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&q=80&w=800', answer: 'Michael Jackson' },
                { url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800', answer: 'Stranger Things' },
                { url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800', answer: 'Homem-Aranha' },
                { url: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?auto=format&fit=crop&q=80&w=800', answer: 'Harry Potter' },
            ]
            const randomImg = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]

            const { data } = await supabase
                .from('rounds')
                .insert({
                    room_id: currentRound.room.id,
                    round_number: nextRoundNumber,
                    image_url: randomImg.url,
                    answer: randomImg.answer,
                    status: 'active',
                    started_at: new Date().toISOString()
                })
                .select()
                .single()
            nextRound = data
        }

        if (!nextRound) throw new Error('Failed to create or find next round')

        // Update room's current_round
        await supabase
            .from('rooms')
            .update({
                current_round: nextRoundNumber,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentRound.room.id)

        return NextResponse.json({
            success: true,
            nextRound
        })
    } catch (error) {
        console.error('Error transitioning to next round:', error)
        return NextResponse.json({ error: 'Failed to transition' }, { status: 500 })
    }
}

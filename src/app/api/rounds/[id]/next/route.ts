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

        const nextRoundNumber = currentRound.round_number + 1

        // 3. Find and activate next round
        if (nextRoundNumber <= currentRound.room.total_rounds) {
            const { data: nextRound, error: nextRoundError } = await supabase
                .from('rounds')
                .update({
                    status: 'active',
                    started_at: new Date().toISOString()
                })
                .eq('room_id', currentRound.room.id)
                .eq('round_number', nextRoundNumber)
                .select()
                .single()

            if (nextRoundError) throw nextRoundError

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
        } else {
            // Finish game if no more rounds
            await supabase
                .from('rooms')
                .update({
                    status: 'finished',
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentRound.room.id)

            return NextResponse.json({
                success: true,
                gameFinished: true
            })
        }
    } catch (error) {
        console.error('Error transitioning to next round:', error)
        return NextResponse.json({ error: 'Failed to transition' }, { status: 500 })
    }
}

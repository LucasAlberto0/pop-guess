"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TimerRing from "@/components/game/TimerRing";
import RankingList from "@/components/game/RankingList";
import ChatPanel from "@/components/game/ChatPanel";
import { Loader2 } from "lucide-react";
import { useRealtimeRoom } from "@/hooks/useRealtimeRoom";

function GameContent() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { room, players, currentRound, answers, isLoading: initialLoading } = useRealtimeRoom(code);
  const [isHost, setIsHost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [scorePopup, setScorePopup] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (room) {
      const playerData = JSON.parse(sessionStorage.getItem("player") || "{}");
      setIsHost(room.host_id === playerData.sessionId);
    }
  }, [room]);

  useEffect(() => {
    if (room?.status === 'finished') {
      router.push(`/results/${code}`);
    }
  }, [room?.status, code, router]);


  useEffect(() => {
    if (!currentRound || showRoundResult || timeLeft <= 0) return;

    const timer = setInterval(() => {
      if (currentRound && currentRound.started_at) {
        const serverStart = new Date(currentRound.started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - serverStart) / 1000);
        const limit = room?.time_per_round || 20;
        const remaining = Math.max(0, limit - elapsed);
        
        setTimeLeft(remaining);
        
        if (remaining === 0 && !showRoundResult) {
          handleTimeUp();
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [currentRound, room?.time_per_round, showRoundResult]);

  useEffect(() => {
    if (currentRound) {
      if (currentRound.status === "finished") {
        const handleFinishedRound = async () => {
          try {
            const res = await fetch(`/api/rounds/${currentRound.id}/finish`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: JSON.parse(sessionStorage.getItem("player") || "{}").sessionId }),
            });
            const data = await res.json();
            
            setRoundResult(data);
            setShowRoundResult(true);

            if (isHost) {
              setTimeout(async () => {
                const playerData = JSON.parse(sessionStorage.getItem("player") || "{}");
                await fetch(`/api/rounds/${currentRound.id}/next`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionId: playerData.sessionId }),
                });
              }, 5000);
            }
          } catch (err) {
            console.error("Error handling round finish:", err);
          }
        };
        
        if (!showRoundResult) {
           handleFinishedRound();
        }
        
      } else if (currentRound.status === "active" && currentRound.id !== roundResult?.round?.id) {
        setTimeLeft(room?.time_per_round || 20);
        setAnswer("");
        setFeedback(null);
        setAnswered(false);
        setShowRoundResult(false);
        setRoundResult(null);
        startTimeRef.current = Date.now();
      }
    }
  }, [currentRound, isHost, room?.time_per_round, showRoundResult, roundResult?.round?.id]);


  const handleTimeUp = async () => {
    if (isHost && currentRound && !showRoundResult) {
      const playerData = JSON.parse(sessionStorage.getItem("player") || "{}");
      await fetch(`/api/rounds/${currentRound.id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: playerData.sessionId }),
      });
    }
    // Non-hosts just wait for the Realtime 'finished' event
  };

  const submitAnswer = async () => {
    if (!answer.trim() || answered || !currentRound || showRoundResult) return;

    const timeMs = Date.now() - new Date(currentRound.started_at!).getTime();
    setAnswered(true);

    const playerData = JSON.parse(sessionStorage.getItem("player") || "{}");

    try {
      const res = await fetch(`/api/rounds/${currentRound.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: playerData.id,
          playerSessionId: playerData.sessionId,
          answer: answer.trim(),
          timeMs,
        }),
      });

      const data = await res.json();
      
      if (data.isCorrect) {
        setFeedback("correct");
        setScorePopup(data.pointsEarned);
        setTimeout(() => setScorePopup(null), 800);
      } else {
        setFeedback("wrong");
        setAnswered(false); // Allow multiple tries
      }
    } catch (err) {
      setFeedback("wrong");
      setAnswered(false);
    }
  };


  if (initialLoading) {
    return (
      <div className="relative min-h-screen gradient-bg-animated flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-display text-xl">
          <Loader2 className="animate-spin" />
          Carregando jogo...
        </div>
      </div>
    );
  }

  if (!currentRound) {
    return (
      <div className="relative min-h-screen gradient-bg-animated flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary font-display text-xl mb-4">Aguardando próxima rodada...</p>
          <Loader2 className="animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen gradient-bg-animated">
      <div className="relative z-10 h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col p-4 lg:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-display text-xs text-primary tracking-widest">
                RODADA {currentRound.round_number}/{room?.total_rounds || 10}
              </span>
            </div>
            <TimerRing timeLeft={timeLeft} totalTime={room?.time_per_round || 30} />
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {!showRoundResult ? (
                <motion.div
                  key={`q-${currentRound.round_number}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="glass-card p-2 max-w-lg w-full flex flex-col gap-4"
                >
                  {(currentRound as any).question && (
                    <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="font-display text-sm sm:text-base text-primary text-center">
                        {(currentRound as any).question}
                      </p>
                    </div>
                  )}
                  <img
                    src={currentRound.image_url}
                    alt="Quiz"
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`result-${currentRound.round_number}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 text-center max-w-md w-full"
                >
                  <h3 className="font-display text-lg text-primary mb-2">Resposta Correta</h3>
                  <p className="font-display text-3xl gradient-text mb-4">{currentRound.answer}</p>
                  {roundResult && roundResult.answers && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground font-ui mb-2">Acertos:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {roundResult.answers
                          .filter((a: any) => a.is_correct)
                          .map((a: any) => (
                            <span key={a.id} className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded">
                              {a.player?.name || "Jogador"}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground font-ui mb-6">
                    {roundResult?.gameFinished ? "Finalizando jogo..." : "Próxima rodada em breve..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {scorePopup && (
                <motion.div
                  initial={{ scale: 0, y: 0 }}
                  animate={{ scale: 1.3, y: -60 }}
                  exit={{ opacity: 0, y: -100 }}
                  className="absolute top-1/3 font-display text-3xl font-black text-neon-green glow-cyan pointer-events-none"
                >
                  +{scorePopup}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!showRoundResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 mt-4 ${feedback === "wrong" ? "animate-[shake_0.3s_ease]" : ""}`}
            >
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                placeholder="Sua resposta..."
                disabled={answered}
                className={`flex-1 bg-input border rounded-xl px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                  feedback === "correct"
                    ? "border-neon-green neon-border-cyan"
                    : feedback === "wrong"
                    ? "border-destructive"
                    : "border-border focus:neon-border-cyan"
                } disabled:opacity-50`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitAnswer}
                disabled={answered || !answer.trim()}
                className="btn-neon px-6 py-3 rounded-xl text-primary-foreground font-display text-xs tracking-widest disabled:opacity-40"
              >
                Enviar
              </motion.button>
            </motion.div>
          )}

          <AnimatePresence>
            {feedback && !showRoundResult && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center text-sm font-ui mt-2 ${
                  feedback === "correct" ? "text-neon-green" : "text-destructive"
                }`}
              >
                {feedback === "correct" ? "✅ Acertou!" : "❌ Errou!"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-3 p-4 lg:p-6 lg:border-l border-border overflow-y-auto">
          <div className="flex-1 min-h-0">
            <RankingList players={players} currentPlayerId={JSON.parse(sessionStorage.getItem("player") || "{}").id || ""} />
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense>
      <GameContent />
    </Suspense>
  );
}

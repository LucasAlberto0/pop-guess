import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/game/ParticleBackground";
import ConfettiEffect from "@/components/game/ConfettiEffect";
import type { PlayerData } from "@/components/game/RankingList";
import { Trophy, Medal, Award, RotateCcw, Home } from "lucide-react";

const fallbackPlayers: PlayerData[] = [
  { id: "1", name: "Você", avatar: "🎮", score: 420 },
  { id: "2", name: "Luna", avatar: "🌟", score: 380 },
  { id: "3", name: "Blaze", avatar: "🔥", score: 310 },
  { id: "4", name: "Nyx", avatar: "🎭", score: 250 },
  { id: "5", name: "Spark", avatar: "⚡", score: 180 },
];

const podiumIcons = [
  <Trophy className="text-neon-yellow" size={32} />,
  <Medal className="text-muted-foreground" size={28} />,
  <Award className="text-neon-orange" size={24} />,
];

const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
const podiumHeights = ["h-32", "h-44", "h-24"];

const FinalResults = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [showConfetti, setShowConfetti] = useState(true);

  const raw = sessionStorage.getItem("finalPlayers");
  const players: PlayerData[] = raw ? JSON.parse(raw) : fallbackPlayers;
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen gradient-bg-animated flex items-center justify-center px-4 py-8">
      <ParticleBackground />
      {showConfetti && <ConfettiEffect />}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl w-full space-y-8"
      >
        <div className="text-center">
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="font-display text-4xl gradient-text mb-2"
          >
            🏆 FIM DE JOGO
          </motion.h1>
          <p className="text-muted-foreground font-ui">Sala {code}</p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4">
          {podiumOrder.map((pos, visualIdx) => {
            const player = top3[pos];
            if (!player) return null;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + visualIdx * 0.2, type: "spring" }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: visualIdx * 0.3 }}
                  className="mb-2"
                >
                  {podiumIcons[pos]}
                </motion.div>
                <div className="text-3xl mb-1">{player.avatar}</div>
                <p className="font-ui font-bold text-sm text-foreground">{player.name}</p>
                <p className="font-display text-xs text-primary">{player.score} pts</p>
                <div className={`w-20 ${podiumHeights[pos]} mt-2 rounded-t-xl bg-gradient-to-t from-muted to-card border border-border flex items-start justify-center pt-3`}>
                  <span className="font-display text-lg text-muted-foreground">#{pos + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full ranking */}
        <div className="glass-card p-4 space-y-2">
          {sorted.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
            >
              <span className="font-display text-sm text-muted-foreground w-6 text-center">#{i + 1}</span>
              <span className="text-xl">{p.avatar}</span>
              <span className="font-ui font-semibold text-sm flex-1">{p.name}</span>
              <span className="font-display text-sm text-primary">{p.score}</span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/game/${code}`)}
            className="btn-neon flex-1 py-4 rounded-xl text-primary-foreground font-display text-xs tracking-widest flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> Jogar Novamente
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="btn-neon-magenta flex-1 py-4 rounded-xl text-secondary-foreground font-display text-xs tracking-widest flex items-center justify-center gap-2"
          >
            <Home size={16} /> Nova Sala
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FinalResults;

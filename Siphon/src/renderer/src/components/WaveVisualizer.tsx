import { motion } from "framer-motion";

interface WaveVisualizerProps {
  isActive?: boolean;
  barCount?: number;
}

const WaveVisualizer = ({ isActive = false, barCount = 5 }: WaveVisualizerProps) => {
  return (
    <div className="flex items-end gap-1 h-8">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-primary to-orange-400"
          initial={{ height: 8 }}
          animate={isActive ? {
            height: [8, 32, 16, 24, 8],
          } : { height: 8 }}
          transition={{
            duration: 0.8,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default WaveVisualizer;

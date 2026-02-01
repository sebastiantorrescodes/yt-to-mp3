import { motion } from "framer-motion";
import ConvertForm from "@/components/ConvertForm";


const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[100px] translate-y-1/2" />
        <motion.div
          className="absolute top-1/4 left-10 text-4xl opacity-20"
          animate={{ y: [-20, 20, -20], rotate: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ♪
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-20 text-5xl opacity-15"
          animate={{ y: [20, -20, 20], rotate: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          ♫
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-20 text-3xl opacity-10"
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          ♬
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-12 md:mb-16">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4"
          >
            <span className="text-foreground">Welcome to</span>
            <span className="gradient-text"> Siphon!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Extract audio or video from YouTube in seconds.
            Paste a link, pick your format, and download.
          </motion.p>

          {/* Convert Form */}
          <ConvertForm />
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center z-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm text-muted-foreground/30"
        >
          © 2026 Siphon. Built by Sebastian Torres.
        </motion.p>
      </footer>
    </div>
  );
};

export default Index;

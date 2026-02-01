import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Video, Download, Loader2, CheckCircle, Link, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WaveVisualizer from "./WaveVisualizer";
import { toast } from "sonner";

type ConversionState = "idle" | "converting" | "ready" | "done";
type MediaFormat = "mp3" | "mp4";

interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ConvertForm = () => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<MediaFormat>("mp3");
  const [state, setState] = useState<ConversionState>("idle");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const cleanup = window.api.onDownloadProgress((prog) => {
      setProgress(prog);
    });
    return cleanup;
  }, []);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setState("converting");
    setProgress(0);

    try {
      const info = await window.api.getVideoInfo(url);
      setVideoInfo(info);
      setState("ready");
      toast.success("Video found! Ready to download.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to get video info. Check the URL and try again.");
      setState("idle");
    }
  };

  const handleDownload = async () => {
    setState("converting");
    setProgress(0);

    try {
      const result = await window.api.downloadMedia(url, format);

      if (result.canceled) {
        setState("ready");
        return;
      }

      if (result.success) {
        setState("done");
      }
    } catch (error) {
      console.error(error);
      toast.error("Download failed. Please try again.");
      setState("ready");
    }
  };

  const handleReset = () => {
    setState("idle");
    setUrl("");
    setVideoInfo(null);
    setProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative p-1 rounded-3xl bg-gradient-to-r from-primary/50 via-orange-400/50 to-primary/50">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/30 to-orange-400/30 blur-xl opacity-50" />

        <div className="relative bg-card rounded-[22px] p-6 md:p-8">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleConvert}
                className="space-y-4"
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Link className="w-5 h-5" />
                  </div>
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube URL here..."
                    className="h-14 pl-12 pr-4 text-base bg-secondary/50 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>

                {/* Format Toggle */}
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("mp3")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      format === "mp3"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    MP3
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("mp4")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      format === "mp4"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    MP4
                  </button>
                </div>

                <Button type="submit" variant="vibrant" size="xl" className="w-full">
                  {format === "mp3" ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  Convert to {format.toUpperCase()}
                </Button>
              </motion.form>
            )}

            {state === "converting" && (
              <motion.div
                key="converting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 flex flex-col items-center justify-center space-y-6"
              >
                <WaveVisualizer isActive={true} barCount={7} />
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-foreground font-medium">
                    {progress > 0 ? `Downloading... ${progress}%` : "Processing..."}
                  </span>
                </div>
                {progress > 0 && (
                  <div className="w-full max-w-xs bg-secondary/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-orange-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                <p className="text-muted-foreground text-sm">This may take a few moments</p>
              </motion.div>
            )}

            {state === "ready" && videoInfo && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 space-y-6"
              >
                <div className="flex items-center justify-center gap-3 text-accent">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Ready to download!</span>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center shrink-0">
                    {format === "mp3" ? <Music className="w-6 h-6 text-primary" /> : <Video className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{videoInfo.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {videoInfo.uploader} • {format.toUpperCase()} • {formatDuration(videoInfo.duration)}
                    </p>
                  </div>
                </div>

                {/* Format Toggle in Ready State */}
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("mp3")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      format === "mp3"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    MP3
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("mp4")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      format === "mp4"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    MP4
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="glass"
                    size="lg"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    Convert Another
                  </Button>
                  <Button
                    variant="vibrant"
                    size="lg"
                    className="flex-1"
                    onClick={handleDownload}
                  >
                    <Download className="w-5 h-5" />
                    Download {format.toUpperCase()}
                  </Button>
                </div>
              </motion.div>
            )}

            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 flex flex-col items-center justify-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                <div className="text-center space-y-2">
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-foreground"
                  >
                    Download Complete!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground"
                  >
                    Your {format.toUpperCase()} file has been saved
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="vibrant"
                    size="lg"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <PartyPopper className="w-5 h-5" />
                    Convert Another
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ConvertForm;

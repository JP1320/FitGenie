"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StepShell from "../flow/StepShell";
import { useFitStore } from "@/lib/state";

export default function ScannerScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const store = useFitStore();

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const capture = async () => {
    const v = videoRef.current!;
    const c = canvasRef.current!;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    const photo = c.toDataURL("image/jpeg");
    setLoading(true);
    setTimeout(() => {
      store.set({
        scan: {
          photo,
          height: "172 cm",
          proportions: "Balanced",
          recommendedSize: "M",
          fitType: "Regular"
        }
      });
      setLoading(false);
      router.push("/flow/6");
    }, 3500);
  };

  return (
    <StepShell step={5} title="AI Fit Scanner">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl border border-white/20" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-3 mt-4">
        <button className="px-4 py-2 rounded-xl bg-cyan-500" onClick={start}>Allow Camera</button>
        <button className="px-4 py-2 rounded-xl bg-indigo-500" onClick={capture}>Capture</button>
      </div>
      {loading && <div className="mt-4 text-white/80 animate-pulse">Analyzing fit...</div>}
    </StepShell>
  );
}

import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { useFlowStore } from "../store/useFlowStore";

export default function Scanner() {
  const nav = useNavigate();
  const { patch } = useFlowStore();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }, audio: false
    });
    videoRef.current.srcObject = stream;
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const photo = canvas.toDataURL("image/jpeg");

    setLoading(true);
    setTimeout(() => {
      patch({
        scanResult: {
          photo,
          detectedHeight: "172 cm",
          bodyProportion: "Balanced",
          recommendedSize: "M",
          fitType: "Regular"
        }
      });
      setLoading(false);
      nav("/store");
    }, 3500);
  }

  return (
    <StepShell step={5} title="AI Fit Scanner" className="bg-scanner">
      <p>Use back camera for better precision.</p>
      <video ref={videoRef} autoPlay playsInline className="video" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="row">
        <button className="btn" onClick={startCamera}>Allow Camera</button>
        <button className="btn" onClick={capture}>Capture</button>
        <button className="btn ghost" onClick={() => nav("/store")}>Skip</button>
      </div>
      {loading && <p className="pulse">Analyzing your fit...</p>}
    </StepShell>
  );
}

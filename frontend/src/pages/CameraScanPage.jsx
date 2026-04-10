import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

export default function CameraScanPage() {
  const nav = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [err, setErr] = useState("");
  const [streaming, setStreaming] = useState(false);
  const { patch } = useFlowStore();

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (e) {
      setErr("Camera access denied or unavailable.");
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Mock detected output (replace with real CV service later)
    patch({
      scanResult: {
        detectedHeightCm: 172,
        bodyProportion: "Balanced",
        recommendedSize: "M",
        fitType: "Regular",
        imageCaptured: true
      }
    });
    stopCamera();
    nav("/guided-filters");
  }

  return (
    <PageShell className="bg-camera">
      <section className="card">
        <h2>AI Fit Scanner</h2>
        <p>Please use back camera for better precision.</p>
        {err && <p className="error">{err}</p>}

        <div className="cameraWrap">
          <video ref={videoRef} autoPlay playsInline className="video" />
          <canvas ref={canvasRef} className="canvasHidden" />
        </div>

        <div className="actions">
          {!streaming ? <button className="btn" onClick={startCamera}>Allow Camera</button> : (
            <>
              <button className="btn" onClick={capture}>Capture</button>
              <button className="btn ghost" onClick={stopCamera}>Stop</button>
            </>
          )}
          <button className="btn ghost" onClick={() => nav("/guided-filters")}>Skip Scanner</button>
        </div>
      </section>
    </PageShell>
  );
}

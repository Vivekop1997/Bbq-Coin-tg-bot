import { useEffect, useRef, useState } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4";

const POSTER_URL = `${import.meta.env.BASE_URL}hero-poster.jpg`;
const LOCAL_VIDEO = `${import.meta.env.BASE_URL}hero.mp4`;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return clamp(window.scrollY / max);
}

function seekVideo(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve, reject) => {
    if (!Number.isFinite(time)) {
      resolve();
      return;
    }
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("seek failed"));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = Math.max(0, time);
  });
}

export default function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const smoothedRef = useRef(0);
  const cacheReadyRef = useRef(false);
  const lastSeekRef = useRef(-999);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const srcRef = useRef(VIDEO_URL);

  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [cacheReady, setCacheReady] = useState(false);
  const [videoSrc, setVideoSrc] = useState(VIDEO_URL);

  useEffect(() => {
    srcRef.current = videoSrc;
  }, [videoSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const target = scrollProgress();
      smoothedRef.current += (target - smoothedRef.current) * 0.12;
      const smoothed = smoothedRef.current;

      const frames = framesRef.current;
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (cacheReadyRef.current && frames.length > 0 && canvas) {
        const ctx = canvas.getContext("2d");
        const { w, h, dpr } = sizeRef.current;
        if (ctx && w && h) {
          const idx = clamp(
            Math.round(smoothed * (frames.length - 1)),
            0,
            frames.length - 1,
          );
          const frame = frames[idx];
          if (frame) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            const scale = Math.max(w / frame.width, h / frame.height);
            const dw = frame.width * scale;
            const dh = frame.height * scale;
            const dx = (w - dw) / 2;
            const dy = (h - dh) / 2;
            ctx.drawImage(frame, dx, dy, dw, dh);
          }
        }
      } else if (video && video.duration && Number.isFinite(video.duration)) {
        const nextTime = smoothed * (video.duration - 0.05);
        if (
          Math.abs(nextTime - lastSeekRef.current) > 0.04 &&
          video.readyState >= 2
        ) {
          lastSeekRef.current = nextTime;
          video.currentTime = Math.max(0, nextTime);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const visible = videoRef.current;
    if (!visible) return;

    let cancelled = false;
    let offscreen: HTMLVideoElement | null = null;
    let started = false;

    const markFrame = () => {
      setHasVideoFrame(true);
    };

    const extract = async () => {
      if (started || cancelled) return;
      started = true;
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (cancelled) return;

      offscreen = document.createElement("video");
      offscreen.muted = true;
      offscreen.playsInline = true;
      offscreen.preload = "auto";
      offscreen.crossOrigin = "anonymous";
      offscreen.src = srcRef.current;

      try {
        await new Promise<void>((resolve, reject) => {
          offscreen!.addEventListener("loadeddata", () => resolve(), {
            once: true,
          });
          offscreen!.addEventListener(
            "error",
            () => reject(new Error("offscreen load failed")),
            { once: true },
          );
        });
        if (cancelled) return;

        const duration = offscreen.duration;
        if (!duration || !Number.isFinite(duration)) return;

        const frameCount = Math.min(
          90,
          Math.max(24, Math.floor(duration * 12)),
        );
        const maxWidth = 960;
        const scale = Math.min(1, maxWidth / Math.max(offscreen.videoWidth, 1));
        const width = Math.max(1, Math.round(offscreen.videoWidth * scale));
        const height = Math.max(1, Math.round(offscreen.videoHeight * scale));

        const scratch = document.createElement("canvas");
        scratch.width = width;
        scratch.height = height;
        const ctx = scratch.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const frames: ImageBitmap[] = [];
        for (let i = 0; i < frameCount; i++) {
          if (cancelled) break;
          const time = (i / Math.max(frameCount - 1, 1)) * duration;
          await seekVideo(offscreen, time);
          ctx.drawImage(offscreen, 0, 0, width, height);
          frames.push(await createImageBitmap(scratch));
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        if (!cancelled && frames.length > 0) {
          framesRef.current = frames;
          cacheReadyRef.current = true;
          setCacheReady(true);
        }
      } catch {
        // Seek fallback on the visible <video> remains active.
      }
    };

    const onLoadedData = () => {
      markFrame();
      void extract();
    };

    if (visible.readyState >= 2) {
      onLoadedData();
    } else {
      visible.addEventListener("loadeddata", onLoadedData);
    }

    return () => {
      cancelled = true;
      visible.removeEventListener("loadeddata", onLoadedData);
      framesRef.current.forEach((frame) => frame.close());
      framesRef.current = [];
      cacheReadyRef.current = false;
      if (offscreen) {
        offscreen.removeAttribute("src");
        offscreen.load();
      }
    };
  }, [videoSrc]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a]">
      <img
        src={POSTER_URL}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          hasVideoFrame || cacheReady ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setHasVideoFrame(true)}
        onError={() => {
          if (videoSrc !== LOCAL_VIDEO) {
            setVideoSrc(LOCAL_VIDEO);
          }
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          hasVideoFrame && !cacheReady ? "opacity-100" : "opacity-0"
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          cacheReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

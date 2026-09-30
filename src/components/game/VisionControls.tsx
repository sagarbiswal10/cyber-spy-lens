import { useEffect, useRef } from "react";
import { Camera, CameraOff, Eye, Hand, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nearestNode } from "@/game/screen";
import { useGame } from "@/game/store";
import { useVision } from "@/game/vision";

type Landmark = { x: number; y: number; z: number };
type Category = { categoryName: string; score: number };

const WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function score(categories: Category[] | undefined, name: string) {
  return categories?.find((category) => category.categoryName === name)?.score ?? 0;
}

export function VisionControls() {
  const vision = useVision();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(false);

  const stop = () => {
    runningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    useVision.getState().setStatus("off", "Camera controls are off");
    useVision.getState().setTracking({ handVisible: false, faceVisible: false, cursor: null, gesture: "Mouse controls ready" });
  };

  useEffect(() => stop, []);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      vision.setStatus("unavailable", "Camera access is unavailable. Mouse and keyboard still work.");
      return;
    }
    vision.setStatus("loading", "Loading private on-device tracking…");
    try {
      const [{ FilesetResolver, HandLandmarker, FaceLandmarker }, stream] = await Promise.all([
        import("@mediapipe/tasks-vision"),
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false }),
      ]);
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      const files = await FilesetResolver.forVisionTasks(WASM_ROOT);
      const [hands, face] = await Promise.all([
        HandLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: "/models/hand_landmarker.task", delegate: "GPU" }, runningMode: "VIDEO", numHands: 1, minHandDetectionConfidence: 0.55, minTrackingConfidence: 0.5 }),
        FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: "/models/face_landmarker.task", delegate: "GPU" }, runningMode: "VIDEO", numFaces: 1, outputFaceBlendshapes: true, minFaceDetectionConfidence: 0.55, minTrackingConfidence: 0.5 }),
      ]);
      runningRef.current = true;
      vision.setStatus("ready", "Tracking locally — no video is saved or uploaded");
      let lastFrame = 0;
      let lastPinch = 0;
      let lastL = 0;
      let pinchDown = false;
      let blinkDown = false;
      let smoothX = 0.5;
      let smoothY = 0.5;

      const loop = (now: number) => {
        if (!runningRef.current) return;
        requestAnimationFrame(loop);
        if (now - lastFrame < 75 || video.readyState < 2) return;
        lastFrame = now;
        const handResult = hands.detectForVideo(video, now);
        const faceResult = face.detectForVideo(video, now);
        const landmarks = handResult.landmarks[0] as Landmark[] | undefined;
        const shapes = faceResult.faceBlendshapes[0]?.categories as Category[] | undefined;
        let gesture = "Show an open hand to steer";
        let cursor: { x: number; y: number } | null = null;
        let handVisible = false;
        let faceVisible = Boolean(faceResult.faceLandmarks.length);

        if (landmarks?.[4] && landmarks[8] && landmarks[5] && landmarks[9] && landmarks[12] && landmarks[17]) {
          handVisible = true;
          smoothX += ((1 - landmarks[8].x) - smoothX) * 0.25;
          smoothY += (landmarks[8].y - smoothY) * 0.25;
          cursor = { x: smoothX, y: smoothY };
          const palm = Math.max(0.03, distance(landmarks[5], landmarks[17]));
          const isPinch = distance(landmarks[4], landmarks[8]) / palm < 0.42;
          const isL = distance(landmarks[4], landmarks[8]) / palm > 1.05 && distance(landmarks[5], landmarks[8]) / palm > 0.75 && distance(landmarks[9], landmarks[12]) / palm < 0.72;
          useVision.getState().setTracking({ yaw: (smoothX - 0.5) * Math.PI * 2, pitch: 0.45 + smoothY * 0.85 });
          if (isPinch) gesture = "PINCH · investigate";
          else if (isL) gesture = "L SHAPE · zoom sequence";
          else gesture = "OPEN HAND · 360° view";

          if (isPinch && !pinchDown && now - lastPinch > 650) {
            if (now - lastL < 1300) {
              useVision.getState().zoomBy(7);
              gesture = "ZOOM OUT";
            } else {
              const id = nearestNode(smoothX, smoothY, 0.13);
              if (id !== null) {
                useGame.getState().select(id);
                queueMicrotask(() => useGame.getState().investigate());
              }
            }
            lastPinch = now;
          }
          if (isL && now - lastL > 650) {
            if (now - lastPinch < 1300) {
              useVision.getState().zoomBy(-7);
              gesture = "ZOOM IN";
            }
            lastL = now;
          }
          pinchDown = isPinch;
        } else if (faceResult.faceLandmarks[0]) {
          const points = faceResult.faceLandmarks[0] as Landmark[];
          const left = points[234];
          const right = points[454];
          const nose = points[1];
          if (left && right && nose) {
            const center = (left.x + right.x) / 2;
            useVision.getState().setTracking({ yaw: useVision.getState().yaw + (center - nose.x) * 0.16, pitch: Math.max(0.4, Math.min(1.35, useVision.getState().pitch + (nose.y - 0.5) * 0.035)) });
            gesture = "HEAD TRACKING · 360° view";
          }
        }

        const blinking = score(shapes, "eyeBlinkLeft") > 0.58 && score(shapes, "eyeBlinkRight") > 0.58;
        if (blinking && !blinkDown) {
          useGame.getState().isolate();
          gesture = "BLINK · isolate";
        }
        blinkDown = blinking;
        useVision.getState().setTracking({ handVisible, faceVisible, cursor, gesture });
      };
      requestAnimationFrame(loop);
    } catch {
      stop();
      useVision.getState().setStatus("unavailable", "Camera permission or tracking failed. Mouse and keyboard still work.");
    }
  };

  return <>
    <video ref={videoRef} className="vision-video" muted playsInline aria-hidden="true" />
    <div className="panel pointer-events-auto fixed right-3 top-16 z-20 w-64 p-3 font-mono sm:right-4 sm:top-20">
      <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-[11px] uppercase text-primary"><ScanFace className="size-4"/>Vision controls</div>{vision.status === "ready" ? <Button size="icon" variant="ghost" onClick={stop} aria-label="Turn camera controls off" title="Turn camera controls off"><CameraOff/></Button> : <Button size="sm" variant="secondary" onClick={start} disabled={vision.status === "loading"}><Camera/>Enable</Button>}</div>
      <div className="mt-2 text-[10px] leading-4 text-muted-foreground">{vision.message}</div>
      {vision.status === "ready" && <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]"><span className={vision.handVisible ? "text-success" : "text-muted-foreground"}><Hand className="mr-1 inline size-3"/>HAND</span><span className={vision.faceVisible ? "text-success" : "text-muted-foreground"}><Eye className="mr-1 inline size-3"/>FACE</span><strong className="col-span-2 text-warning">{vision.gesture}</strong></div>}
    </div>
    {vision.cursor && vision.status === "ready" && <div className="gesture-cursor" style={{ left: `${vision.cursor.x * 100}%`, top: `${vision.cursor.y * 100}%` }}><span /></div>}
  </>;
}
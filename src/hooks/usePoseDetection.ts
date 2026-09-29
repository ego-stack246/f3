import { useRef, useState, useEffect, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  POSE_CONNECTIONS,
  POSE_LANDMARKS,
  calculateAngle,
  calculateSpineLean,
  getBilateralAngle,
  analyzePosture,
  type ExerciseType,
  type PostureResult,
  type Point3D,
} from '../lib/poseAnalysis';
import { getExerciseKeyframes } from '../data/exerciseKeyframes';
import type { JointPositions } from '../components/exercise/ExerciseFigure';

export interface UsePoseDetectionOptions {
  exercise: ExerciseType;
  enabled: boolean;
}

export interface SessionStats {
  reps: number;
  postureScore: number;
  elapsedSeconds: number;
  calories: number;
}

export interface UsePoseDetectionReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  postureResult: PostureResult | null;
  isLoading: boolean;
  isCameraReady: boolean;
  error: string | null;
  landmarks: Point3D[][] | null;
  stats: SessionStats;
  resetStats: () => void;
}

export function usePoseDetection({ exercise, enabled }: UsePoseDetectionOptions): UsePoseDetectionReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(-1);
  const lastSpeechTimeRef = useRef<number>(0);
  const lastRepTimeRef = useRef<number>(0);
  const inflectionDwellRef = useRef<number>(0);

  // Landmark temporal smoothing cache (Dynamic EMA filter)
  const smoothedLandmarksRef = useRef<Point3D[] | null>(null);

  // Audio configuration
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = useCallback(
    (text: string, isPriority = false) => {
      if (!synth) return;
      const now = Date.now();
      // Throttle speech to avoid overlapping/spamming (every 3s for corrective feedback; immediate for rep counts)
      if (!isPriority && now - lastSpeechTimeRef.current < 3000) return;

      if (synth.speaking) synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = isPriority ? 1.15 : 1.0;
      utterance.pitch = 1.0;

      const voices = synth.getVoices();
      const voice =
        voices.find((v) => v.lang.startsWith('en') && v.name.includes('Female')) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;

      synth.speak(utterance);
      lastSpeechTimeRef.current = now;
    },
    [synth]
  );

  // Rep & Posture tracking refs
  const repStateRef = useRef<'up' | 'down'>('up');
  const repsRef = useRef<number>(0);
  const goodFramesRef = useRef<number>(0);
  const totalFramesRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [postureResult, setPostureResult] = useState<PostureResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Point3D[][] | null>(null);

  const [stats, setStats] = useState<SessionStats>({
    reps: 0,
    postureScore: 100,
    elapsedSeconds: 0,
    calories: 0,
  });

  const resetStats = useCallback(() => {
    repsRef.current = 0;
    goodFramesRef.current = 0;
    totalFramesRef.current = 0;
    repStateRef.current = 'up';
    inflectionDwellRef.current = 0;
    startTimeRef.current = Date.now();
    lastSpeechTimeRef.current = 0;
    lastRepTimeRef.current = 0;
    smoothedLandmarksRef.current = null;
    setStats({ reps: 0, postureScore: 100, elapsedSeconds: 0, calories: 0 });
    if (synth) synth.cancel();
  }, [synth]);

  // Timer effect for elapsed active seconds
  useEffect(() => {
    if (!enabled || !isCameraReady) return;
    if (startTimeRef.current === 0) startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setStats((prev) => ({
        ...prev,
        elapsedSeconds: elapsed,
        calories: Math.round(repsRef.current * 1.2 + elapsed * 0.15),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, isCameraReady]);

  /**
   * Landmark Smoothing Filter:
   * Smooths jitter using an adaptive velocity-responsive EMA.
   * High alpha for rapid intentional motion, low alpha for holding still.
   */
  const smoothLandmarks = useCallback((raw: Point3D[]): Point3D[] => {
    if (!smoothedLandmarksRef.current || smoothedLandmarksRef.current.length !== raw.length) {
      smoothedLandmarksRef.current = raw.map((p) => ({ ...p }));
      return raw;
    }

    const prev = smoothedLandmarksRef.current;
    const result: Point3D[] = new Array(raw.length);

    for (let i = 0; i < raw.length; i++) {
      const r = raw[i];
      const p = prev[i];

      const dx = r.x - p.x;
      const dy = r.y - p.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      // Dynamic smoothing factor: faster movement = higher responsiveness
      let alpha = 0.55;
      if (velocity > 0.04) {
        alpha = 0.85; // fast motion: track immediately
      } else if (velocity < 0.008) {
        alpha = 0.28; // still: maximum noise suppression
      }

      const smoothedX = p.x + alpha * dx;
      const smoothedY = p.y + alpha * dy;
      const smoothedZ = (p.z ?? 0) + alpha * ((r.z ?? 0) - (p.z ?? 0));

      result[i] = {
        x: smoothedX,
        y: smoothedY,
        z: smoothedZ,
        visibility: r.visibility,
      };
    }

    smoothedLandmarksRef.current = result;
    return result;
  }, []);

  /**
   * Robust Repetition Detector with Schmitt-Trigger Hysteresis & False Positive Guard
   */
  const checkRepetition = useCallback(
    (lm: Point3D[], exType: ExerciseType) => {
      if (!lm || lm.length === 0) return;

      const previousReps = repsRef.current;
      const now = performance.now();

      // Enforce minimum cycle time of 600ms between completed reps to prevent double counts
      const timeSinceLastRep = now - lastRepTimeRef.current;

      if (exType === 'squat') {
        const knee = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
          [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]
        ).angle;

        if (knee <= 105) {
          inflectionDwellRef.current += 1;
          if (inflectionDwellRef.current >= 2 && repStateRef.current === 'up') {
            repStateRef.current = 'down';
          }
        } else if (knee >= 155) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 600) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
            inflectionDwellRef.current = 0;
          }
        }
      } else if (exType === 'push_up') {
        const spineLean = calculateSpineLean(lm);
        if (spineLean > 45) {
          const elbow = getBilateralAngle(
            lm,
            [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
            [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
          ).angle;

          if (elbow <= 90) {
            inflectionDwellRef.current += 1;
            if (inflectionDwellRef.current >= 2 && repStateRef.current === 'up') {
              repStateRef.current = 'down';
            }
          } else if (elbow >= 150) {
            if (repStateRef.current === 'down' && timeSinceLastRep > 600) {
              repsRef.current += 1;
              lastRepTimeRef.current = now;
              repStateRef.current = 'up';
              inflectionDwellRef.current = 0;
            }
          }
        } else {
          repStateRef.current = 'up';
          inflectionDwellRef.current = 0;
        }
      } else if (exType === 'bicep_curl') {
        const elbow = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
          [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
        ).angle;

        if (elbow <= 65) {
          inflectionDwellRef.current += 1;
          if (inflectionDwellRef.current >= 2 && repStateRef.current === 'up') {
            repStateRef.current = 'down';
          }
        } else if (elbow >= 140) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 600) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
            inflectionDwellRef.current = 0;
          }
        }
      } else if (exType === 'overhead_press' || exType === 'standing_stretch') {
        const arm = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
          [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
        ).angle;

        if (arm >= 150) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 600) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        } else if (arm <= 85) {
          repStateRef.current = 'down';
        }
      } else if (exType === 'lunge') {
        const knee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
        if (knee <= 95) {
          inflectionDwellRef.current += 1;
          if (inflectionDwellRef.current >= 2 && repStateRef.current === 'up') {
            repStateRef.current = 'down';
          }
        } else if (knee >= 155) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 650) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
            inflectionDwellRef.current = 0;
          }
        }
      } else if (exType === 'jumping_jack') {
        const arm = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
          [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
        ).angle;

        if (arm >= 135) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 450) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        } else if (arm <= 55) {
          repStateRef.current = 'down';
        }
      } else if (exType === 'crunch') {
        const crunch = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE]);
        if (crunch <= 95) {
          if (repStateRef.current === 'up') repStateRef.current = 'down';
        } else if (crunch >= 130) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 600) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        }
      } else if (exType === 'bench_press') {
        const elbow = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
          [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
        ).angle;

        if (elbow <= 85) {
          if (repStateRef.current === 'up') repStateRef.current = 'down';
        } else if (elbow >= 150) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 600) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        }
      } else if (exType === 'deadlift') {
        const knee = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
          [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]
        ).angle;

        if (knee <= 115) {
          if (repStateRef.current === 'up') repStateRef.current = 'down';
        } else if (knee >= 160) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 700) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        }
      } else if (exType === 'pull_up') {
        const elbow = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
          [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
        ).angle;

        if (elbow <= 80) {
          if (repStateRef.current === 'down') {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        } else if (elbow >= 150) {
          repStateRef.current = 'down';
        }
      } else if (exType === 'side_arm_raise') {
        const arm = getBilateralAngle(
          lm,
          [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
          [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
        ).angle;

        if (arm >= 75) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 600) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        } else if (arm <= 35) {
          repStateRef.current = 'down';
        }
      } else if (exType === 'calf_raise') {
        const ankleY = lm[POSE_LANDMARKS.LEFT_ANKLE]?.y ?? 0;
        const toeY = lm[POSE_LANDMARKS.LEFT_FOOT_INDEX]?.y ?? 0;
        if (ankleY < toeY - 0.015 && repStateRef.current === 'up') {
          repStateRef.current = 'down';
        } else if (ankleY >= toeY && repStateRef.current === 'down') {
          if (timeSinceLastRep > 600) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        }
      } else if (exType === 'punches') {
        const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
        const rightElbow = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);

        if (leftElbow > 148 || rightElbow > 148) {
          if (repStateRef.current === 'down' && timeSinceLastRep > 350) {
            repsRef.current += 1;
            lastRepTimeRef.current = now;
            repStateRef.current = 'up';
          }
        } else if (leftElbow < 115 && rightElbow < 115) {
          repStateRef.current = 'down';
        }
      } else if (exType === 'arm_circles') {
        // Continuous isometric movement: 1 rep awarded every 30 good frames (~1 second)
        if (goodFramesRef.current > 0 && goodFramesRef.current % 30 === 0) {
          repsRef.current += 1;
        }
      } else {
        // General isometric posture hold: 1 rep awarded every 120 good frames (~4 seconds)
        if (goodFramesRef.current > 0 && goodFramesRef.current % 120 === 0) {
          repsRef.current += 1;
        }
      }

      if (repsRef.current > previousReps) {
        speak(repsRef.current.toString(), true);
      }
    },
    [speak]
  );

  // Initialize PoseLandmarker with resilient fallback (GPU -> CPU)
  const initPoseLandmarker = useCallback(async () => {
    if (poseLandmarkerRef.current) return;
    setIsLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      let landmarker: PoseLandmarker;
      try {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
      } catch {
        // Fallback to CPU delegate if WebGL/GPU is not supported
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
      }
      poseLandmarkerRef.current = landmarker;
    } catch (e) {
      console.error('Failed to load PoseLandmarker:', e);
      setError('Failed to load AI model. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => setIsCameraReady(true);
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions in your browser.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, []);

  // Draw skeleton on canvas
  const drawSkeleton = useCallback(
    (detectedLandmarks: Point3D[]) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const result = analyzePosture(detectedLandmarks, exercise);
      const color = result.isCorrect ? '#4ade80' : '#f87171';
      const bgColor = result.isCorrect ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)';

      // --- Draw Target "Ghost" Skeleton ---
      try {
        const targetData = getExerciseKeyframes(exercise);
        const targetFrame =
          targetData.keyframes[repStateRef.current === 'down' ? 1 : 0] || targetData.keyframes[0];

        // Find user bounding box for scaling
        let minX = 1,
          maxX = 0,
          minY = 1,
          maxY = 0;
        for (const lm of detectedLandmarks) {
          if ((lm.visibility ?? 0) > 0.45) {
            if (lm.x < minX) minX = lm.x;
            if (lm.x > maxX) maxX = lm.x;
            if (lm.y < minY) minY = lm.y;
            if (lm.y > maxY) maxY = lm.y;
          }
        }

        const scaleX = maxX - minX || 1;
        const scaleY = maxY - minY || 1;
        const offsetX = minX;
        const offsetY = minY;

        // Map normalized 0-100 ghost coords to user scale
        const getGhostPoint = (jointName: keyof JointPositions) => {
          const pt = targetFrame[jointName];
          return {
            x: ((pt.x / 100) * scaleX + offsetX) * canvas.width,
            y: ((pt.y / 100) * scaleY + offsetY) * canvas.height,
          };
        };

        const GHOST_CONNECTIONS: [keyof JointPositions, keyof JointPositions][] = [
          ['head', 'lShoulder'],
          ['head', 'rShoulder'],
          ['lShoulder', 'rShoulder'],
          ['lShoulder', 'lElbow'],
          ['lElbow', 'lWrist'],
          ['rShoulder', 'rElbow'],
          ['rElbow', 'rWrist'],
          ['lShoulder', 'lHip'],
          ['rShoulder', 'rHip'],
          ['lHip', 'rHip'],
          ['lHip', 'lKnee'],
          ['lKnee', 'lAnkle'],
          ['rHip', 'rKnee'],
          ['rKnee', 'rAnkle'],
        ];

        // Draw Ghost Connections
        ctx.globalAlpha = 0.25;
        for (const [startIdx, endIdx] of GHOST_CONNECTIONS) {
          const start = getGhostPoint(startIdx);
          const end = getGhostPoint(endIdx);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      } catch {
        // Fallback if ghost keyframe is absent
      }

      // --- Draw Real User Skeleton ---
      for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
        const start = detectedLandmarks[startIdx];
        const end = detectedLandmarks[endIdx];
        if (!start || !end) continue;
        if ((start.visibility ?? 0) < 0.45 || (end.visibility ?? 0) < 0.45) continue;

        ctx.beginPath();
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Draw Landmarks with error coloring
      const metricMap = new Map(result.metrics.map((m) => [m.label.toLowerCase(), m.good]));

      for (let i = 0; i < detectedLandmarks.length; i++) {
        const lm = detectedLandmarks[i];
        if ((lm.visibility ?? 0) < 0.45) continue;

        let jointColor = color;
        if (i === POSE_LANDMARKS.LEFT_KNEE || i === POSE_LANDMARKS.RIGHT_KNEE) {
          if (metricMap.has('knee angle') && !metricMap.get('knee angle')) jointColor = '#f87171';
        } else if (i === POSE_LANDMARKS.LEFT_HIP || i === POSE_LANDMARKS.RIGHT_HIP) {
          if (metricMap.has('spine lean') && !metricMap.get('spine lean')) jointColor = '#f87171';
        }

        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5.5, 0, 2 * Math.PI);
        ctx.fillStyle = jointColor === '#f87171' ? 'rgba(248,113,113,0.3)' : bgColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = jointColor;
        ctx.fill();
      }
    },
    [exercise]
  );

  // Detection loop
  const detectPose = useCallback(function loop() {
    const video = videoRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    if (!video || !poseLandmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(loop);
      return;
    }

    const now = performance.now();
    // Throttle to ~30 FPS for mobile thermal efficiency
    if (now - lastTimestampRef.current < 33) {
      animFrameRef.current = requestAnimationFrame(loop);
      return;
    }
    lastTimestampRef.current = now;

    try {
      const result = poseLandmarker.detectForVideo(video, now);
      if (result.landmarks && result.landmarks.length > 0) {
        const rawLm = result.landmarks[0] as Point3D[];
        // Apply temporal smoothing to eliminate frame jitter
        const lm = smoothLandmarks(rawLm);

        setLandmarks(result.landmarks as Point3D[][]);
        drawSkeleton(lm);

        const res = analyzePosture(lm, exercise);
        setPostureResult(res);

        // Update Reps & Posture quality stats
        totalFramesRef.current += 1;
        if (res.isCorrect) goodFramesRef.current += 1;

        checkRepetition(lm, exercise);

        if (!res.isCorrect && res.feedback) {
          speak(res.feedback, false);
        }

        const postureScore =
          totalFramesRef.current > 0
            ? Math.round((goodFramesRef.current / totalFramesRef.current) * 100)
            : 100;

        setStats((prev) => ({
          ...prev,
          reps: repsRef.current,
          postureScore,
        }));
      }
    } catch {
      // Ignore transient timestamp non-monotonicity
    }

    animFrameRef.current = requestAnimationFrame(loop);
  }, [exercise, drawSkeleton, smoothLandmarks, checkRepetition, speak]);

  // Lifecycle: start/stop based on `enabled`
  useEffect(() => {
    if (enabled) {
      resetStats();
      initPoseLandmarker().then(() => {
        startCamera();
      });
    } else {
      cancelAnimationFrame(animFrameRef.current);
      stopCamera();
      setPostureResult(null);
      setLandmarks(null);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, initPoseLandmarker, startCamera, stopCamera, resetStats]);

  // Start detection loop when camera is ready
  useEffect(() => {
    if (enabled && isCameraReady && poseLandmarkerRef.current) {
      animFrameRef.current = requestAnimationFrame(detectPose);
    }
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, isCameraReady, detectPose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      stopCamera();
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
        poseLandmarkerRef.current = null;
      }
    };
  }, [stopCamera]);

  return { videoRef, canvasRef, postureResult, isLoading, isCameraReady, error, landmarks, stats, resetStats };
}

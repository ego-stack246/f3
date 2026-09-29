import { useRef, useState, useEffect, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  POSE_CONNECTIONS,
  POSE_LANDMARKS,
  calculateAngle,
  calculateSpineLean,
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
  
  // Audio configuration
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = useCallback((text: string) => {
    if (!synth) return;
    const now = Date.now();
    // Throttle speech to avoid overlapping/spamming (every 3 seconds for non-rep feedback)
    if (now - lastSpeechTimeRef.current < 2500) return;
    
    // Check if speaking
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Try to find an English voice, preferably female as it often sounds friendlier
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) 
               || voices.find(v => v.lang.startsWith('en'));
    if (voice) {
      utterance.voice = voice;
    }

    synth.speak(utterance);
    lastSpeechTimeRef.current = now;
  }, [synth]);

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
    startTimeRef.current = Date.now();
    lastSpeechTimeRef.current = 0;
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

  // Rep detection state machine for ALL exercises
  const checkRepetition = useCallback((lm: Point3D[], exType: ExerciseType) => {
    if (!lm || lm.length === 0) return;
    
    let previousReps = repsRef.current;

    if (exType === 'squat') {
      const leftKnee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
      const rightKnee = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_KNEE], lm[POSE_LANDMARKS.RIGHT_ANKLE]);
      const avgKnee = (leftKnee + rightKnee) / 2;

      if (avgKnee < 110 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (avgKnee > 150 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'lunge') {
      const knee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
      if (knee < 105 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (knee > 155 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'jumping_jack') {
      const leftArm = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
      const rightArm = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_WRIST]);
      const avgArm = (leftArm + rightArm) / 2;

      if (avgArm > 140 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      } else if (avgArm < 70 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      }
    } else if (exType === 'crunch') {
      const crunchAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE]);
      if (crunchAngle < 95 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (crunchAngle > 130 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'bicep_curl') {
      const elbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
      if (elbow < 65 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (elbow > 135 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'overhead_press' || exType === 'standing_stretch') {
      const arm = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
      if (arm > 150 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      } else if (arm < 85 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      }
    } else if (exType === 'bench_press') {
      const elbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
      if (elbow < 85 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (elbow > 150 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'deadlift') {
      const knee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
      if (knee < 120 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (knee > 160 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'pull_up') {
      const elbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
      if (elbow < 80 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      } else if (elbow > 150 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      }
    } else if (exType === 'leg_raise') {
      const hip = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_ANKLE]);
      if (hip < 100 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (hip > 160 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'push_up') {
      const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
      const rightElbow = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
      const avgElbow = (leftElbow + rightElbow) / 2;
      const spineLean = calculateSpineLean(lm);
      
      // Only count if horizontal (not standing)
      if (spineLean > 50) {
        if (avgElbow < 85 && repStateRef.current === 'up') {
          repStateRef.current = 'down';
        } else if (avgElbow > 150 && repStateRef.current === 'down') {
          repsRef.current += 1;
          repStateRef.current = 'up';
        }
      } else {
        // Prevent accidental rep counts when standing by resetting state
        repStateRef.current = 'up';
      }
    } else if (exType === 'calf_raise') {
      const ankleY = lm[POSE_LANDMARKS.LEFT_ANKLE].y;
      const toeY = lm[POSE_LANDMARKS.LEFT_FOOT_INDEX].y;
      if (ankleY < toeY && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      } else if (ankleY >= toeY && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      }
    } else if (exType === 'side_arm_raise') {
      const leftArm = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
      const rightArm = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_WRIST]);
      const avgArm = (leftArm + rightArm) / 2;
      
      if (avgArm > 75 && repStateRef.current === 'down') {
        repsRef.current += 1;
        repStateRef.current = 'up';
      } else if (avgArm < 35 && repStateRef.current === 'up') {
        repStateRef.current = 'down';
      }
    } else if (exType === 'punches') {
      const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
      const rightElbow = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
      
      if (leftElbow > 145 || rightElbow > 145) {
        if (repStateRef.current === 'down') {
          repsRef.current += 1;
          repStateRef.current = 'up';
        }
      } else if (leftElbow < 120 && rightElbow < 120) {
        repStateRef.current = 'down';
      }
    } else if (exType === 'arm_circles') {
      // 1 rep credit for every 1 second of keeping arms extended and moving
      if (goodFramesRef.current > 0 && goodFramesRef.current % 30 === 0) {
        repsRef.current += 1;
      }
    } else {
      // General hold posture: Every 4 seconds of good form gives +1 rep credit
      if (goodFramesRef.current > 0 && goodFramesRef.current % 120 === 0) {
        repsRef.current += 1;
      }
    }

    if (repsRef.current > previousReps) {
       speak(repsRef.current.toString());
    }
  }, [speak]);

  // Initialize PoseLandmarker
  const initPoseLandmarker = useCallback(async () => {
    if (poseLandmarkerRef.current) return;
    setIsLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
    } catch (e) {
      console.error('Failed to load PoseLandmarker:', e);
      setError('Failed to load AI model. Check your connection.');
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
      setError('Camera access denied. Please allow camera permission.');
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
        const targetFrame = targetData.keyframes[repStateRef.current === 'down' ? 1 : 0] || targetData.keyframes[0];
        
        // Find user bounding box for scaling
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        for (const lm of detectedLandmarks) {
          if ((lm.visibility ?? 0) > 0.5) {
            if (lm.x < minX) minX = lm.x;
            if (lm.x > maxX) maxX = lm.x;
            if (lm.y < minY) minY = lm.y;
            if (lm.y > maxY) maxY = lm.y;
          }
        }
        
        const scaleX = (maxX - minX) || 1;
        const scaleY = (maxY - minY) || 1;
        const offsetX = minX;
        const offsetY = minY;

        // Map normalized 0-100 ghost coords to user scale
        const getGhostPoint = (jointName: keyof JointPositions) => {
          const pt = targetFrame[jointName];
          return {
            x: ((pt.x / 100) * scaleX + offsetX) * canvas.width,
            y: ((pt.y / 100) * scaleY + offsetY) * canvas.height
          };
        };

        const GHOST_CONNECTIONS: [keyof JointPositions, keyof JointPositions][] = [
          ['head', 'lShoulder'], ['head', 'rShoulder'], ['lShoulder', 'rShoulder'],
          ['lShoulder', 'lElbow'], ['lElbow', 'lWrist'], ['rShoulder', 'rElbow'], ['rElbow', 'rWrist'],
          ['lShoulder', 'lHip'], ['rShoulder', 'rHip'], ['lHip', 'rHip'],
          ['lHip', 'lKnee'], ['lKnee', 'lAnkle'], ['rHip', 'rKnee'], ['rKnee', 'rAnkle'],
        ];

        // Draw Ghost Connections
        ctx.globalAlpha = 0.3;
        for (const [startIdx, endIdx] of GHOST_CONNECTIONS) {
          const start = getGhostPoint(startIdx);
          const end = getGhostPoint(endIdx);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        
      } catch (e) {
        // Fallback if ghost logic fails
      }

      // --- Draw Real User Skeleton ---
      for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
        const start = detectedLandmarks[startIdx];
        const end = detectedLandmarks[endIdx];
        if (!start || !end) continue;
        if ((start.visibility ?? 0) < 0.5 || (end.visibility ?? 0) < 0.5) continue;

        ctx.beginPath();
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Draw landmarks with error coloring
      const metricMap = new Map(result.metrics.map(m => [m.label.toLowerCase(), m.good]));
      
      for (let i = 0; i < detectedLandmarks.length; i++) {
        const lm = detectedLandmarks[i];
        if ((lm.visibility ?? 0) < 0.5) continue;
        
        let jointColor = color;
        // Simple heuristic to color specific joints based on metrics
        if (i === POSE_LANDMARKS.LEFT_KNEE || i === POSE_LANDMARKS.RIGHT_KNEE) {
          if (metricMap.has('left knee') && !metricMap.get('left knee')) jointColor = '#f87171';
        } else if (i === POSE_LANDMARKS.LEFT_HIP || i === POSE_LANDMARKS.RIGHT_HIP) {
           if (metricMap.has('left hip') && !metricMap.get('left hip')) jointColor = '#f87171';
        }
        
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = jointColor === '#f87171' ? 'rgba(248,113,113,0.2)' : bgColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, 2 * Math.PI);
        ctx.fillStyle = jointColor;
        ctx.fill();
      }
    },
    [exercise]
  );

  // Detection loop
  const detectPose = useCallback(() => {
    const video = videoRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    if (!video || !poseLandmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const now = performance.now();
    // Throttle to ~30 FPS for smoothness & efficiency
    if (now - lastTimestampRef.current < 33) {
      animFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }
    lastTimestampRef.current = now;

    try {
      const result = poseLandmarker.detectForVideo(video, now);
      if (result.landmarks && result.landmarks.length > 0) {
        const lm = result.landmarks[0] as Point3D[];
        setLandmarks(result.landmarks as Point3D[][]);
        drawSkeleton(lm);

        const res = analyzePosture(lm, exercise);
        setPostureResult(res);

        // Update Reps & Posture quality stats
        totalFramesRef.current += 1;
        if (res.isCorrect) goodFramesRef.current += 1;

        checkRepetition(lm, exercise);

        if (!res.isCorrect && res.feedback) {
          // Add some context for the speech to make it sound natural
          speak(res.feedback);
        }

        const postureScore = totalFramesRef.current > 0
          ? Math.round((goodFramesRef.current / totalFramesRef.current) * 100)
          : 100;

        setStats((prev) => ({
          ...prev,
          reps: repsRef.current,
          postureScore,
        }));
      }
    } catch (e) {
      // Ignore timestamp non-monotonicity
    }

    animFrameRef.current = requestAnimationFrame(detectPose);
  }, [exercise, drawSkeleton, checkRepetition]);

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
      if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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

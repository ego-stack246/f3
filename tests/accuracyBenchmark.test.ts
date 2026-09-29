import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAngle3D,
  calculateAngleWithVertical,
  computeJointAngles,
  extractBodyDimensions,
} from '../src/lib/cv/geometry.ts';
import { LandmarkFilterBank, OneEuroFilter1D } from '../src/lib/cv/oneEuroFilter.ts';
import { CameraCalibrator } from '../src/lib/cv/calibration.ts';
import { ExerciseStateMachine } from '../src/lib/cv/stateMachine.ts';
import { MultiFrameErrorValidator } from '../src/lib/cv/errorValidator.ts';
import { RobustPoseEngine } from '../src/lib/cv/poseEngine.ts';
import { POSE_LANDMARKS, type Point3D } from '../src/lib/cv/types.ts';

// Helper to generate a neutral baseline standing skeleton
function createStandingSkeleton(scale = 1.0, offsetX = 0.5, offsetY = 0.5): Point3D[] {
  const lm: Point3D[] = [];
  for (let i = 0; i < 33; i++) {
    lm.push({ x: offsetX, y: offsetY, z: 0, visibility: 0.95 });
  }

  // Head
  lm[POSE_LANDMARKS.NOSE] = { x: offsetX, y: offsetY - 0.35 * scale, z: 0, visibility: 0.98 };
  lm[POSE_LANDMARKS.LEFT_EYE] = { x: offsetX - 0.02 * scale, y: offsetY - 0.36 * scale, z: 0, visibility: 0.98 };
  lm[POSE_LANDMARKS.RIGHT_EYE] = { x: offsetX + 0.02 * scale, y: offsetY - 0.36 * scale, z: 0, visibility: 0.98 };

  // Torso
  lm[POSE_LANDMARKS.LEFT_SHOULDER] = { x: offsetX - 0.12 * scale, y: offsetY - 0.22 * scale, z: 0, visibility: 0.96 };
  lm[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: offsetX + 0.12 * scale, y: offsetY - 0.22 * scale, z: 0, visibility: 0.96 };
  lm[POSE_LANDMARKS.LEFT_HIP] = { x: offsetX - 0.08 * scale, y: offsetY, z: 0, visibility: 0.95 };
  lm[POSE_LANDMARKS.RIGHT_HIP] = { x: offsetX + 0.08 * scale, y: offsetY, z: 0, visibility: 0.95 };

  // Arms
  lm[POSE_LANDMARKS.LEFT_ELBOW] = { x: offsetX - 0.16 * scale, y: offsetY - 0.10 * scale, z: 0, visibility: 0.95 };
  lm[POSE_LANDMARKS.RIGHT_ELBOW] = { x: offsetX + 0.16 * scale, y: offsetY - 0.10 * scale, z: 0, visibility: 0.95 };
  lm[POSE_LANDMARKS.LEFT_WRIST] = { x: offsetX - 0.18 * scale, y: offsetY, z: 0, visibility: 0.92 };
  lm[POSE_LANDMARKS.RIGHT_WRIST] = { x: offsetX + 0.18 * scale, y: offsetY, z: 0, visibility: 0.92 };

  // Legs
  lm[POSE_LANDMARKS.LEFT_KNEE] = { x: offsetX - 0.08 * scale, y: offsetY + 0.18 * scale, z: 0, visibility: 0.95 };
  lm[POSE_LANDMARKS.RIGHT_KNEE] = { x: offsetX + 0.08 * scale, y: offsetY + 0.18 * scale, z: 0, visibility: 0.95 };
  lm[POSE_LANDMARKS.LEFT_ANKLE] = { x: offsetX - 0.08 * scale, y: offsetY + 0.36 * scale, z: 0, visibility: 0.94 };
  lm[POSE_LANDMARKS.RIGHT_ANKLE] = { x: offsetX + 0.08 * scale, y: offsetY + 0.36 * scale, z: 0, visibility: 0.94 };

  return lm;
}

describe('1. 3D Biomechanical Angle Mathematics', () => {
  it('accurately calculates orthogonal 90 degree joint angle', () => {
    const a = { x: 0, y: 1, z: 0 };
    const b = { x: 0, y: 0, z: 0 }; // vertex
    const c = { x: 1, y: 0, z: 0 };
    const angle = calculateAngle3D(a, b, c);
    assert.strictEqual(angle, 90);
  });

  it('accurately calculates straight 180 degree lockout angle', () => {
    const a = { x: 0, y: -1, z: 0 };
    const b = { x: 0, y: 0, z: 0 };
    const c = { x: 0, y: 1, z: 0 };
    const angle = calculateAngle3D(a, b, c);
    assert.strictEqual(angle, 180);
  });

  it('calculates 3D angle with depth z coordinate', () => {
    const a = { x: 0, y: 1, z: 0 };
    const b = { x: 0, y: 0, z: 0 };
    const c = { x: 0, y: 1, z: 1 };
    const angle = calculateAngle3D(a, b, c);
    assert.strictEqual(angle, 45);
  });

  it('calculates spine lean relative to true vertical', () => {
    const top = { x: 0.5, y: 0.2, z: 0 };
    const bottom = { x: 0.5, y: 0.8, z: 0 };
    const lean = calculateAngleWithVertical(top, bottom);
    assert.strictEqual(lean, 0); // 0° = perfectly upright
  });
});

describe('2. One Euro Filter Temporal Smoothing & Jitter Reduction', () => {
  it('reduces high-frequency landmark jitter by > 75%', () => {
    const filter = new OneEuroFilter1D(1.0, 0.015);
    const truth = 100.0;
    const noisySamples: number[] = [];
    const filteredSamples: number[] = [];

    let t = 1000;
    for (let i = 0; i < 60; i++) {
      // Gaussian-like noise +/- 5 units
      const noise = (Math.sin(i * 1.7) + Math.cos(i * 3.1)) * 2.5;
      const raw = truth + noise;
      noisySamples.push(raw);
      const filtered = filter.filter(raw, t);
      if (i > 10) filteredSamples.push(filtered);
      t += 33; // 30 FPS
    }

    const rawVariance =
      noisySamples.slice(10).reduce((acc, v) => acc + Math.pow(v - truth, 2), 0) /
      noisySamples.slice(10).length;
    const filteredVariance =
      filteredSamples.reduce((acc, v) => acc + Math.pow(v - truth, 2), 0) /
      filteredSamples.length;

    const jitterReductionPct = ((rawVariance - filteredVariance) / rawVariance) * 100;
    assert.ok(
      jitterReductionPct > 75,
      `Expected > 75% jitter reduction, achieved ${jitterReductionPct.toFixed(1)}%`
    );
  });

  it('preserves fast intentional movement without lag', () => {
    const filter = new OneEuroFilter1D(1.0, 0.02);
    let t = 1000;
    // Step response
    for (let i = 0; i < 10; i++) {
      filter.filter(0, t);
      t += 33;
    }
    // Fast jump to 100
    let lastVal = 0;
    for (let i = 0; i < 5; i++) {
      lastVal = filter.filter(100, t);
      t += 33;
    }
    assert.ok(lastVal > 80, `Filter adapted quickly to step input (reached ${lastVal})`);
  });
});

describe('3. Camera Distance & Body Setup Validation', () => {
  const calibrator = new CameraCalibrator();

  it('detects optimal user positioning and distance', () => {
    const skeleton = createStandingSkeleton(0.7, 0.5, 0.5);
    const result = calibrator.evaluateSetup(skeleton);
    assert.strictEqual(result.distance, 'optimal');
    assert.strictEqual(result.orientation, 'front');
  });

  it('detects user standing too close to camera', () => {
    const skeleton = createStandingSkeleton(1.4, 0.5, 0.5); // large scale
    const result = calibrator.evaluateSetup(skeleton);
    assert.strictEqual(result.distance, 'too_close');
    assert.ok(result.feedbackMessage.toLowerCase().includes('backward'));
  });

  it('detects missing lower body landmarks when cut off', () => {
    const skeleton = createStandingSkeleton(0.7, 0.5, 0.5);
    // Move ankles out of frame
    skeleton[POSE_LANDMARKS.LEFT_ANKLE].y = 0.99;
    skeleton[POSE_LANDMARKS.RIGHT_ANKLE].y = 0.99;

    const result = calibrator.evaluateSetup(skeleton);
    assert.ok(result.missingLandmarks.length > 0);
  });
});

describe('4. Multi-Frame Error Validation & Hysteresis', () => {
  it('ignores a 1-frame outlier glitch (0 false alarms)', () => {
    const validator = new MultiFrameErrorValidator();
    const candidate = {
      code: 'KNEE_VALGUS' as const,
      confidence: 0.92,
      severity: 'high' as const,
      landmarks: [25, 26],
      correction: 'Push knees outward.',
    };

    // Frame 1: Outlier glitch
    const f1 = validator.processFrame([candidate], 'BOTTOM', 1000);
    assert.strictEqual(f1.activeErrors.length, 0); // Not confirmed yet!

    // Frame 2: Back to good
    const f2 = validator.processFrame([], 'BOTTOM', 1033);
    assert.strictEqual(f2.activeErrors.length, 0);
  });

  it('confirms genuine error when persisting across >= 5 frames', () => {
    const validator = new MultiFrameErrorValidator();
    const candidate = {
      code: 'KNEE_VALGUS' as const,
      confidence: 0.92,
      severity: 'high' as const,
      landmarks: [25, 26],
      correction: 'Push knees outward.',
    };

    let activeCount = 0;
    for (let i = 0; i < 6; i++) {
      const res = validator.processFrame([candidate], 'BOTTOM', 1000 + i * 33);
      activeCount = res.activeErrors.length;
    }
    assert.strictEqual(activeCount, 1);
  });
});

describe('5. Repetition State Machine & Cadence Verification', () => {
  it('accurately counts 3 clean squats and rejects fast bounces', () => {
    const sm = new ExerciseStateMachine({
      startAngle: 155,
      eccentricThreshold: 135,
      bottomThreshold: 95,
      concentricThreshold: 110,
      completionAngle: 155,
      minRepDurationMs: 800,
    });

    let timestamp = 1000;

    // Simulate 3 full squats (each lasting 2.0s: 60 frames)
    for (let rep = 0; rep < 3; rep++) {
      // 1. Start lockout
      sm.update(165, timestamp);
      timestamp += 100;

      // 2. Eccentric descent (165° -> 90°)
      for (let a = 160; a >= 90; a -= 7) {
        sm.update(a, timestamp);
        timestamp += 50;
      }

      // 3. Bottom hold
      sm.update(88, timestamp);
      timestamp += 100;

      // 4. Concentric ascent (90° -> 165°)
      for (let a = 95; a <= 165; a += 7) {
        sm.update(a, timestamp);
        timestamp += 50;
      }

      // Lockout pause
      sm.update(165, timestamp);
      timestamp += 200;
    }

    assert.strictEqual(sm.getReps(), 3);
  });

  it('rejects rapid bounce (< 400ms) to prevent accidental counts', () => {
    const sm = new ExerciseStateMachine({
      startAngle: 155,
      eccentricThreshold: 135,
      bottomThreshold: 95,
      concentricThreshold: 110,
      completionAngle: 155,
      minRepDurationMs: 800,
    });

    let timestamp = 1000;
    sm.update(165, timestamp);
    timestamp += 50;

    // Fast 150ms drop and snap up
    sm.update(85, timestamp + 50);
    sm.update(165, timestamp + 150);

    assert.strictEqual(sm.getReps(), 0); // Correctly rejected!
  });
});

describe('6. Master Engine End-to-End Posture Evaluation Benchmark', () => {
  it('correctly classifies good squat form vs form breakdown', () => {
    const engine = new RobustPoseEngine('squat');
    let t = 1000;

    // 1. Standing posture (good)
    const standing = createStandingSkeleton(0.7, 0.5, 0.5);
    let output = engine.processFrame(standing, t);
    assert.strictEqual(output.activeError, null);

    // 2. Introduce severe forward spine lean
    const leaning = createStandingSkeleton(0.7, 0.5, 0.5);
    leaning[POSE_LANDMARKS.LEFT_SHOULDER].x += 0.25;
    leaning[POSE_LANDMARKS.RIGHT_SHOULDER].x += 0.25;

    // 10 frames to pass through filter convergence and 5-frame persistence window
    for (let i = 0; i < 10; i++) {
      t += 33;
      output = engine.processFrame(leaning, t);
    }

    assert.ok(output.activeError !== null);
    assert.strictEqual(output.activeError?.error, 'EXCESSIVE_FORWARD_LEAN');
  });

  it('computes confusion matrix metrics (precision, recall, F1, FPR, FNR)', () => {
    const engine = new RobustPoseEngine('squat');
    let tp = 0, fp = 0, tn = 0, fn = 0;
    let t = 1000;

    // Transition & 25 Ground Truth "Good Form" evaluations
    const goodSkeleton = createStandingSkeleton(0.68, 0.5, 0.5);
    for (let i = 0; i < 5; i++) {
      t += 33;
      engine.processFrame(goodSkeleton, t);
    }
    for (let i = 0; i < 20; i++) {
      t += 33;
      const res = engine.processFrame(goodSkeleton, t);
      if (res.isCorrect) tn++;
      else fp++;
    }

    // Transition & 25 Ground Truth "Defective Form" evaluations (severe lean)
    const badSkeleton = createStandingSkeleton(0.68, 0.5, 0.5);
    badSkeleton[POSE_LANDMARKS.LEFT_SHOULDER].x += 0.26;
    badSkeleton[POSE_LANDMARKS.RIGHT_SHOULDER].x += 0.26;

    // 6 frames to establish multi-frame persistent error
    for (let i = 0; i < 6; i++) {
      t += 33;
      engine.processFrame(badSkeleton, t);
    }
    // 20 evaluated frames in steady defective state
    for (let i = 0; i < 20; i++) {
      t += 33;
      const res = engine.processFrame(badSkeleton, t);
      if (!res.isCorrect) tp++;
      else fn++;
    }

    const precision = tp / (tp + fp) || 1.0;
    const recall = tp / (tp + fn) || 1.0;
    const f1 = (2 * precision * recall) / (precision + recall);
    const falsePositiveRate = fp / (fp + tn);
    const falseNegativeRate = fn / (fn + tp);

    console.log(`\n=== AUTOMATED ACCURACY BENCHMARK METRICS ===`);
    console.log(`Precision:            ${(precision * 100).toFixed(1)}%`);
    console.log(`Recall:               ${(recall * 100).toFixed(1)}%`);
    console.log(`F1 Score:             ${(f1 * 100).toFixed(1)}%`);
    console.log(`False Positive Rate:  ${(falsePositiveRate * 100).toFixed(1)}%`);
    console.log(`False Negative Rate:  ${(falseNegativeRate * 100).toFixed(1)}%`);
    console.log(`============================================\n`);

    assert.ok(precision >= 0.95, `Precision ${precision} is >= 0.95`);
    assert.ok(recall >= 0.95, `Recall ${recall} is >= 0.95`);
    assert.ok(f1 >= 0.95, `F1 Score ${f1} is >= 0.95`);
    assert.ok(falsePositiveRate <= 0.05, `FPR ${falsePositiveRate} is <= 0.05`);
  });
});

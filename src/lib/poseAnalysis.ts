// MediaPipe Pose Landmark indices
// Reference: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// Connections for drawing the skeleton
export const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  // Left arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  // Right arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  // Left leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  // Right leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

export interface Point3D {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PostureResult {
  isCorrect: boolean;
  feedback: string;
  metrics: { label: string; value: string; good: boolean }[];
}

export type ExerciseType =
  | 'general_posture'
  | 'squat'
  | 'lunge'
  | 'plank'
  | 'tree_pose'
  | 'warrior_pose'
  | 'jumping_jack'
  | 'mountain_climber'
  | 'crunch'
  | 'russian_twist'
  | 'leg_raise'
  | 'heel_touch'
  | 'spine_twist'
  | 'standing_stretch'
  | 'bicep_curl'
  | 'overhead_press'
  | 'bench_press'
  | 'deadlift'
  | 'pull_up'
  | 'calf_raise'
  | 'push_up'
  | 'side_arm_raise'
  | 'arm_circles'
  | 'punches';

/**
 * Calculates high-precision angle (in degrees) formed at point B by lines BA and BC
 * with numerical stability clamping to prevent NaN errors.
 */
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  if (!a || !b || !c) return 0;
  const baX = a.x - b.x;
  const baY = a.y - b.y;
  const bcX = c.x - b.x;
  const bcY = c.y - b.y;

  const dot = baX * bcX + baY * bcY;
  const magBA = Math.sqrt(baX * baX + baY * baY);
  const magBC = Math.sqrt(bcX * bcX + bcY * bcY);
  if (magBA * magBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.round((Math.acos(cosAngle) * 180) / Math.PI);
}

/**
 * Adaptive Bilateral Joint Angle Calculator:
 * Dynamically identifies which side is more visible / facing the camera,
 * or computes a confidence-weighted average if both limbs are in clear view.
 */
export function getBilateralAngle(
  lm: Point3D[],
  leftIndices: [number, number, number],
  rightIndices: [number, number, number]
): { angle: number; side: 'left' | 'right' | 'both'; confidence: number } {
  const [la, lb, lc] = leftIndices;
  const [ra, rb, rc] = rightIndices;

  const pLA = lm[la], pLB = lm[lb], pLC = lm[lc];
  const pRA = lm[ra], pRB = lm[rb], pRC = lm[rc];

  if (!pLA || !pLB || !pLC || !pRA || !pRB || !pRC) {
    return { angle: 0, side: 'both', confidence: 0 };
  }

  const leftVis = ((pLA.visibility ?? 0.5) + (pLB.visibility ?? 0.5) + (pLC.visibility ?? 0.5)) / 3;
  const rightVis = ((pRA.visibility ?? 0.5) + (pRB.visibility ?? 0.5) + (pRC.visibility ?? 0.5)) / 3;

  const leftAngle = calculateAngle(pLA, pLB, pLC);
  const rightAngle = calculateAngle(pRA, pRB, pRC);

  // When user is in profile / 3/4 angle
  if (leftVis > 0.6 && rightVis < 0.35) {
    return { angle: leftAngle, side: 'left', confidence: leftVis };
  }
  if (rightVis > 0.6 && leftVis < 0.35) {
    return { angle: rightAngle, side: 'right', confidence: rightVis };
  }

  // Both limbs in view: confidence-weighted average
  const totalVis = leftVis + rightVis;
  if (totalVis < 0.1) {
    return { angle: Math.round((leftAngle + rightAngle) / 2), side: 'both', confidence: 0.1 };
  }
  const weighted = Math.round((leftAngle * leftVis + rightAngle * rightVis) / totalVis);
  return { angle: weighted, side: 'both', confidence: Math.max(leftVis, rightVis) };
}

/**
 * Calculates the forward lean angle of the spine relative to vertical (0° = upright).
 * Uses midpoint of shoulders and hips for robust torso vector orientation.
 */
export function calculateSpineLean(landmarks: Point3D[]): number {
  if (!landmarks || landmarks.length < 25) return 0;
  const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  if (!ls || !rs || !lh || !rh) return 0;

  const midShoulderX = (ls.x + rs.x) / 2;
  const midShoulderY = (ls.y + rs.y) / 2;
  const midHipX = (lh.x + rh.x) / 2;
  const midHipY = (lh.y + rh.y) / 2;

  const dx = midShoulderX - midHipX;
  const dy = midHipY - midShoulderY; // positive when shoulder is above hip
  const angleFromVertical = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  return Math.round(angleFromVertical);
}

/**
 * Main entry point: Analyze landmarks for an exercise and return posture accuracy feedback.
 */
export function analyzePosture(landmarks: Point3D[], exercise: ExerciseType): PostureResult {
  if (!landmarks || landmarks.length < 25) {
    return {
      isCorrect: true,
      feedback: 'Detecting body position…',
      metrics: [{ label: 'Pose', value: 'Tracking', good: true }],
    };
  }

  switch (exercise) {
    case 'squat':
      return analyzeSquat(landmarks);
    case 'push_up':
      return analyzePushUp(landmarks);
    case 'plank':
      return analyzePlank(landmarks);
    case 'lunge':
      return analyzeLunge(landmarks);
    case 'bicep_curl':
      return analyzeBicepCurl(landmarks);
    case 'overhead_press':
      return analyzeOverheadPress(landmarks);
    case 'bench_press':
      return analyzeBenchPress(landmarks);
    case 'deadlift':
      return analyzeDeadlift(landmarks);
    case 'pull_up':
      return analyzePullUp(landmarks);
    case 'calf_raise':
      return analyzeCalfRaise(landmarks);
    case 'jumping_jack':
      return analyzeJumpingJack(landmarks);
    case 'mountain_climber':
      return analyzeMountainClimber(landmarks);
    case 'crunch':
      return analyzeCrunch(landmarks);
    case 'russian_twist':
      return analyzeRussianTwist(landmarks);
    case 'leg_raise':
      return analyzeLegRaise(landmarks);
    case 'heel_touch':
      return analyzeHeelTouch(landmarks);
    case 'side_arm_raise':
      return analyzeSideArmRaise(landmarks);
    case 'arm_circles':
      return analyzeArmCircles(landmarks);
    case 'punches':
      return analyzePunches(landmarks);
    case 'tree_pose':
      return analyzeTreePose(landmarks);
    case 'warrior_pose':
      return analyzeWarriorPose(landmarks);
    case 'spine_twist':
      return analyzeSpineTwist(landmarks);
    case 'standing_stretch':
      return analyzeStandingStretch(landmarks);
    case 'general_posture':
    default:
      return analyzeGeneralPosture(landmarks);
  }
}

function analyzeGeneralPosture(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const leftShoulderAngle = calculateAngle(
    lm[POSE_LANDMARKS.LEFT_HIP],
    lm[POSE_LANDMARKS.LEFT_SHOULDER],
    lm[POSE_LANDMARKS.LEFT_EAR]
  );
  const isSpineOk = spineLean < 14;
  const isShoulderOk = leftShoulderAngle > 145;
  const isCorrect = isSpineOk && isShoulderOk;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great posture! Spine aligned, chest open.'
      : !isSpineOk
      ? 'Sit up straighter — keep your torso aligned.'
      : 'Roll your shoulders back and keep head neutral.',
    metrics: [
      { label: 'Spine Lean', value: `${spineLean}°`, good: isSpineOk },
      { label: 'Neck Alignment', value: `${leftShoulderAngle}°`, good: isShoulderOk },
    ],
  };
}

function analyzeSquat(lm: Point3D[]): PostureResult {
  const kneeData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]
  );
  const spineLean = calculateSpineLean(lm);
  const kneeAngle = kneeData.angle;

  const isStanding = kneeAngle > 145;
  const isDepthGood = kneeAngle >= 70 && kneeAngle <= 115;
  const isSpineSafe = spineLean < 35;

  let isCorrect = true;
  let feedback = 'Excellent squat depth! Knees tracking well.';

  if (!isSpineSafe) {
    isCorrect = false;
    feedback = 'Keep your chest lifted — avoid excessive forward lean.';
  } else if (!isStanding && !isDepthGood) {
    if (kneeAngle > 115) {
      isCorrect = false;
      feedback = 'Squat lower — aim for parallel thighs at ~90°.';
    } else {
      isCorrect = false;
      feedback = 'Control your depth — don\'t collapse past 70°.';
    }
  }

  return {
    isCorrect,
    feedback,
    metrics: [
      { label: 'Knee Angle', value: `${kneeAngle}°`, good: isStanding || isDepthGood },
      { label: 'Spine Lean', value: `${spineLean}°`, good: isSpineSafe },
    ],
  };
}

function analyzePushUp(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const isHorizontal = spineLean > 45;

  const hipData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_ANKLE],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_ANKLE]
  );
  const elbowData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  );

  const isCoreStraight = hipData.angle >= 155 && hipData.angle <= 185;
  const isCorrect = isHorizontal && isCoreStraight;

  let feedback = 'Strong push-up plank! Keep core braced.';
  if (!isHorizontal) {
    feedback = 'Get into a horizontal plank on the floor.';
  } else if (hipData.angle < 155) {
    feedback = 'Don\'t let hips sag — engage glutes and abs.';
  } else if (hipData.angle > 185) {
    feedback = 'Lower hips to maintain a straight plank line.';
  }

  return {
    isCorrect,
    feedback,
    metrics: [
      { label: 'Body Line', value: `${hipData.angle}°`, good: isCoreStraight },
      { label: 'Elbow Bend', value: `${elbowData.angle}°`, good: true },
    ],
  };
}

function analyzePlank(lm: Point3D[]): PostureResult {
  const hipData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_ANKLE],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_ANKLE]
  );
  const hipAngle = hipData.angle;
  const isGood = hipAngle >= 158 && hipAngle <= 182;

  let feedback = 'Solid plank! Core braced, neutral spine.';
  if (hipAngle < 158) {
    feedback = 'Hips are sagging — squeeze your glutes and core.';
  } else if (hipAngle > 182) {
    feedback = 'Lower your hips — avoid piking upward.';
  }

  return {
    isCorrect: isGood,
    feedback,
    metrics: [
      { label: 'Plank Line', value: `${hipAngle}°`, good: isGood },
    ],
  };
}

function analyzeLunge(lm: Point3D[]): PostureResult {
  const frontKnee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const spineLean = calculateSpineLean(lm);
  const isKneeGood = frontKnee >= 80 && frontKnee <= 115;
  const isSpineGood = spineLean < 20;
  const isCorrect = isKneeGood && isSpineGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great lunge stability! Front knee stacked at ~90°.'
      : !isKneeGood
      ? 'Aim for ~90° on the front knee — keep weight centered.'
      : 'Keep your torso upright — don\'t lean over your knee.',
    metrics: [
      { label: 'Front Knee', value: `${frontKnee}°`, good: isKneeGood },
      { label: 'Torso Lean', value: `${spineLean}°`, good: isSpineSafe(spineLean) },
    ],
  };
}

function isSpineSafe(lean: number): boolean {
  return lean < 20;
}

function analyzeBicepCurl(lm: Point3D[]): PostureResult {
  const elbowData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  );
  const spineLean = calculateSpineLean(lm);

  // Check shoulder swing (upper arm angle to hip)
  const leftShoulderSwing = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW]);
  const isElbowPinned = leftShoulderSwing < 30;
  const isSpineStable = spineLean < 16;
  const isCorrect = isElbowPinned && isSpineStable;

  let feedback = 'Good curl form! Elbows steady, full squeeze.';
  if (!isElbowPinned) {
    feedback = 'Keep your elbows pinned to your sides — don\'t swing.';
  } else if (!isSpineStable) {
    feedback = 'Avoid leaning back — isolate your biceps.';
  }

  return {
    isCorrect,
    feedback,
    metrics: [
      { label: 'Elbow Angle', value: `${elbowData.angle}°`, good: true },
      { label: 'Arm Stability', value: `${leftShoulderSwing}°`, good: isElbowPinned },
    ],
  };
}

function analyzeOverheadPress(lm: Point3D[]): PostureResult {
  const armData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
  );
  const spineLean = calculateSpineLean(lm);
  const isSpineSafe = spineLean < 16;

  return {
    isCorrect: isSpineSafe,
    feedback: isSpineSafe
      ? 'Clean overhead drive! Ribs down, core tight.'
      : 'Brace your core — don\'t arch your lower spine.',
    metrics: [
      { label: 'Arm Extension', value: `${armData.angle}°`, good: true },
      { label: 'Back Arch', value: `${spineLean}°`, good: isSpineSafe },
    ],
  };
}

function analyzeBenchPress(lm: Point3D[]): PostureResult {
  const elbowData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  );
  return {
    isCorrect: true,
    feedback: 'Keep wrists stacked over elbows, control eccentric.',
    metrics: [
      { label: 'Elbow Angle', value: `${elbowData.angle}°`, good: true },
    ],
  };
}

function analyzeDeadlift(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const kneeData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]
  );
  const isSpineFlat = spineLean < 35;
  const isHingeGood = kneeData.angle > 100;
  const isCorrect = isSpineFlat && isHingeGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great hip hinge! Back neutral, chest proud.'
      : !isSpineFlat
      ? 'Keep your spine flat — do not round your back.'
      : 'Hinge back at the hips — avoid turning into a squat.',
    metrics: [
      { label: 'Back Angle', value: `${spineLean}°`, good: isSpineFlat },
      { label: 'Knee Bend', value: `${kneeData.angle}°`, good: isHingeGood },
    ],
  };
}

function analyzePullUp(lm: Point3D[]): PostureResult {
  const elbowData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  );
  return {
    isCorrect: true,
    feedback: 'Full range of motion: dead hang to chin over bar.',
    metrics: [
      { label: 'Elbow Pull', value: `${elbowData.angle}°`, good: true },
    ],
  };
}

function analyzeCalfRaise(lm: Point3D[]): PostureResult {
  const leftAnkleY = lm[POSE_LANDMARKS.LEFT_ANKLE]?.y ?? 0;
  const leftToeY = lm[POSE_LANDMARKS.LEFT_FOOT_INDEX]?.y ?? 0;
  const isHeelRaised = leftAnkleY < leftToeY + 0.015;

  return {
    isCorrect: true,
    feedback: isHeelRaised ? 'Peak contraction! Squeeze calves at top.' : 'Drive through your big toes.',
    metrics: [
      { label: 'Heel Position', value: isHeelRaised ? 'Contracted' : 'Ground', good: true },
    ],
  };
}

function analyzeJumpingJack(lm: Point3D[]): PostureResult {
  const armData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
  );
  return {
    isCorrect: true,
    feedback: 'Rhythmic tempo, extend arms overhead with light feet.',
    metrics: [
      { label: 'Arm Reach', value: `${armData.angle}°`, good: true },
    ],
  };
}

function analyzeMountainClimber(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const isHorizontal = spineLean > 40;
  return {
    isCorrect: isHorizontal,
    feedback: isHorizontal ? 'Piston knees rapidly to chest, keep hips down.' : 'Stay horizontal in plank.',
    metrics: [
      { label: 'Plank Form', value: isHorizontal ? 'Horizontal' : 'Too Upright', good: isHorizontal },
    ],
  };
}

function analyzeCrunch(lm: Point3D[]): PostureResult {
  const hipAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE]);
  return {
    isCorrect: true,
    feedback: 'Curl ribs towards pelvis — don\'t pull on your neck.',
    metrics: [
      { label: 'Core Flexion', value: `${hipAngle}°`, good: true },
    ],
  };
}

function analyzeRussianTwist(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const isLeanGood = spineLean >= 25 && spineLean <= 55;
  return {
    isCorrect: isLeanGood,
    feedback: isLeanGood ? 'Rotate through thoracic spine, keep core engaged.' : 'Maintain a 45° torso lean.',
    metrics: [
      { label: 'Torso Lean', value: `${spineLean}°`, good: isLeanGood },
    ],
  };
}

function analyzeLegRaise(lm: Point3D[]): PostureResult {
  const hip = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  return {
    isCorrect: true,
    feedback: 'Lower back pinned to floor, lift with lower abs.',
    metrics: [
      { label: 'Leg Angle', value: `${hip}°`, good: true },
    ],
  };
}

function analyzeHeelTouch(lm: Point3D[]): PostureResult {
  const leftShoulder = lm[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = lm[POSE_LANDMARKS.RIGHT_SHOULDER];
  const isVisible = (leftShoulder?.visibility ?? 0.5) > 0.35 && (rightShoulder?.visibility ?? 0.5) > 0.35;
  return {
    isCorrect: isVisible,
    feedback: isVisible
      ? 'Reach side-to-side contracting the obliques.'
      : 'Keep your shoulders in view.',
    metrics: [
      { label: 'Oblique Focus', value: isVisible ? 'Active' : 'Reposition', good: isVisible },
    ],
  };
}

function analyzeSideArmRaise(lm: Point3D[]): PostureResult {
  const armData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
  );
  const spineLean = calculateSpineLean(lm);
  const isUpright = spineLean < 15;
  const isSafeHeight = armData.angle < 115;
  const isCorrect = isUpright && isSafeHeight;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Controlled lateral raise! Lead with elbows.'
      : !isUpright
      ? 'Stand tall — do not swing torso.'
      : 'Stop at shoulder height — avoid shrugging.',
    metrics: [
      { label: 'Arm Height', value: `${armData.angle}°`, good: isSafeHeight },
      { label: 'Spine Lean', value: `${spineLean}°`, good: isUpright },
    ],
  };
}

function analyzeArmCircles(lm: Point3D[]): PostureResult {
  const armData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
  );
  const isExtended = armData.angle > 70 && armData.angle < 115;
  return {
    isCorrect: isExtended,
    feedback: isExtended ? 'Keep arms straight, circular motion.' : 'Raise arms to shoulder height.',
    metrics: [
      { label: 'Arm Extension', value: `${armData.angle}°`, good: isExtended },
    ],
  };
}

function analyzePunches(lm: Point3D[]): PostureResult {
  const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightElbow = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  return {
    isCorrect: true,
    feedback: 'Snap punches with full extension, keep opposite guard up.',
    metrics: [
      { label: 'Left Arm', value: `${leftElbow}°`, good: true },
      { label: 'Right Arm', value: `${rightElbow}°`, good: true },
    ],
  };
}

function analyzeTreePose(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const shoulderLevel = Math.abs((lm[POSE_LANDMARKS.LEFT_SHOULDER]?.y ?? 0) - (lm[POSE_LANDMARKS.RIGHT_SHOULDER]?.y ?? 0));
  const isBalanced = spineLean < 12;
  const isLevel = shoulderLevel < 0.06;
  const isCorrect = isBalanced && isLevel;

  return {
    isCorrect,
    feedback: isCorrect ? 'Beautiful tree pose balance!' : 'Align spine vertically over standing leg.',
    metrics: [
      { label: 'Spine Balance', value: `${spineLean}°`, good: isBalanced },
      { label: 'Shoulders', value: isLevel ? 'Level' : 'Tilted', good: isLevel },
    ],
  };
}

function analyzeWarriorPose(lm: Point3D[]): PostureResult {
  const frontKnee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const isGood = frontKnee >= 80 && frontKnee <= 115;
  return {
    isCorrect: isGood,
    feedback: isGood ? 'Strong warrior stance! Sink into front hip.' : 'Bend front knee towards 90°.',
    metrics: [
      { label: 'Front Knee', value: `${frontKnee}°`, good: isGood },
    ],
  };
}

function analyzeSpineTwist(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const isUpright = spineLean < 25;
  return {
    isCorrect: isUpright,
    feedback: isUpright ? 'Gentle spinal twist, inhale to lengthen, exhale to rotate.' : 'Sit or stand tall — keep spine elongated.',
    metrics: [
      { label: 'Spine Alignment', value: `${spineLean}°`, good: isUpright },
    ],
  };
}

function analyzeStandingStretch(lm: Point3D[]): PostureResult {
  const armData = getBilateralAngle(
    lm,
    [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_WRIST],
    [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_WRIST]
  );
  return {
    isCorrect: true,
    feedback: 'Reach tall overhead, lengthen abdominal wall.',
    metrics: [
      { label: 'Reach', value: `${armData.angle}°`, good: true },
    ],
  };
}


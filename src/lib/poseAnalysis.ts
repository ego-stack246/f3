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
  z: number;
  visibility?: number;
}

/**
 * Calculates the angle (in degrees) formed at point B by lines BA and BC.
 */
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

/**
 * Calculates the forward lean angle of the spine relative to vertical.
 * Uses shoulder midpoint and hip midpoint.
 */
export function calculateSpineLean(landmarks: Point3D[]): number {
  const midShoulderX = (landmarks[POSE_LANDMARKS.LEFT_SHOULDER].x + landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x) / 2;
  const midShoulderY = (landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y + landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y) / 2;
  const midHipX = (landmarks[POSE_LANDMARKS.LEFT_HIP].x + landmarks[POSE_LANDMARKS.RIGHT_HIP].x) / 2;
  const midHipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;

  // Angle from vertical — 0° = perfectly upright
  const dx = midShoulderX - midHipX;
  const dy = midHipY - midShoulderY; // positive when shoulder is above hip
  const angleFromVertical = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  return Math.round(angleFromVertical);
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

export interface PostureResult {
  isCorrect: boolean;
  feedback: string;
  metrics: { label: string; value: string; good: boolean }[];
}

/**
 * Analyze landmarks for a specific exercise and return posture feedback.
 */
export function analyzePosture(landmarks: Point3D[], exercise: ExerciseType): PostureResult {
  switch (exercise) {
    case 'squat':
      return analyzeSquat(landmarks);
    case 'lunge':
      return analyzeLunge(landmarks);
    case 'plank':
      return analyzePlank(landmarks);
    case 'tree_pose':
      return analyzeTreePose(landmarks);
    case 'warrior_pose':
      return analyzeWarriorPose(landmarks);
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
    case 'spine_twist':
      return analyzeSpineTwist(landmarks);
    case 'standing_stretch':
      return analyzeStandingStretch(landmarks);
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
    case 'push_up':
      return analyzePushUp(landmarks);
    case 'side_arm_raise':
      return analyzeSideArmRaise(landmarks);
    case 'arm_circles':
      return analyzeArmCircles(landmarks);
    case 'punches':
      return analyzePunches(landmarks);
    case 'general_posture':
    default:
      return analyzeGeneralPosture(landmarks);
  }
}

function analyzeGeneralPosture(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const shoulderAngle = calculateAngle(
    lm[POSE_LANDMARKS.LEFT_HIP],
    lm[POSE_LANDMARKS.LEFT_SHOULDER],
    lm[POSE_LANDMARKS.LEFT_EAR]
  );
  const isSpineOk = spineLean < 12;
  const isShoulderOk = shoulderAngle > 150;
  const isCorrect = isSpineOk && isShoulderOk;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great posture! Spine aligned, shoulders relaxed.'
      : !isSpineOk
      ? 'Sit up straighter — you\'re leaning forward too much.'
      : 'Roll your shoulders back and keep your head above your spine.',
    metrics: [
      { label: 'Spine Lean', value: `${spineLean}°`, good: isSpineOk },
      { label: 'Shoulder Alignment', value: `${shoulderAngle}°`, good: isShoulderOk },
    ],
  };
}

function analyzeSquat(lm: Point3D[]): PostureResult {
  const leftKneeAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const rightKneeAngle = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_KNEE], lm[POSE_LANDMARKS.RIGHT_ANKLE]);
  const avgKnee = Math.round((leftKneeAngle + rightKneeAngle) / 2);
  const spineLean = calculateSpineLean(lm);

  const isKneeGood = avgKnee >= 70 && avgKnee <= 120;
  const isSpineGood = spineLean < 30;
  const isCorrect = isKneeGood && isSpineGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Excellent squat depth! Knees tracking well.'
      : !isKneeGood
      ? avgKnee > 120
        ? 'Go deeper — bend your knees more for full range.'
        : 'Don\'t go too deep — maintain control at 90°.'
      : 'Keep your chest up and back straight.',
    metrics: [
      { label: 'Knee Angle', value: `${avgKnee}°`, good: isKneeGood },
      { label: 'Spine Lean', value: `${spineLean}°`, good: isSpineGood },
    ],
  };
}

function analyzeLunge(lm: Point3D[]): PostureResult {
  const frontKnee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const spineLean = calculateSpineLean(lm);
  const isFrontKneeGood = frontKnee >= 80 && frontKnee <= 110;
  const isSpineGood = spineLean < 15;
  const isCorrect = isFrontKneeGood && isSpineGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Solid lunge form! Keep it stable.'
      : !isFrontKneeGood
      ? 'Adjust front knee to 90° — it\'s tracking too far.'
      : 'Keep your torso upright during lunges.',
    metrics: [
      { label: 'Front Knee', value: `${frontKnee}°`, good: isFrontKneeGood },
      { label: 'Torso Lean', value: `${spineLean}°`, good: isSpineGood },
    ],
  };
}

function analyzePlank(lm: Point3D[]): PostureResult {
  const hipAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const isHipGood = hipAngle >= 160 && hipAngle <= 180;
  const isCorrect = isHipGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Perfect plank! Body in a straight line.'
      : hipAngle < 160
      ? 'Hips are sagging — engage your core to lift.'
      : 'Lower your hips slightly — don\'t pike up.',
    metrics: [
      { label: 'Body Alignment', value: `${hipAngle}°`, good: isHipGood },
    ],
  };
}

function analyzeTreePose(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const shoulderLevel = Math.abs(lm[POSE_LANDMARKS.LEFT_SHOULDER].y - lm[POSE_LANDMARKS.RIGHT_SHOULDER].y);
  const isBalanced = spineLean < 10;
  const isShouldersLevel = shoulderLevel < 0.05;
  const isCorrect = isBalanced && isShouldersLevel;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Beautiful tree pose! Great balance and alignment.'
      : !isBalanced
      ? 'Straighten your spine — find your center.'
      : 'Level your shoulders — one is higher than the other.',
    metrics: [
      { label: 'Balance', value: `${spineLean}°`, good: isBalanced },
      { label: 'Shoulder Level', value: isShouldersLevel ? 'Even' : 'Uneven', good: isShouldersLevel },
    ],
  };
}

function analyzeWarriorPose(lm: Point3D[]): PostureResult {
  const frontKnee = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const armAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_WRIST], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP]);
  const isFrontKneeGood = frontKnee >= 80 && frontKnee <= 110;
  const isArmGood = armAngle >= 160;
  const isCorrect = isFrontKneeGood && isArmGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Strong warrior! Arms extended, knee stable.'
      : !isFrontKneeGood
      ? 'Bend your front knee to 90° over your ankle.'
      : 'Extend your arms fully — reach through your fingertips.',
    metrics: [
      { label: 'Front Knee', value: `${frontKnee}°`, good: isFrontKneeGood },
      { label: 'Arm Extension', value: `${armAngle}°`, good: isArmGood },
    ],
  };
}

// ========================= NEW EXERCISE ANALYZERS =========================

function analyzeJumpingJack(lm: Point3D[]): PostureResult {
  // Check arm spread: angle at shoulder between hip and wrist
  const leftArmAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightArmAngle = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  const avgArm = Math.round((leftArmAngle + rightArmAngle) / 2);
  // Check leg spread: distance between ankles relative to hips
  const legSpread = Math.abs(lm[POSE_LANDMARKS.LEFT_ANKLE].x - lm[POSE_LANDMARKS.RIGHT_ANKLE].x);
  const hipWidth = Math.abs(lm[POSE_LANDMARKS.LEFT_HIP].x - lm[POSE_LANDMARKS.RIGHT_HIP].x);
  const legRatio = legSpread / (hipWidth || 0.01);

  const isArmsUp = avgArm >= 140;
  const isLegsWide = legRatio > 1.8;
  const isCorrect = isArmsUp && isLegsWide;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great jumping jack! Full extension!'
      : !isArmsUp
      ? 'Raise your arms higher — full overhead reach!'
      : 'Spread your legs wider for full range of motion.',
    metrics: [
      { label: 'Arm Angle', value: `${avgArm}°`, good: isArmsUp },
      { label: 'Leg Spread', value: isLegsWide ? 'Wide' : 'Narrow', good: isLegsWide },
    ],
  };
}

function analyzeMountainClimber(lm: Point3D[]): PostureResult {
  // Similar to plank — body should be straight, one knee driving forward
  const hipAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const isBodyStraight = hipAngle >= 150 && hipAngle <= 180;
  // Check if arms are straight (shoulder-elbow-wrist)
  const armAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const isArmsStraight = armAngle >= 160;
  const isCorrect = isBodyStraight && isArmsStraight;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Strong mountain climber! Keep driving those knees.'
      : !isBodyStraight
      ? 'Keep your hips level — don\'t pike up or sag.'
      : 'Lock your arms straight under your shoulders.',
    metrics: [
      { label: 'Hip Alignment', value: `${hipAngle}°`, good: isBodyStraight },
      { label: 'Arm Lock', value: `${armAngle}°`, good: isArmsStraight },
    ],
  };
}

function analyzeCrunch(lm: Point3D[]): PostureResult {
  // Measure torso curl: angle at hip between shoulder and knee
  const crunchAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE]);
  const isCurled = crunchAngle >= 60 && crunchAngle <= 110;
  // Check neck — ear should stay relatively aligned with shoulder (no neck strain)
  const neckAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_EAR], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP]);
  const isNeckOk = neckAngle >= 140;
  const isCorrect = isCurled && isNeckOk;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Good crunch! Core engaged, neck neutral.'
      : !isCurled
      ? crunchAngle > 110
        ? 'Curl up more — lift your shoulder blades off the ground.'
        : 'Don\'t curl too far — keep tension on your abs.'
      : 'Don\'t pull on your neck — keep your chin off your chest.',
    metrics: [
      { label: 'Crunch Angle', value: `${crunchAngle}°`, good: isCurled },
      { label: 'Neck Position', value: isNeckOk ? 'Neutral' : 'Strained', good: isNeckOk },
    ],
  };
}

function analyzeRussianTwist(lm: Point3D[]): PostureResult {
  // Lean back angle (shoulder-hip vertical)
  const spineLean = calculateSpineLean(lm);
  const isLeanBack = spineLean >= 20 && spineLean <= 50;
  // Shoulder rotation (difference in z or x between shoulders)
  const shoulderRotation = Math.abs(lm[POSE_LANDMARKS.LEFT_SHOULDER].x - lm[POSE_LANDMARKS.RIGHT_SHOULDER].x);
  const hipRotation = Math.abs(lm[POSE_LANDMARKS.LEFT_HIP].x - lm[POSE_LANDMARKS.RIGHT_HIP].x);
  const twistRatio = shoulderRotation / (hipRotation || 0.01);
  const isTwisting = twistRatio > 1.3 || twistRatio < 0.7;
  const isCorrect = isLeanBack && isTwisting;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Good russian twist! Great rotation and lean.'
      : !isLeanBack
      ? spineLean < 20
        ? 'Lean back more — create a V-shape with your torso and thighs.'
        : 'Don\'t lean back too far — maintain core control.'
      : 'Rotate your shoulders more — twist side to side fully.',
    metrics: [
      { label: 'Lean Angle', value: `${spineLean}°`, good: isLeanBack },
      { label: 'Twist', value: isTwisting ? 'Good' : 'More needed', good: isTwisting },
    ],
  };
}

function analyzeLegRaise(lm: Point3D[]): PostureResult {
  // Leg angle relative to torso — hip angle between shoulder and ankle
  const legAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const isLegUp = legAngle >= 70 && legAngle <= 110;
  // Check if legs are straight (hip-knee-ankle)
  const kneeStraight = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const isKneeLocked = kneeStraight >= 160;
  const isCorrect = isLegUp && isKneeLocked;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Perfect leg raise! Legs straight, core engaged.'
      : !isLegUp
      ? legAngle > 110
        ? 'Raise your legs higher — aim for 90° to the floor.'
        : 'Lower your legs slowly — don\'t swing.'
      : 'Keep your legs straight — don\'t bend at the knees.',
    metrics: [
      { label: 'Leg Angle', value: `${legAngle}°`, good: isLegUp },
      { label: 'Knee Lock', value: `${kneeStraight}°`, good: isKneeLocked },
    ],
  };
}

function analyzeHeelTouch(lm: Point3D[]): PostureResult {
  // Similar to crunch — slight curl with lateral reach
  const crunchAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE]);
  const isCurled = crunchAngle >= 50 && crunchAngle <= 100;
  // Check lateral reach — hand near ankle
  const handToAnkleDist = Math.abs(lm[POSE_LANDMARKS.LEFT_WRIST].y - lm[POSE_LANDMARKS.LEFT_ANKLE].y);
  const isReaching = handToAnkleDist < 0.15;
  const isCorrect = isCurled && isReaching;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Nice heel touches! Great oblique engagement.'
      : !isCurled
      ? 'Curl up slightly — lift your shoulders off the ground.'
      : 'Reach further to the side — try to touch your heel.',
    metrics: [
      { label: 'Curl Angle', value: `${crunchAngle}°`, good: isCurled },
      { label: 'Reach', value: isReaching ? 'Touching' : 'Reach more', good: isReaching },
    ],
  };
}

function analyzeSpineTwist(lm: Point3D[]): PostureResult {
  // Seated or standing spinal twist — check shoulder rotation relative to hips
  const spineLean = calculateSpineLean(lm);
  const isSpineUpright = spineLean < 15;
  const shoulderDiffX = lm[POSE_LANDMARKS.LEFT_SHOULDER].x - lm[POSE_LANDMARKS.RIGHT_SHOULDER].x;
  const hipDiffX = lm[POSE_LANDMARKS.LEFT_HIP].x - lm[POSE_LANDMARKS.RIGHT_HIP].x;
  const twistAmount = Math.abs(shoulderDiffX - hipDiffX);
  const isTwisting = twistAmount > 0.04;
  const isCorrect = isSpineUpright && isTwisting;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Beautiful spinal twist! Hold and breathe.'
      : !isSpineUpright
      ? 'Keep your spine tall — don\'t lean forward or back.'
      : 'Rotate further — lead with your ribs, not your arms.',
    metrics: [
      { label: 'Spine', value: `${spineLean}°`, good: isSpineUpright },
      { label: 'Rotation', value: isTwisting ? 'Good' : 'More needed', good: isTwisting },
    ],
  };
}

function analyzeStandingStretch(lm: Point3D[]): PostureResult {
  // Arms overhead stretch — arm angle relative to torso
  const leftArm = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightArm = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  const avgArm = Math.round((leftArm + rightArm) / 2);
  const isArmsUp = avgArm >= 160;
  const spineLean = calculateSpineLean(lm);
  const isAligned = spineLean < 10;
  const isCorrect = isArmsUp && isAligned;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great stretch! Full extension, spine aligned.'
      : !isArmsUp
      ? 'Reach higher — extend your arms fully overhead.'
      : 'Stand tall — keep your spine straight while stretching.',
    metrics: [
      { label: 'Arm Reach', value: `${avgArm}°`, good: isArmsUp },
      { label: 'Spine', value: `${spineLean}°`, good: isAligned },
    ],
  };
}

function analyzeBicepCurl(lm: Point3D[]): PostureResult {
  const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightElbow = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  const avgElbow = Math.round((leftElbow + rightElbow) / 2);
  const spineLean = calculateSpineLean(lm);

  const isElbowGood = avgElbow < 70 || avgElbow > 140;
  const isSpineGood = spineLean < 15;
  const isCorrect = isElbowGood && isSpineGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great bicep curl form! Controlled motion.'
      : !isElbowGood
      ? 'Squeeze at the top or lower completely for full extension.'
      : 'Keep your torso still — don\'t swing your back for momentum.',
    metrics: [
      { label: 'Elbow Flex', value: `${avgElbow}°`, good: isElbowGood },
      { label: 'Spine Stability', value: `${spineLean}°`, good: isSpineGood },
    ],
  };
}

function analyzeOverheadPress(lm: Point3D[]): PostureResult {
  const leftArm = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightArm = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  const avgArm = Math.round((leftArm + rightArm) / 2);
  const spineLean = calculateSpineLean(lm);

  const isArmOverhead = avgArm > 150 || avgArm < 90;
  const isSpineSafe = spineLean < 15;
  const isCorrect = isArmOverhead && isSpineSafe;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Solid overhead press! Core locked, arms extending.'
      : !isArmOverhead
      ? 'Press fully overhead until elbows lock out.'
      : 'Don\'t arch your lower back — brace your core.',
    metrics: [
      { label: 'Press Extension', value: `${avgArm}°`, good: isArmOverhead },
      { label: 'Back Arch', value: `${spineLean}°`, good: isSpineSafe },
    ],
  };
}

function analyzeBenchPress(lm: Point3D[]): PostureResult {
  const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightElbow = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  const avgElbow = Math.round((leftElbow + rightElbow) / 2);

  const isPressGood = avgElbow > 150 || avgElbow < 85;
  const isCorrect = isPressGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Good bench press form! Wrists stacked over elbows.'
      : 'Press fully to lock out or lower bar under control to chest.',
    metrics: [
      { label: 'Elbow Angle', value: `${avgElbow}°`, good: isPressGood },
    ],
  };
}

function analyzeDeadlift(lm: Point3D[]): PostureResult {
  const spineLean = calculateSpineLean(lm);
  const kneeAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const isSpineFlat = spineLean < 35;
  const isHingeGood = kneeAngle > 100;
  const isCorrect = isSpineFlat && isHingeGood;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Excellent deadlift hinge! Back neutral, chest up.'
      : !isSpineFlat
      ? 'Keep your back flat — don\'t round your lower spine.'
      : 'Hinge at the hips — don\'t turn it into a squat.',
    metrics: [
      { label: 'Back Angle', value: `${spineLean}°`, good: isSpineFlat },
      { label: 'Knee Bend', value: `${kneeAngle}°`, good: isHingeGood },
    ],
  };
}

function analyzePullUp(lm: Point3D[]): PostureResult {
  const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const isChinUp = leftElbow < 80;
  const isHang = leftElbow > 150;
  const isCorrect = isChinUp || isHang;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Great pull-up form! Full extension and peak chin over bar.'
      : 'Pull higher to clear chin over bar or lower to dead hang.',
    metrics: [
      { label: 'Elbow Pull', value: `${leftElbow}°`, good: isCorrect },
    ],
  };
}

function analyzeCalfRaise(lm: Point3D[]): PostureResult {
  const leftAnkleY = lm[POSE_LANDMARKS.LEFT_ANKLE].y;
  const leftToeY = lm[POSE_LANDMARKS.LEFT_FOOT_INDEX].y;
  const isHeelRaised = leftAnkleY < leftToeY + 0.02;

  return {
    isCorrect: true,
    feedback: isHeelRaised
      ? 'Peak calf contraction! Hold for 1 second.'
      : 'Drive up onto your toes — flex your calves.',
    metrics: [
      { label: 'Heel Rise', value: isHeelRaised ? 'Raised' : 'Flat', good: true },
    ],
  };
}

function analyzePushUp(lm: Point3D[]): PostureResult {
  // Check body alignment (plank-like)
  const hipAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_ANKLE]);
  const isHipGood = hipAngle >= 150 && hipAngle <= 180;
  
  // Check horizontal position (to avoid counting when standing)
  const spineLean = calculateSpineLean(lm);
  const isHorizontal = spineLean > 50;

  const isCorrect = isHipGood && isHorizontal;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Good push-up form! Keep your core tight.'
      : !isHorizontal
      ? 'Get into a horizontal plank position on the floor.'
      : 'Keep your body in a straight line — don\'t let hips sag or pike.',
    metrics: [
      { label: 'Body Alignment', value: `${hipAngle}°`, good: isHipGood },
      { label: 'Position', value: isHorizontal ? 'Horizontal' : 'Standing', good: isHorizontal },
    ],
  };
}

function analyzeSideArmRaise(lm: Point3D[]): PostureResult {
  const leftArm = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightArm = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  const avgArm = Math.round((leftArm + rightArm) / 2);
  const spineLean = calculateSpineLean(lm);
  
  const isSpineUpright = spineLean < 15;
  const isArmNotTooHigh = avgArm < 110; // shouldn't go much higher than parallel
  const isCorrect = isSpineUpright && isArmNotTooHigh;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Good side arm raise! Control the weight.'
      : !isSpineUpright
      ? 'Stand tall — don\'t lean forward or back.'
      : 'Don\'t raise arms above shoulder level.',
    metrics: [
      { label: 'Arm Angle', value: `${avgArm}°`, good: isArmNotTooHigh },
      { label: 'Spine Lean', value: `${spineLean}°`, good: isSpineUpright },
    ],
  };
}

function analyzeArmCircles(lm: Point3D[]): PostureResult {
  const leftArm = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightArm = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  const avgArm = Math.round((leftArm + rightArm) / 2);
  
  const isArmExtended = avgArm > 70 && avgArm < 110;
  const spineLean = calculateSpineLean(lm);
  const isSpineUpright = spineLean < 15;
  const isCorrect = isArmExtended && isSpineUpright;

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Good arm circles! Keep arms straight and extended.'
      : !isArmExtended
      ? 'Keep your arms extended straight out to the sides.'
      : 'Stand tall with a straight spine.',
    metrics: [
      { label: 'Arm Extension', value: `${avgArm}°`, good: isArmExtended },
    ],
  };
}

function analyzePunches(lm: Point3D[]): PostureResult {
  const leftElbow = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
  const rightElbow = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
  
  const isPunching = leftElbow > 140 || rightElbow > 140; // at least one arm extended
  const spineLean = calculateSpineLean(lm);
  const isSpineUpright = spineLean < 25;
  
  const isCorrect = isSpineUpright;

  return {
    isCorrect,
    feedback: isCorrect
      ? (isPunching ? 'Great punch extension!' : 'Keep your guard up and punch!')
      : 'Keep your core engaged and stay upright.',
    metrics: [
      { label: 'Left Extension', value: `${leftElbow}°`, good: leftElbow > 140 },
      { label: 'Right Extension', value: `${rightElbow}°`, good: rightElbow > 140 },
    ],
  };
}


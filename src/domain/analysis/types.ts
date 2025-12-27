export interface Point2D {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
}

export interface PoseLandmarks {
    [key: number]: Point2D;
}

export interface PoseResult {
    landmarks: Point2D[];
    worldLandmarks: Point2D[];
}

// MediaPipe Landmark Indices
export const LANDMARKS = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
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

// Action Types
export type BasicPostureAction =
    | 'standing'           // 自然站立
    | 'single_leg_standing' // 单脚站立
    | 'walking'            // 自然步行
    | 'squat'              // 深蹲 (Postural)
    | 'arms_overhead';     // 双手上举

export type RoutineAction =
    | 'squat_exercise'     // 深蹲训练
    | 'running'            // 跑步
    | 'strength';          // 力量训练

export type ProfessionalAction =
    | 'climbing'           // 攀岩
    | 'volleyball'         // 排球
    | 'martial_arts';      // 武术

export type ActionType = BasicPostureAction | RoutineAction | ProfessionalAction;

export type ActionCategory = 'basic_posture' | 'routine' | 'professional';

// Camera Angles
export type CameraAngle = 'front' | 'side';

// Experience Level (for professional actions)
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ActionConfig {
    type: ActionType;
    category: ActionCategory;
    angle: CameraAngle;
    duration?: number;
    experienceLevel?: ExperienceLevel; // For professional actions
}

export type VisionError = {
    code: string;
    message: string;
};

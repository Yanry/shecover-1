import { LANDMARKS } from './types';
import type { PoseResult, ActionType } from './types';
import { calculateKneeValgusOffset, calculateAngle, calculateQAngle, calculateMidpoint } from './calculations';

export interface FrameRisk {
    frameIndex: number;
    timestamp: number;
    riskLevel: 'low' | 'medium' | 'high';
    issues: string[];
    dominantLoad: 'muscle' | 'ligament';
    qAngleLeft?: number;
    qAngleRight?: number;
    headOffset?: number;
    shoulderAsymmetry?: number;
    torsoLean?: number;
    pelvisDrop?: number;
}

export interface AnalysisSummary {
    overallRisk: 'low' | 'medium' | 'high';
    keyMoments: FrameRisk[];
    feedback: string;
    aclRisk?: 'low' | 'medium' | 'high';
    actionType: ActionType;
}

/**
 * 攀岩动作分析
 */
export const analyzeClimbingFrame = (pose: PoseResult, timestamp: number, index: number): FrameRisk => {
    const { landmarks } = pose;
    const issues: string[] = [];
    let riskScore = 0;
    let qAngleLeft: number | undefined;
    let qAngleRight: number | undefined;

    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];

    if (leftHip && leftKnee && leftAnkle) {
        const valgus = calculateKneeValgusOffset(leftHip, leftKnee, leftAnkle);
        if (valgus > 0.08) {
            issues.push('left_knee_valgus');
            riskScore += 2;
        }

        qAngleLeft = calculateQAngle(leftHip, leftKnee, leftAnkle);
        if (qAngleLeft !== undefined && qAngleLeft > 25) {
            issues.push('left_q_angle_very_high');
            riskScore += 3;
        } else if (qAngleLeft !== undefined && qAngleLeft > 20) {
            issues.push('left_q_angle_high');
            riskScore += 2;
        }
    }

    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

    if (rightHip && rightKnee && rightAnkle) {
        const valgus = calculateKneeValgusOffset(rightHip, rightKnee, rightAnkle);
        if (Math.abs(valgus) > 0.1) {
            issues.push('right_knee_instability');
            riskScore += 1;
        }

        qAngleRight = calculateQAngle(rightHip, rightKnee, rightAnkle);
        if (qAngleRight !== undefined && qAngleRight > 25) {
            issues.push('right_q_angle_very_high');
            riskScore += 3;
        } else if (qAngleRight !== undefined && qAngleRight > 20) {
            issues.push('right_q_angle_high');
            riskScore += 2;
        }
    }

    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

    if (leftShoulder && rightShoulder && leftShoulder.visibility! > 0.5 && rightShoulder.visibility! > 0.5) {
        const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        if (shoulderHeightDiff > 0.08) {
            issues.push('shoulder_misalignment');
            riskScore += 1;
        }
    }

    const nose = landmarks[LANDMARKS.NOSE];

    if (nose && leftShoulder && rightShoulder) {
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const headForward = Math.abs(nose.x - shoulderMidX);

        if (headForward > 0.12) {
            issues.push('neck_forward');
            riskScore += 1;
        }
    }

    const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
    const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];

    if (leftShoulder && leftElbow && leftWrist) {
        const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        if (leftArmAngle > 160) {
            issues.push('left_arm_overextended');
            riskScore += 1;
        }
    }

    if (rightShoulder && rightElbow && rightWrist) {
        const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        if (rightArmAngle > 160) {
            issues.push('right_arm_overextended');
            riskScore += 1;
        }
    }

    return {
        frameIndex: index,
        timestamp,
        riskLevel: riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
        issues,
        dominantLoad: riskScore >= 2 ? 'ligament' : 'muscle',
        qAngleLeft,
        qAngleRight,
    };
};

/**
 * 自然站立分析
 */
export const analyzeStandingFrame = (pose: PoseResult, timestamp: number, index: number): FrameRisk => {
    const { landmarks } = pose;
    const issues: string[] = [];
    let riskScore = 0;

    const nose = landmarks[LANDMARKS.NOSE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];

    if (nose && leftShoulder && rightShoulder) {
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const headOffset = Math.abs(nose.x - shoulderMidX);

        if (headOffset > 0.08) {
            issues.push('head_lateral_shift');
            riskScore += 2;
        }
    }

    if (leftShoulder && rightShoulder && leftShoulder.visibility! > 0.5 && rightShoulder.visibility! > 0.5) {
        const shoulderAsymmetry = Math.abs(leftShoulder.y - rightShoulder.y);

        if (shoulderAsymmetry > 0.06) {
            issues.push('shoulder_asymmetry');
            riskScore += 2;
        }
    }

    if (leftHip && rightHip && leftShoulder && rightShoulder) {
        const shoulderMid = calculateMidpoint(leftShoulder, rightShoulder);
        const hipMid = calculateMidpoint(leftHip, rightHip);

        const torsoLean = Math.abs(shoulderMid.x - hipMid.x);

        if (torsoLean > 0.05) {
            issues.push('torso_lateral_shift');
            riskScore += 1;
        }
    }

    return {
        frameIndex: index,
        timestamp,
        riskLevel: riskScore >= 3 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
        issues,
        dominantLoad: riskScore >= 2 ? 'ligament' : 'muscle',
    };
};

/**
 * 单脚站立分析
 */
export const analyzeSingleLegFrame = (pose: PoseResult, timestamp: number, index: number): FrameRisk => {
    const { landmarks } = pose;
    const issues: string[] = [];
    let riskScore = 0;

    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const nose = landmarks[LANDMARKS.NOSE];

    if (leftHip && rightHip && leftHip.visibility! > 0.5 && rightHip.visibility! > 0.5) {
        const pelvisDrop = Math.abs(leftHip.y - rightHip.y);

        if (pelvisDrop > 0.08) {
            issues.push('pelvis_drop');
            riskScore += 3;
        } else if (pelvisDrop > 0.05) {
            issues.push('pelvis_instability');
            riskScore += 1;
        }
    }

    if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const shoulderMid = calculateMidpoint(leftShoulder, rightShoulder);
        const hipMid = calculateMidpoint(leftHip, rightHip);

        const torsoLean = Math.abs(shoulderMid.x - hipMid.x);

        if (torsoLean > 0.08) {
            issues.push('torso_lean');
            riskScore += 2;
        }
    }

    if (leftHip && leftKnee && leftAnkle) {
        const valgus = calculateKneeValgusOffset(leftHip, leftKnee, leftAnkle);
        if (valgus > 0.1) {
            issues.push('support_leg_valgus_left');
            riskScore += 2;
        }
    }

    if (rightHip && rightKnee && rightAnkle) {
        const valgus = calculateKneeValgusOffset(rightHip, rightKnee, rightAnkle);
        if (Math.abs(valgus) > 0.1) {
            issues.push('support_leg_valgus_right');
            riskScore += 2;
        }
    }

    const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];

    if (leftShoulder && leftElbow) {
        const armAbduction = Math.abs(leftElbow.x - leftShoulder.x);
        if (armAbduction > 0.15) {
            issues.push('arm_compensation');
            riskScore += 1;
        }
    }

    if (nose && leftShoulder && rightShoulder) {
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const neckLean = Math.abs(nose.x - shoulderMidX);

        if (neckLean > 0.1) {
            issues.push('neck_compensation');
            riskScore += 1;
        }
    }

    return {
        frameIndex: index,
        timestamp,
        riskLevel: riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
        issues,
        dominantLoad: riskScore >= 2 ? 'ligament' : 'muscle',
    };
};

/**
 * 步行分析
 */
export const analyzeWalkingFrame = (pose: PoseResult, timestamp: number, index: number): FrameRisk => {
    const { landmarks } = pose;
    const issues: string[] = [];
    let riskScore = 0;

    // Similar to standing but check for gait asymmetry
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];

    if (leftHip && rightHip) {
        const pelvisTilt = Math.abs(leftHip.y - rightHip.y);
        if (pelvisTilt > 0.06) {
            issues.push('gait_asymmetry');
            riskScore += 2;
        }
    }

    if (leftHip && leftKnee) {
        const valgus = calculateKneeValgusOffset(leftHip, leftKnee, landmarks[LANDMARKS.LEFT_ANKLE]);
        if (valgus > 0.08) {
            issues.push('left_knee_valgus_walking');
            riskScore += 1;
        }
    }

    return {
        frameIndex: index,
        timestamp,
        riskLevel: riskScore >= 2 ? 'high' : riskScore >= 1 ? 'medium' : 'low',
        issues,
        dominantLoad: riskScore >= 1 ? 'ligament' : 'muscle',
    };
};

/**
 * 深蹲分析
 */
export const analyzeSquatFrame = (pose: PoseResult, timestamp: number, index: number): FrameRisk => {
    const { landmarks } = pose;
    const issues: string[] = [];
    let riskScore = 0;

    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

    // Check knee valgus during squat
    if (leftHip && leftKnee && leftAnkle) {
        const valgus = calculateKneeValgusOffset(leftHip, leftKnee, leftAnkle);
        if (valgus > 0.1) {
            issues.push('squat_knee_valgus_left');
            riskScore += 3;
        }
    }

    if (rightHip && rightKnee && rightAnkle) {
        const valgus = calculateKneeValgusOffset(rightHip, rightKnee, rightAnkle);
        if (Math.abs(valgus) > 0.1) {
            issues.push('squat_knee_valgus_right');
            riskScore += 3;
        }
    }

    // Check knee forward travel
    if (leftKnee && leftAnkle) {
        const kneeAnkleOffset = leftKnee.x - leftAnkle.x;
        if (Math.abs(kneeAnkleOffset) > 0.1) {
            issues.push('knee_forward_travel');
            riskScore += 1;
        }
    }

    return {
        frameIndex: index,
        timestamp,
        riskLevel: riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
        issues,
        dominantLoad: riskScore >= 2 ? 'ligament' : 'muscle',
    };
};

/**
 * 双手上举分析
 */
export const analyzeArmsOverheadFrame = (pose: PoseResult, timestamp: number, index: number): FrameRisk => {
    const { landmarks } = pose;
    const issues: string[] = [];
    let riskScore = 0;

    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
    const nose = landmarks[LANDMARKS.NOSE];

    // Check shoulder elevation symmetry
    if (leftShoulder && rightShoulder) {
        const shoulderAsymmetry = Math.abs(leftShoulder.y - rightShoulder.y);
        if (shoulderAsymmetry > 0.06) {
            issues.push('shoulder_elevation_asymmetry');
            riskScore += 2;
        }
    }

    // Check for compensatory forward head
    if (nose && leftShoulder && rightShoulder) {
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        const headForward = nose.y - shoulderMidY;
        if (headForward > 0.08) {
            issues.push('forward_head_overhead');
            riskScore += 1;
        }
    }

    // Check arm extension
    if (leftShoulder && leftElbow && leftWrist) {
        const armAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        if (armAngle < 140) {
            issues.push('limited_overhead_range');
            riskScore += 1;
        }
    }

    return {
        frameIndex: index,
        timestamp,
        riskLevel: riskScore >= 3 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
        issues,
        dominantLoad: riskScore >= 2 ? 'ligament' : 'muscle',
    };
};

/**
 * 统一分析接口
 */
export const analyzeFrame = (
    pose: PoseResult,
    timestamp: number,
    index: number,
    actionType: ActionType = 'standing'
): FrameRisk => {
    switch (actionType) {
        case 'climbing':
            return analyzeClimbingFrame(pose, timestamp, index);
        case 'standing':
            return analyzeStandingFrame(pose, timestamp, index);
        case 'single_leg_standing':
            return analyzeSingleLegFrame(pose, timestamp, index);
        case 'walking':
            return analyzeWalkingFrame(pose, timestamp, index);
        case 'squat':
            return analyzeSquatFrame(pose, timestamp, index);
        case 'arms_overhead':
            return analyzeArmsOverheadFrame(pose, timestamp, index);
        default:
            return analyzeStandingFrame(pose, timestamp, index);
    }
};

/**
 * 汇总分析
 */
export const summarizeAnalysis = (frames: FrameRisk[], actionType: ActionType = 'standing'): AnalysisSummary => {
    const higRiskFrames = frames.filter(f => f.riskLevel === 'high');
    const mediumRiskFrames = frames.filter(f => f.riskLevel === 'medium');

    const qAngleIssues = frames.filter(f =>
        f.issues.some(i => i.includes('q_angle'))
    );

    let aclRisk: 'low' | 'medium' | 'high' = 'low';
    if (qAngleIssues.length > 10) {
        aclRisk = 'high';
    } else if (qAngleIssues.length > 5) {
        aclRisk = 'medium';
    }

    let overall = 'low';
    if (higRiskFrames.length > 5) overall = 'high';
    else if (mediumRiskFrames.length > 10) overall = 'medium';

    let feedback = "动作稳定，肌肉主导发力！";

    if (overall === 'high') {
        feedback = "检测到瞬间高负荷。";
    } else if (overall === 'medium') {
        feedback = "整体稳定，局部有待观察。";
    }

    return {
        overallRisk: overall as 'low' | 'medium' | 'high',
        keyMoments: higRiskFrames.length > 0 ? higRiskFrames : mediumRiskFrames,
        feedback,
        aclRisk,
        actionType,
    };
};

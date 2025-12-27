import { LANDMARKS } from './types';
import type { PoseResult } from './types';
import { calculateKneeValgusOffset } from './calculations';

export interface FrameRisk {
    frameIndex: number;
    timestamp: number;
    riskLevel: 'low' | 'medium' | 'high';
    issues: string[]; // e.g., 'knee_valgus', 'ankle_instability'
    dominantLoad: 'muscle' | 'ligament';
}

export interface AnalysisSummary {
    overallRisk: 'low' | 'medium' | 'high';
    keyMoments: FrameRisk[];
    feedback: string;
}

/**
 * Detects specific risk patterns in a single frame.
 */
export const analyzeFrame = (pose: PoseResult, timestamp: number, index: number): FrameRisk => {
    const { landmarks } = pose;
    const issues: string[] = [];
    let riskScore = 0;

    // 1. Check Knee Valgus (Left)
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];

    if (leftHip && leftKnee && leftAnkle) {
        const valgus = calculateKneeValgusOffset(leftHip, leftKnee, leftAnkle);
        // Threshold: > 0.08 (Normalized) implies significant inward deviation
        if (valgus > 0.08) {
            issues.push('left_knee_valgus');
            riskScore += 2;
        }
    }

    // 2. Check Knee Valgus (Right)
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

    if (rightHip && rightKnee && rightAnkle) {
        const valgus = calculateKneeValgusOffset(rightHip, rightKnee, rightAnkle);
        // Check absolute or signed depending on leg side logic.
        if (Math.abs(valgus) > 0.1) {
            issues.push('right_knee_instability');
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
 * Aggregates frame risks into a full summary.
 */
export const summarizeAnalysis = (frames: FrameRisk[]): AnalysisSummary => {
    // Find the "worst" moment
    const higRiskFrames = frames.filter(f => f.riskLevel === 'high');
    const mediumRiskFrames = frames.filter(f => f.riskLevel === 'medium');

    let overall = 'low';
    if (higRiskFrames.length > 5) overall = 'high'; // Sustained high risk
    else if (mediumRiskFrames.length > 10) overall = 'medium';

    // Simple feedback generation (Placeholder for the Translator)
    let feedback = "Your movement looks stable. Muscles are doing the work!";

    if (overall === 'high') {
        feedback = "Momentary high load on ligaments detected.";
    } else if (overall === 'medium') {
        feedback = "Generally stable with some wobbles.";
    }

    return {
        overallRisk: overall as 'low' | 'medium' | 'high',
        keyMoments: higRiskFrames.length > 0 ? higRiskFrames : mediumRiskFrames,
        feedback
    };
};

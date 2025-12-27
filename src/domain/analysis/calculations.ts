import type { Point2D } from './types';

export const calculateAngle = (a: Point2D, b: Point2D, c: Point2D): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
        angle = 360.0 - angle;
    }
    return angle;
};

// Project point P onto line AB
export const projectPointOnLine = (p: Point2D, a: Point2D, b: Point2D): Point2D => {
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ab2 = ab.x * ab.x + ab.y * ab.y;
    const dot = ap.x * ab.x + ap.y * ab.y;
    const t = dot / ab2;
    return {
        x: a.x + ab.x * t,
        y: a.y + ab.y * t,
    };
};

/**
 * Calculates Knee Valgus score.
 * Simplification: Deviation of Knee from the Hip-Ankle line.
 * Positive value = Valgus (Inward collapse).
 */
export const calculateKneeValgusOffset = (hip: Point2D, knee: Point2D, ankle: Point2D): number => {
    // Can use 2D distance of Knee from Line(Hip, Ankle)
    // Signed distance to know direction? 
    // For 2D MVP: Check if Knee X is between Hip X and Ankle X (if vertical).
    // Better: Cross product to find side.

    // Vector Hip->Ankle
    const haX = ankle.x - hip.x;
    const haY = ankle.y - hip.y;

    // Vector Hip->Knee
    const hkX = knee.x - hip.x;
    const hkY = knee.y - hip.y;

    // Cross product (z-component)
    // If positive/negative determines side.
    // We need to know which leg it is to determine "Inward".
    // Let's return raw deviation for now.

    // Normalize by leg length for scale invariance (optional but good)
    const legLength = Math.hypot(haX, haY);

    // Perpendicular distance
    const crossProd = haX * hkY - haY * hkX;
    const distance = crossProd / legLength;

    return distance;
};

export const calculateMidpoint = (a: Point2D, b: Point2D): Point2D => {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
    };
};

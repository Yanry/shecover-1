import type { AnalysisSummary } from '../analysis/RiskEngine';

/**
 * Translator: Converts technical analysis into "Body Language".
 */
export const translateToFeedback = (summary: AnalysisSummary, userName: string = 'Climber'): string => {
    if (summary.overallRisk === 'low') {
        return `Great flow, ${userName}. Your muscles are actively stabilizing your joints, keeping the load off your ligaments. Keep engaging those glutes!`;
    }

    const mainIssue = summary.keyMoments[0]?.issues[0]; // Take the first significant issue

    if (mainIssue?.includes('valgus')) {
        return `Deep breaths, ${userName}. We noticed your knee drifting inward during big moves. \n\nThis usually means your ligaments are hanging on to keep you stable, rather than your hip muscles. \n\nTip: Visualize 'screwing' your foot into the wall to activate your outer hip measurements.`;
    }

    if (mainIssue?.includes('instability')) {
        return `You're pushing hard! We saw some wobbles in the ankle. \n\nWhen the ankle isn't locked, the knee has to compensate. \n\nTry to keep your heel lower to engage the calf muscles for stability.`;
    }

    return `We see you working hard on the wall. \n\nThere are moments of high tension in the joints. Focus on smooth, controlled breathing to help your muscles relax and engage at the right time.`;
};

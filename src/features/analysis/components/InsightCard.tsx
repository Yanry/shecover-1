import type { AnalysisSummary } from '../../../domain/analysis/RiskEngine';
import { translateToFeedback } from '../../../domain/feedback/Translator';

interface InsightCardProps {
    summary: AnalysisSummary;
    userName?: string;
}

export function InsightCard({ summary, userName = 'Climber' }: InsightCardProps) {
    const feedback = translateToFeedback(summary, userName);
    const isHighRisk = summary.overallRisk === 'high';
    const isMedRisk = summary.overallRisk === 'medium';

    const borderColor = isHighRisk ? 'var(--color-load-high)' : isMedRisk ? 'var(--color-load-med)' : 'var(--color-success)';
    const bgColor = isHighRisk ? '#FEF2F2' : isMedRisk ? '#FFFBEB' : '#ECFDF5';

    return (
        <div style={{
            background: bgColor,
            borderLeft: `4px solid ${borderColor}`,
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            marginTop: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '1.5rem', marginRight: '12px' }}>
                    {isHighRisk ? '🧡' : isMedRisk ? '✨' : '🌿'}
                </div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                    {isHighRisk ? 'High Load Detected' : isMedRisk ? 'Check-in Needed' : 'Smooth Flow'}
                </h3>
            </div>

            <p style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', color: '#374151', lineHeight: '1.6' }}>
                {feedback}
            </p>
        </div>
    );
}

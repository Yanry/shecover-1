import { useState } from 'react';

interface AssessmentViewProps {
    onComplete: () => void;
    onSkip: () => void;
}

export function AssessmentView({ onComplete, onSkip }: AssessmentViewProps) {
    // Placeholder flow for now.
    // In real implementation this would guide through the 5 basic actions.
    const [isAssessing, setIsAssessing] = useState(false);

    if (isAssessing) {
        return (
            <div style={{ textAlign: 'center', padding: '32px' }}>
                <h2>姿态评估进行中...</h2>
                <p>这里将引导用户完成自然站立、单腿站立等基础动作。</p>
                <div style={{ margin: '40px 0', fontSize: '3rem' }}>🏃‍♀️</div>
                <button
                    onClick={onComplete}
                    style={{
                        padding: '16px 32px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    模拟完成评估
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            <h1>体态评估</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                在开始专项运动分析前，建议先进行基础体态评估，
                帮助我们了解你的身体基准线。
            </p>

            <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid #eee', marginBottom: '32px' }}>
                <h3 style={{ marginTop: 0 }}>包含项目：</h3>
                <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
                    <li>自然站立 (30s)</li>
                    <li>单腿站立 (20s)</li>
                    <li>自然步行</li>
                    <li>双脚深蹲</li>
                    <li>手臂上举</li>
                </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                    onClick={() => setIsAssessing(true)}
                    style={{
                        padding: '16px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    开始评估
                </button>

                <button
                    onClick={onSkip}
                    style={{
                        padding: '16px',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        border: 'none',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    跳过，直接进入运动分析
                </button>
            </div>
        </div>
    );
}

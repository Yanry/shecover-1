import { useState } from 'react';
import { useUser } from './UserContext';
import type { TrainingLevel } from './UserContext';

export function OnboardingView({ onComplete }: { onComplete: () => void }) {
    const { updateProfile, completeOnboarding } = useUser();
    const [step, setStep] = useState(0);
    const [height, setHeight] = useState(165);
    const [level, setLevel] = useState<TrainingLevel>('beginner');

    // Steps: 
    // 0. Intro
    // 1. Height (Leverage)
    // 2. Experience (Context)
    // 3. Ready

    const handleFinish = () => {
        updateProfile({ heightCm: height, trainingLevel: level });
        completeOnboarding();
        onComplete();
    };

    const containerStyle = {
        padding: '32px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center' as const,
    };

    const buttonStyle = {
        background: 'var(--color-primary)',
        color: 'white',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        fontSize: '1.0rem',
        marginTop: 'auto',
        fontWeight: 600,
    };

    const inputStyle = {
        width: '100%',
        padding: '16px',
        fontSize: '1.5rem',
        textAlign: 'center' as const,
        border: '2px solid var(--color-secondary)',
        borderRadius: 'var(--radius-sm)',
        outline: 'none',
    };

    if (step === 0) {
        return (
            <div style={containerStyle}>
                <div style={{ fontSize: '3rem' }}>🌿</div>
                <h1>Welcome to Shecover</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                    We help you understand your body's unique movement language.
                    <br /><br />
                    Let's align the analysis to your structure.
                </p>
                <button style={buttonStyle} onClick={() => setStep(1)}>
                    Start Setup
                </button>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div style={containerStyle}>
                <h2>Your Structure</h2>
                <p>Height helps us calculate your leverage and angles more accurately.</p>

                <div style={{ margin: '32px 0' }}>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        style={inputStyle}
                    />
                    <div style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>cm</div>
                </div>

                <button style={buttonStyle} onClick={() => setStep(2)}>
                    Next
                </button>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div style={containerStyle}>
                <h2>Your Journey</h2>
                <p>How long have you been climbing? This helps us tailor the feedback.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    {[
                        { id: 'beginner', label: 'Just starting', desc: '< 1 year' },
                        { id: 'intermediate', label: 'Regular Climber', desc: '1-3 years' },
                        { id: 'advanced', label: 'Experienced', desc: '3+ years' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setLevel(opt.id as TrainingLevel)}
                            style={{
                                ...buttonStyle,
                                background: level === opt.id ? 'var(--color-primary-dark)' : 'white',
                                color: level === opt.id ? 'white' : 'var(--color-text-primary)',
                                border: level === opt.id ? 'none' : '2px solid rgba(0,0,0,0.05)',
                                textAlign: 'left',
                                padding: '20px',
                                marginTop: 0
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>{opt.label}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{opt.desc}</div>
                        </button>
                    ))}
                </div>

                <button style={buttonStyle} onClick={handleFinish}>
                    Complete
                </button>
            </div>
        );
    }

    return null;
}

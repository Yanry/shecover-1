import { useState } from 'react';
import {
    useUser,
    type AgeGroup,
    type MenstrualCyclePhase,
    type ExerciseFrequency,
    type ExerciseType,
    type DominantSide,
    type PainPart
} from './UserContext';

export function OnboardingView({ onComplete }: { onComplete: () => void }) {
    const { updateProfile, completeOnboarding } = useUser();
    const [step, setStep] = useState(0);

    // Form state
    const [height, setHeight] = useState(165);
    const [ageGroup, setAgeGroup] = useState<AgeGroup>('26_35');
    const [menstrualCycle, setMenstrualCycle] = useState<MenstrualCyclePhase | undefined>(undefined);
    const [exerciseFrequency, setExerciseFrequency] = useState<ExerciseFrequency>('2_3');
    const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
    const [dominantSide, setDominantSide] = useState<DominantSide>('right');
    const [hasInjury, setHasInjury] = useState<boolean>(false);

    // Injury details
    const [painParts, setPainParts] = useState<PainPart[]>([]);
    const [painLevel, setPainLevel] = useState<number>(1);
    const [isDiagnosed, setIsDiagnosed] = useState<boolean>(false);
    const [diagnosisDetails, setDiagnosisDetails] = useState('');

    const handleFinish = () => {
        updateProfile({
            heightCm: height,
            ageGroup,
            menstrualCycle,
            exerciseFrequency,
            exerciseTypes,
            dominantSide,
            hasInjury,
            painParts: hasInjury ? painParts : [],
            painLevel: hasInjury ? painLevel : undefined,
            isDiagnosed: hasInjury ? isDiagnosed : undefined,
            diagnosisDetails: (hasInjury && isDiagnosed) ? diagnosisDetails : undefined,
            injuries: (hasInjury && diagnosisDetails) ? [diagnosisDetails] : []
        });
        completeOnboarding();
        onComplete();
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const containerStyle = {
        padding: '32px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center' as const,
        maxWidth: '400px',
        margin: '0 auto',
    };

    const buttonStyle = {
        background: 'var(--color-primary)',
        color: 'white',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        fontSize: '1.0rem',
        marginTop: '24px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        width: '100%'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        marginTop: '8px',
    };

    const inputStyle = {
        width: '100%',
        padding: '16px',
        fontSize: '1.2rem',
        textAlign: 'center' as const,
        border: '2px solid var(--color-secondary)',
        borderRadius: 'var(--radius-sm)',
        outline: 'none',
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)'
    };

    const selectOptionStyle = (selected: boolean) => ({
        padding: '12px',
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
        borderRadius: 'var(--radius-sm)',
        marginBottom: '10px',
        cursor: 'pointer',
        background: selected ? 'var(--color-primary-light)' : 'transparent',
        transition: 'all 0.2s'
    });

    // 步骤 0: 欢迎
    if (step === 0) {
        return (
            <div style={containerStyle}>
                <div style={{ fontSize: '3rem' }}>🌿</div>
                <h1>欢迎使用 Shecover</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                    帮助你理解身体的独特运动语言。
                    <br /><br />
                    让我们根据你的身体结构调整分析。
                </p>
                <button style={buttonStyle} onClick={nextStep}>
                    开始设置
                </button>
            </div>
        );
    }

    // 步骤 1: 身高
    if (step === 1) {
        return (
            <div style={containerStyle}>
                <h2>你的身体结构</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>身高帮助我们更准确地计算你的杠杆和角度。</p>

                <div style={{ margin: '32px 0' }}>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        style={inputStyle}
                    />
                    <div style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>厘米</div>
                </div>

                <button style={buttonStyle} onClick={nextStep}>下一步</button>
                <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
            </div>
        );
    }

    // 步骤 2: 年龄段
    if (step === 2) {
        const options: { value: AgeGroup; label: string }[] = [
            { value: 'under_18', label: '18岁以下' },
            { value: '18_25', label: '18-25岁' },
            { value: '26_35', label: '26-35岁' },
            { value: '36_45', label: '36-45岁' },
            { value: '46_60', label: '46-60岁' },
            { value: 'over_60', label: '60岁以上' },
        ];

        return (
            <div style={containerStyle}>
                <h2>你的年龄段</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            style={selectOptionStyle(ageGroup === opt.value)}
                            onClick={() => setAgeGroup(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
                <button style={buttonStyle} onClick={nextStep}>下一步</button>
                <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
            </div>
        );
    }

    // 步骤 3: 生理期
    const isMenstrualRelevant = ['18_25', '26_35', '36_45', '46_60'].includes(ageGroup);

    if (step === 3) {
        if (!isMenstrualRelevant) {
            return (
                <div style={containerStyle}>
                    <h2>生理周期</h2>
                    <p>根据年龄段，此项可能不适用。</p>
                    <button style={buttonStyle} onClick={nextStep}>跳过</button>
                    <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
                </div>
            );
        }

        const options: { value: MenstrualCyclePhase; label: string }[] = [
            { value: 'follicular', label: '滤泡期 (结束后7-14天)' },
            { value: 'ovulation', label: '排卵期' },
            { value: 'luteal', label: '黄体期 (经前)' },
            { value: 'menstrual', label: '月经期' },
            { value: 'irregular', label: '不规律/其他' },
        ];

        return (
            <div style={containerStyle}>
                <h2>当前生理周期</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>激素水平会影响韧带松弛度。</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            style={selectOptionStyle(menstrualCycle === opt.value)}
                            onClick={() => setMenstrualCycle(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
                <button style={buttonStyle} onClick={nextStep}>下一步</button>
                <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
            </div>
        );
    }

    // 步骤 4: 运动频率
    if (step === 4) {
        const options: { value: ExerciseFrequency; label: string }[] = [
            { value: '0_1', label: '每周 0-1 次' },
            { value: '2_3', label: '每周 2-3 次' },
            { value: '4_5', label: '每周 4-5 次' },
            { value: '6_plus', label: '每周 6次以上' },
        ];

        return (
            <div style={containerStyle}>
                <h2>运动频率</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            style={selectOptionStyle(exerciseFrequency === opt.value)}
                            onClick={() => setExerciseFrequency(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
                <button style={buttonStyle} onClick={nextStep}>下一步</button>
                <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
            </div>
        );
    }

    // 步骤 5: 运动类型
    if (step === 5) {
        const options: { value: ExerciseType; label: string }[] = [
            { value: 'running', label: '跑步' },
            { value: 'strength', label: '力量训练' },
            { value: 'climbing', label: '攀岩' },
            { value: 'ball_sports', label: '球类运动' },
            { value: 'other', label: '其他' },
        ];

        const toggleType = (type: ExerciseType) => {
            if (exerciseTypes.includes(type)) {
                setExerciseTypes(prev => prev.filter(t => t !== type));
            } else {
                setExerciseTypes(prev => [...prev, type]);
            }
        };

        return (
            <div style={containerStyle}>
                <h2>平时常做的运动</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>可从多选</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            style={selectOptionStyle(exerciseTypes.includes(opt.value))}
                            onClick={() => toggleType(opt.value)}
                        >
                            {opt.label} {exerciseTypes.includes(opt.value) && '✓'}
                        </div>
                    ))}
                </div>
                <button style={buttonStyle} onClick={nextStep}>下一步</button>
                <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
            </div>
        );
    }

    // 步骤 6: 优势侧
    if (step === 6) {
        const options: { value: DominantSide; label: string }[] = [
            { value: 'right', label: '右侧' },
            { value: 'left', label: '左侧' },
            { value: 'unsure', label: '不确定/双侧' },
        ];

        return (
            <div style={containerStyle}>
                <h2>优势侧</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>通常是你更有力或更灵活的一侧。</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            style={selectOptionStyle(dominantSide === opt.value)}
                            onClick={() => setDominantSide(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
                <button style={buttonStyle} onClick={nextStep}>下一步</button>
                <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
            </div>
        );
    }

    // 步骤 7: 伤病历史 (主开关)
    if (step === 7) {
        return (
            <div style={containerStyle}>
                <h2>是否有既往损伤？</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>特别是关于膝盖、脚踝或髋关节的损伤。</p>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div
                        style={{ ...selectOptionStyle(hasInjury === true), flex: 1, textAlign: 'center' }}
                        onClick={() => setHasInjury(true)}
                    >
                        有
                    </div>
                    <div
                        style={{ ...selectOptionStyle(hasInjury === false), flex: 1, textAlign: 'center' }}
                        onClick={() => setHasInjury(false)}
                    >
                        没有
                    </div>
                </div>

                <button style={buttonStyle} onClick={() => {
                    if (hasInjury) {
                        setStep(8); // Go to detailed injury
                    } else {
                        handleFinish();
                    }
                }}>
                    {hasInjury ? '下一步' : '完成设置'}
                </button>
                <button style={secondaryButtonStyle} onClick={prevStep}>返回</button>
            </div>
        );
    }

    // 步骤 8: 损伤详情 (如果 "有")
    if (step === 8) {
        const parts: { value: PainPart; label: string }[] = [
            { value: 'knee', label: '膝盖' },
            { value: 'ankle', label: '脚踝' },
            { value: 'hip', label: '髋部' },
            { value: 'waist', label: '腰部' },
            { value: 'shoulder', label: '肩膀' },
        ];

        const togglePart = (part: PainPart) => {
            if (painParts.includes(part)) {
                setPainParts(prev => prev.filter(p => p !== part));
            } else {
                setPainParts(prev => [...prev, part]);
            }
        };

        return (
            <div style={containerStyle}>
                <h2>损伤详情</h2>

                {/* 疼痛部位 */}
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>疼痛部位 (多选)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {parts.map(p => (
                            <div
                                key={p.value}
                                onClick={() => togglePart(p.value)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: `1px solid ${painParts.includes(p.value) ? 'var(--color-primary)' : '#ccc'}`,
                                    background: painParts.includes(p.value) ? 'var(--color-primary-light)' : 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                {p.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 疼痛等级 */}
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>疼痛等级 (1-10): {painLevel}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={painLevel}
                        onChange={(e) => setPainLevel(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                        <span>轻微</span>
                        <span>剧烈</span>
                    </div>
                </div>

                {/* 是否确诊 */}
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>是否已就医确诊</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div
                            style={{ ...selectOptionStyle(isDiagnosed === true), flex: 1, textAlign: 'center', marginBottom: 0 }}
                            onClick={() => setIsDiagnosed(true)}
                        >
                            是
                        </div>
                        <div
                            style={{ ...selectOptionStyle(isDiagnosed === false), flex: 1, textAlign: 'center', marginBottom: 0 }}
                            onClick={() => setIsDiagnosed(false)}
                        >
                            否
                        </div>
                    </div>
                </div>

                {/* 确诊详情 */}
                {isDiagnosed && (
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>确诊名称/描述</label>
                        <input
                            value={diagnosisDetails}
                            onChange={(e) => setDiagnosisDetails(e.target.value)}
                            placeholder="例如：前交叉韧带断裂..."
                            style={{ ...inputStyle, padding: '12px', textAlign: 'left', fontSize: '1rem' }}
                        />
                    </div>
                )}

                <button style={buttonStyle} onClick={handleFinish}>
                    完成设置
                </button>
                <button style={secondaryButtonStyle} onClick={() => setStep(7)}>返回</button>
            </div>
        );
    }

    return null;
}

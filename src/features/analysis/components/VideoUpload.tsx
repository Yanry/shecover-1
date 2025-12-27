import { useRef, useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { ActionType, CameraAngle, ExperienceLevel } from '../../../domain/analysis/types';

interface VideoUploadProps {
    onFileSelect: (
        file: File,
        url: string,
        actionType: ActionType,
        angle: CameraAngle,
        experienceLevel?: ExperienceLevel
    ) => void;
    defaultAction?: ActionType;
}

export function VideoUpload({ onFileSelect, defaultAction }: VideoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [actionType, setActionType] = useState<ActionType>('standing');
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');

    // If defaultAction is provided, sync state with it
    useEffect(() => {
        if (defaultAction) {
            setActionType(defaultAction);
        }
    }, [defaultAction]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onFileSelect(
                file,
                url,
                actionType,
                cameraAngle,
                experienceLevel
            );
        }
    };

    const isProfessional = ['climbing', 'volleyball', 'martial_arts'].includes(actionType);

    // Type Labels map for display if pre-selected
    const actionLabels: Record<string, string> = {
        standing: '自然站立',
        single_leg_standing: '单脚站立',
        walking: '自然步行',
        squat: '体态深蹲',
        arms_overhead: '双手上举',
        squat_exercise: '深蹲训练',
        running: '跑步',
        strength: '力量训练',
        climbing: '攀岩',
        volleyball: '排球',
        martial_arts: '武术'
    };

    const angleOptions = [
        { value: 'front' as CameraAngle, label: '正面' },
        { value: 'side' as CameraAngle, label: '侧面' },
    ];

    const experienceLevels = [
        { value: 'beginner' as ExperienceLevel, label: '初学者', desc: '< 1年' },
        { value: 'intermediate' as ExperienceLevel, label: '中级', desc: '1-3年' },
        { value: 'advanced' as ExperienceLevel, label: '高级', desc: '3年+' },
    ];

    return (
        <div style={{ textAlign: 'left' }}>
            {/* If defaultAction is not provided, we might want to show selector, 
                but based on new flow, we always pass defaultAction unless we are in standalone mode. 
                For now, let's just show what is selected or hide it.
                User flow says: Select in Menu -> Upload. 
                So here we just confirm the details or verify angle/experience.
            */}

            <div style={{ marginBottom: '24px', background: '#F3F4F6', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#666' }}>当前分析动作</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {actionLabels[actionType] || actionType}
                    </span>
                    {/* Add a button to change action if needed? 
                        The parent view has a "Back to Menu" button, so here we assume it's fixed. 
                    */}
                </div>
            </div>

            {/* Experience Level Selection (for professional actions only) */}
            {isProfessional && (
                <div style={{ marginBottom: '24px', background: '#F9FAFB', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '1.0rem' }}>运动经历时长</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {experienceLevels.map((level) => (
                            <button
                                key={level.value}
                                onClick={() => setExperienceLevel(level.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: experienceLevel === level.value ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                                    background: experienceLevel === level.value ? 'white' : '#F9FAFB',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontWeight: 600, color: experienceLevel === level.value ? 'var(--color-primary)' : '#374151' }}>
                                            {level.label}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: '#6B7280', marginLeft: '8px' }}>
                                            {level.desc}
                                        </span>
                                    </div>
                                    {experienceLevel === level.value && (
                                        <span style={{ color: 'var(--color-primary)' }}>✓</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Camera Angle Selection */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>拍摄角度</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {angleOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setCameraAngle(option.value)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: cameraAngle === option.value ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                                background: cameraAngle === option.value ? '#EEF2FF' : 'white',
                                fontWeight: cameraAngle === option.value ? 600 : 400,
                                color: cameraAngle === option.value ? 'var(--color-primary)' : '#374151',
                                cursor: 'pointer',
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* File Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                style={{ display: 'none' }}
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: '2px dashed var(--color-text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '40px',
                    cursor: 'pointer',
                    background: 'var(--color-bg)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📹</div>
                <h3 style={{ marginBottom: '8px' }}>选择要分析的视频</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    支持 MP4, MOV 格式
                    <br />
                    (推荐 10-40 秒)
                </p>
            </div>

            <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                🔒 隐私保护：视频在你的设备上本地处理，不会上传到任何服务器。
            </p>
        </div>
    );
}

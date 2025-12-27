import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ActionType, CameraAngle, ActionCategory, ExperienceLevel } from '../../../domain/analysis/types';

interface VideoUploadProps {
    onFileSelect: (
        file: File,
        url: string,
        actionType: ActionType,
        angle: CameraAngle,
        experienceLevel?: ExperienceLevel
    ) => void;
}

export function VideoUpload({ onFileSelect }: VideoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [actionCategory, setActionCategory] = useState<ActionCategory>('basic_posture');
    const [actionType, setActionType] = useState<ActionType>('standing');
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onFileSelect(
                file,
                url,
                actionType,
                cameraAngle,
                actionCategory === 'professional' ? experienceLevel : undefined
            );
        }
    };

    const handleActionTypeChange = (type: ActionType, category: ActionCategory) => {
        setActionType(type);
        setActionCategory(category);
    };

    const basicPostureActions = [
        { value: 'standing' as ActionType, label: '自然站立', desc: '30秒 - 头部、肩膀、躯干对齐' },
        { value: 'single_leg_standing' as ActionType, label: '单脚站立', desc: '30秒 - 骨盆稳定、平衡能力' },
        { value: 'walking' as ActionType, label: '自然步行', desc: '10步 - 步态对称、髋膝稳定' },
        { value: 'squat' as ActionType, label: '深蹲', desc: '5次 - 膝盖追踪、骨盆控制' },
        { value: 'arms_overhead' as ActionType, label: '双手上举', desc: '30秒 - 肩膀灵活性、脊柱稳定' },
    ];

    const professionalActions = [
        { value: 'climbing' as ActionType, label: '攀岩', desc: '完整动作 - Q角、ACL风险、动态平衡' },
    ];

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
            {/* Category Selection */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>动作分类</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                        onClick={() => {
                            setActionCategory('basic_posture');
                            setActionType('standing');
                        }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: actionCategory === 'basic_posture' ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                            background: actionCategory === 'basic_posture' ? '#EEF2FF' : 'white',
                            fontWeight: actionCategory === 'basic_posture' ? 600 : 400,
                            color: actionCategory === 'basic_posture' ? 'var(--color-primary)' : '#374151',
                            cursor: 'pointer',
                        }}
                    >
                        基础体态
                    </button>
                    <button
                        onClick={() => {
                            setActionCategory('professional');
                            setActionType('climbing');
                        }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: actionCategory === 'professional' ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                            background: actionCategory === 'professional' ? '#EEF2FF' : 'white',
                            fontWeight: actionCategory === 'professional' ? 600 : 400,
                            color: actionCategory === 'professional' ? 'var(--color-primary)' : '#374151',
                            cursor: 'pointer',
                        }}
                    >
                        专业动作
                    </button>
                </div>

                {/* Action Type List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {actionCategory === 'basic_posture' && basicPostureActions.map((action) => (
                        <button
                            key={action.value}
                            onClick={() => handleActionTypeChange(action.value, 'basic_posture')}
                            style={{
                                padding: '16px',
                                borderRadius: 'var(--radius-sm)',
                                border: actionType === action.value ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                                background: actionType === action.value ? '#EEF2FF' : 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ fontWeight: 600, color: actionType === action.value ? 'var(--color-primary)' : '#374151' }}>
                                {action.label}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>
                                {action.desc}
                            </div>
                        </button>
                    ))}

                    {actionCategory === 'professional' && professionalActions.map((action) => (
                        <button
                            key={action.value}
                            onClick={() => handleActionTypeChange(action.value, 'professional')}
                            style={{
                                padding: '16px',
                                borderRadius: 'var(--radius-sm)',
                                border: actionType === action.value ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                                background: actionType === action.value ? '#EEF2FF' : 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ fontWeight: 600, color: actionType === action.value ? 'var(--color-primary)' : '#374151' }}>
                                {action.label}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>
                                {action.desc}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Experience Level Selection (for professional actions only) */}
            {actionCategory === 'professional' && (
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
                <h3 style={{ marginBottom: '8px' }}>选择视频</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    {actionCategory === 'basic_posture' ? '建议拍摄30秒静态视频' : '拍摄完整攀岩动作'}
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

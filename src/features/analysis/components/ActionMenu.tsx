import { useState } from 'react';
import type { ActionCategory, ActionType } from '../../../domain/analysis/types';

interface ActionMenuProps {
    onSelect: (type: ActionType, category: ActionCategory) => void;
}

export function ActionMenu({ onSelect }: ActionMenuProps) {
    const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('routine');

    const routineActions: { type: ActionType; label: string; icon: string }[] = [
        { type: 'squat_exercise', label: '深蹲训练', icon: '🏋️‍♀️' },
        { type: 'running', label: '跑步', icon: '🏃‍♀️' },
        { type: 'strength', label: '力量训练', icon: '💪' },
    ];

    const professionalActions: { type: ActionType; label: string; icon: string }[] = [
        { type: 'climbing', label: '攀岩', icon: '🧗‍♀️' },
        { type: 'volleyball', label: '排球', icon: '🏐' },
        { type: 'martial_arts', label: '武术', icon: '🥋' },
    ];

    const currentActions = selectedCategory === 'routine' ? routineActions : professionalActions;

    return (
        <div style={{ padding: '24px' }}>
            <h2>选择运动场景</h2>

            {/* Category Tabs */}
            <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid #eee' }}>
                <div
                    onClick={() => setSelectedCategory('routine')}
                    style={{
                        padding: '16px',
                        flex: 1,
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontWeight: 600,
                        borderBottom: selectedCategory === 'routine' ? '2px solid var(--color-primary)' : 'none',
                        color: selectedCategory === 'routine' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                    }}
                >
                    常规运动
                </div>
                <div
                    onClick={() => setSelectedCategory('professional')}
                    style={{
                        padding: '16px',
                        flex: 1,
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontWeight: 600,
                        borderBottom: selectedCategory === 'professional' ? '2px solid var(--color-primary)' : 'none',
                        color: selectedCategory === 'professional' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                    }}
                >
                    专业运动
                </div>
            </div>

            {/* Action Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {currentActions.map(action => (
                    <div
                        key={action.type}
                        onClick={() => onSelect(action.type, selectedCategory)}
                        style={{
                            background: 'var(--color-surface)',
                            border: '1px solid #eee',
                            borderRadius: 'var(--radius-md)',
                            padding: '24px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{action.icon}</div>
                        <div style={{ fontWeight: 500 }}>{action.label}</div>
                    </div>
                ))}
            </div>

            {/* Coming Soon */}
            <div style={{ marginTop: '32px', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                更多运动场景开发中...
            </div>
        </div>
    );
}

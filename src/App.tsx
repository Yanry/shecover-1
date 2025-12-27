import { useState } from 'react';
import './index.css';
import { UserProvider, useUser } from './features/onboarding/UserContext';
import { OnboardingView } from './features/onboarding/OnboardingView';
import { VideoUpload } from './features/analysis/components/VideoUpload';
import { VideoPlayer } from './features/analysis/components/VideoPlayer';
import { AssessmentView } from './features/assessment/AssessmentView';
import { ActionMenu } from './features/analysis/components/ActionMenu';
import type { ActionType, CameraAngle, ExperienceLevel } from './domain/analysis/types';

function AppContent() {
  const { profile, resetProfile } = useUser();
  const [view, setView] = useState<'onboarding' | 'assessment' | 'menu' | 'upload' | 'analysis'>('onboarding');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType>('standing');
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);

  // Initial routing based on profile state
  if (!profile.isOnboardingComplete && view !== 'onboarding') {
    setView('onboarding');
  }

  const handleOnboardingComplete = () => {
    setView('assessment');
  };

  const handleAssessmentComplete = () => {
    // In future, this would save assessment results
    setView('menu');
  };

  const handleActionSelect = (type: ActionType, _category: any) => {
    setActionType(type);
    setView('upload');
  };

  const handleVideoSelect = (
    _file: File,
    url: string,
    action: ActionType, // This might be overridden by the menu selection, but kept for compatibility
    angle: CameraAngle,
    expLevel?: ExperienceLevel
  ) => {
    setVideoUrl(url);
    // If coming from menu, we already set actionType, but upload component might pass it back if it had a selector.
    // Ideally VideoUpload shouldn't ask for action type if it's already selected.
    // For now, let's respect what's passed or keep what we have.
    // Actually the VideoUpload component currently asks for ActionType.
    // We should probably modify VideoUpload to NOT ask for ActionType if it's already determined, 
    // OR just let the user confirm it.
    // Let's rely on the state we set from the menu, but if VideoUpload lets user change it, we update it.
    setActionType(action);
    setCameraAngle(angle);
    setExperienceLevel(expLevel);
    setView('analysis');
  };

  if (view === 'onboarding') {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app-container" style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--color-surface)', position: 'relative' }}>
      <header style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>Shecover</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {view !== 'menu' && view !== 'assessment' && (
            <button
              onClick={() => setView('menu')}
              style={{ fontSize: '0.9rem', background: 'none', color: 'var(--color-primary)' }}
            >
              主菜单
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('重新开始？这将清除你的个人资料。')) {
                resetProfile();
                setView('onboarding');
              }
            }}
            style={{ fontSize: '0.8rem', background: 'none', color: 'var(--color-text-secondary)', textDecoration: 'underline' }}
          >
            重置
          </button>
        </div>
      </header>

      <main style={{ padding: 'var(--spacing-md)' }}>
        {view === 'assessment' && (
          <AssessmentView
            onComplete={handleAssessmentComplete}
            onSkip={handleAssessmentComplete}
          />
        )}

        {view === 'menu' && (
          <ActionMenu onSelect={handleActionSelect} />
        )}

        {view === 'upload' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button onClick={() => setView('menu')} style={{ background: 'none', color: '#666' }}>← 返回菜单</button>
            </div>
            {/* Note: VideoUpload might need refactoring to accept pre-selected action */}
            <VideoUpload
              onFileSelect={handleVideoSelect}
              defaultAction={actionType} // We need to add this prop to VideoUpload
            />
          </div>
        )}

        {view === 'analysis' && videoUrl && (
          <div>
            <VideoPlayer
              videoUrl={videoUrl}
              actionType={actionType}
              cameraAngle={cameraAngle}
              experienceLevel={experienceLevel}
            />

            <button
              onClick={() => setView('upload')}
              style={{ marginTop: '24px', color: 'var(--color-text-secondary)', background: 'transparent', fontSize: '0.9rem' }}
            >
              ← 选择其他视频
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;

import { useState } from 'react';
import './index.css';
import { UserProvider, useUser } from './features/onboarding/UserContext';
import { OnboardingView } from './features/onboarding/OnboardingView';
import { VideoUpload } from './features/analysis/components/VideoUpload';
import { VideoPlayer } from './features/analysis/components/VideoPlayer';
import type { ActionType, CameraAngle, ExperienceLevel } from './domain/analysis/types';

function AppContent() {
  const { profile, resetProfile } = useUser();
  const [view, setView] = useState<'onboarding' | 'upload' | 'analysis'>('onboarding');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType>('standing');
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);

  if (!profile.isOnboardingComplete) {
    return <OnboardingView onComplete={() => setView('upload')} />;
  }

  const handleVideoSelect = (
    _file: File,
    url: string,
    action: ActionType,
    angle: CameraAngle,
    expLevel?: ExperienceLevel
  ) => {
    setVideoUrl(url);
    setActionType(action);
    setCameraAngle(angle);
    setExperienceLevel(expLevel);
    setView('analysis');
  };

  return (
    <div className="app-container" style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--color-surface)', position: 'relative' }}>
      <header style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>Shecover</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        {view === 'upload' && (
          <VideoUpload onFileSelect={handleVideoSelect} />
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

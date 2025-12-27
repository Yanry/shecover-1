import { useState } from 'react';
import './index.css';
import { UserProvider, useUser } from './features/onboarding/UserContext';
import { OnboardingView } from './features/onboarding/OnboardingView';
import { VideoUpload } from './features/analysis/components/VideoUpload';
import { VideoPlayer } from './features/analysis/components/VideoPlayer';

function AppContent() {
  const { profile, resetProfile } = useUser();
  const [view, setView] = useState<'onboarding' | 'upload' | 'analysis'>('onboarding');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  if (!profile.isOnboardingComplete) {
    return <OnboardingView onComplete={() => setView('upload')} />;
  }

  const handleVideoSelect = (_file: File, url: string) => {
    setVideoUrl(url);
    setView('analysis');
  };

  return (
    <div className="app-container" style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--color-surface)', position: 'relative' }}>
      <header style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>Shecover</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              if (confirm('Restart demo? This will clear your profile.')) {
                resetProfile();
                setView('onboarding');
              }
            }}
            style={{ fontSize: '0.8rem', background: 'none', color: 'var(--color-text-secondary)', textDecoration: 'underline' }}
          >
            Restart Demo
          </button>
        </div>
      </header>

      <main style={{ padding: 'var(--spacing-md)' }}>
        {view === 'upload' && (
          <VideoUpload onFileSelect={handleVideoSelect} />
        )}

        {view === 'analysis' && videoUrl && (
          <div>
            <VideoPlayer videoUrl={videoUrl} />

            <button
              onClick={() => setView('upload')}
              style={{ marginTop: '24px', color: 'var(--color-text-secondary)', background: 'transparent', fontSize: '0.9rem' }}
            >
              ← Pick another video
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

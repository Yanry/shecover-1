import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
    heightCm: number;
    trainingLevel: TrainingLevel;
    injuries: string[];
    isOnboardingComplete: boolean;
}

interface UserContextType {
    profile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => void;
    completeOnboarding: () => void;
    resetProfile: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
    heightCm: 165, // Default average
    trainingLevel: 'intermediate',
    injuries: [],
    isOnboardingComplete: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('shecover_user_profile');
        return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    });

    useEffect(() => {
        localStorage.setItem('shecover_user_profile', JSON.stringify(profile));
    }, [profile]);

    const updateProfile = (data: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...data }));
    };

    const completeOnboarding = () => {
        updateProfile({ isOnboardingComplete: true });
    };

    const resetProfile = () => {
        setProfile(DEFAULT_PROFILE);
        localStorage.removeItem('shecover_user_profile');
    };

    return (
        <UserContext.Provider value={{ profile, updateProfile, completeOnboarding, resetProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

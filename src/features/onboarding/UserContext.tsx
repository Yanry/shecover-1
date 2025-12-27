import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type AgeGroup = 'under_18' | '18_25' | '26_35' | '36_45' | '46_60' | 'over_60';
export type MenstrualCyclePhase = 'follicular' | 'ovulation' | 'luteal' | 'menstrual' | 'irregular' | 'none';
export type ExerciseFrequency = '0_1' | '2_3' | '4_5' | '6_plus';
export type ExerciseType = 'running' | 'strength' | 'climbing' | 'ball_sports' | 'other';
export type DominantSide = 'left' | 'right' | 'unsure';
export type PainPart = 'knee' | 'ankle' | 'hip' | 'waist' | 'shoulder';

export interface UserProfile {
    heightCm: number;
    ageGroup?: AgeGroup;
    menstrualCycle?: MenstrualCyclePhase;
    exerciseFrequency?: ExerciseFrequency;
    exerciseTypes: ExerciseType[];
    dominantSide?: DominantSide;

    // Injury / Risk Factors
    hasInjury: boolean;
    painParts: PainPart[];
    painLevel?: number; // 1-10
    isDiagnosed?: boolean;
    diagnosisDetails?: string;

    // Legacy/Other
    injuries: string[]; // Keep for backward compat or general notes
    trainingLevel: TrainingLevel;
    isOnboardingComplete: boolean;
}

interface UserContextType {
    profile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => void;
    completeOnboarding: () => void;
    resetProfile: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
    heightCm: 165,
    exerciseTypes: [],
    hasInjury: false,
    painParts: [],
    injuries: [],
    trainingLevel: 'intermediate',
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

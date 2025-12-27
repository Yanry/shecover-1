import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseDetector } from '../../../domain/analysis/PoseDetector';
import type { PoseResult } from '../../../domain/analysis/types';

export function usePoseAnalysis() {
    const detectorRef = useRef<PoseDetector | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<PoseResult[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const detector = new PoseDetector();
        detectorRef.current = detector;
        // We could hook into an event or just wait; PoseDetector initializes async
        setIsReady(true);

        return () => {
            detector.close();
        };
    }, []);

    const analyzeVideo = useCallback(async (videoElement: HTMLVideoElement) => {
        if (!detectorRef.current) return;

        setIsAnalyzing(true);
        setResults([]);
        setProgress(0);

        const duration = videoElement.duration;
        // const fps = 30; // Assumption or read from file
        // const totalFrames = Math.floor(duration * fps); // Approximation

        // We will play the video and capture frames
        // NOTE: For better performance/accuracy, using seek() is better than play()
        // but play() gives valid flow. Let's use seek approach for frame-by-frame precision.

        const frameResults: PoseResult[] = [];

        videoElement.pause();
        videoElement.currentTime = 0;

        const processFrame = async () => {
            if (videoElement.ended || videoElement.paused) {
                // We control the stepping, so 'paused' is expected
            }

            const result = await detectorRef.current?.detect(videoElement);
            if (result) {
                frameResults.push(result);
            }

            // Move to next frame
            // 30fps = 1/30 = 0.0333
            const nextTime = videoElement.currentTime + 0.0333;

            if (nextTime >= videoElement.duration) {
                // Done
                setIsAnalyzing(false);
                setResults(frameResults);
                setProgress(100);
                return;
            }

            videoElement.currentTime = nextTime;
            setProgress(Math.round((nextTime / duration) * 100));

            // Wait for seek to complete
            // We need a one-off event listener for 'seeked'
            await new Promise<void>(resolve => {
                const onSeeked = () => {
                    videoElement.removeEventListener('seeked', onSeeked);
                    resolve();
                };
                videoElement.addEventListener('seeked', onSeeked);
            });

            // Recursive call/Loop
            // Using setTimeout to yield to UI thread
            setTimeout(processFrame, 0);
        };

        // Start
        processFrame();

    }, []);

    return {
        isReady,
        isAnalyzing,
        analyzeVideo,
        results,
        progress
    };
}

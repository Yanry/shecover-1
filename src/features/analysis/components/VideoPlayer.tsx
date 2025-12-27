import { useEffect, useRef, useState } from 'react';
import { usePoseAnalysis } from '../hooks/usePoseAnalysis';
import { LANDMARKS } from '../../../domain/analysis/types';
import type { Point2D } from '../../../domain/analysis/types';
import { analyzeFrame, summarizeAnalysis } from '../../../domain/analysis/RiskEngine';
import type { AnalysisSummary } from '../../../domain/analysis/RiskEngine';
import { InsightCard } from './InsightCard';

interface VideoPlayerProps {
    videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { isReady, isAnalyzing, analyzeVideo, results, progress } = usePoseAnalysis();
    const [isPlaying, setIsPlaying] = useState(false);
    const [summary, setSummary] = useState<AnalysisSummary | null>(null);

    // Auto-start analysis when ready
    useEffect(() => {
        if (isReady && videoRef.current && !isAnalyzing && results.length === 0) {
            setTimeout(() => {
                // Auto-analyze disabled to let user choose
                // analyzeVideo(videoRef.current!);
            }, 500);
        }
    }, [isReady, isAnalyzing, results.length]);

    // Compute summary when results are ready
    useEffect(() => {
        if (results.length > 0 && !isAnalyzing) {
            const riskFrames = results.map((pose, idx) =>
                // Mock timestamp 30fps
                analyzeFrame(pose, idx * 0.033, idx)
            );
            const computedSummary = summarizeAnalysis(riskFrames);
            setSummary(computedSummary);
        }
    }, [results, isAnalyzing]);

    const handleStartAnalysis = () => {
        if (videoRef.current) {
            analyzeVideo(videoRef.current);
        }
    };

    const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: Point2D[]) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const drawLine = (idx1: number, idx2: number, color: string = 'white', width: number = 2) => {
            const p1 = landmarks[idx1];
            const p2 = landmarks[idx2];
            if (p1 && p2 && (p1.visibility ?? 1) > 0.5 && (p2.visibility ?? 1) > 0.5) {
                const w = ctx.canvas.width;
                const h = ctx.canvas.height;
                ctx.beginPath();
                ctx.moveTo(p1.x * w, p1.y * h);
                ctx.lineTo(p2.x * w, p2.y * h);
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.stroke();
            }
        };

        // Visualization: Simplified Skeleton
        drawLine(LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, '#34D399', 4);
        drawLine(LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE, '#34D399', 4);
        drawLine(LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, '#60A5FA', 4);
        drawLine(LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE, '#60A5FA', 4);
        drawLine(LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP, 'white', 2);
    };

    // Render loop during playback
    useEffect(() => {
        if (!isPlaying || results.length === 0 || !videoRef.current || !canvasRef.current) return;

        let animationFrameId: number;

        const render = () => {
            const video = videoRef.current!;
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                const fps = 30;
                const frameIdx = Math.floor(video.currentTime * fps);
                const pose = results[frameIdx];

                if (pose) {
                    drawSkeleton(ctx, pose.landmarks);
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, results, summary]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'black', aspectRatio: '9/16' }}>
                <video
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    controls={!isAnalyzing}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        pointerEvents: 'none'
                    }}
                    width={720}
                    height={1280}
                />

                {isAnalyzing && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🧬</div>
                        <h3>Reading Movement...</h3>
                        <div style={{ width: '60%', height: '4px', background: 'rgba(255,255,255,0.2)', marginTop: '16px', borderRadius: '2px' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.2s' }} />
                        </div>
                    </div>
                )}
            </div>

            {!isAnalyzing && results.length === 0 && (
                <button
                    onClick={handleStartAnalysis}
                    disabled={!isReady}
                    style={{
                        background: 'var(--color-primary)', color: 'white', padding: '16px',
                        borderRadius: 'var(--radius-md)', fontWeight: 600,
                        opacity: isReady ? 1 : 0.7
                    }}
                >
                    {isReady ? 'Analyze Movement' : 'Loading Vision Engine...'}
                </button>
            )}

            {summary && !isAnalyzing && (
                <InsightCard summary={summary} />
            )}
        </div>
    );
}

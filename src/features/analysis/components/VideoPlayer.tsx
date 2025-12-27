import { useEffect, useRef, useState } from 'react';
import { usePoseAnalysis } from '../hooks/usePoseAnalysis';
import { LANDMARKS } from '../../../domain/analysis/types';
import type { Point2D, ActionType, CameraAngle, ExperienceLevel } from '../../../domain/analysis/types';
import { analyzeFrame, summarizeAnalysis } from '../../../domain/analysis/RiskEngine';
import type { AnalysisSummary } from '../../../domain/analysis/RiskEngine';
import { InsightCard } from './InsightCard';

interface VideoPlayerProps {
    videoUrl: string;
    actionType: ActionType;
    cameraAngle: CameraAngle;
    experienceLevel?: ExperienceLevel;
}

export function VideoPlayer({ videoUrl, actionType, cameraAngle, experienceLevel }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { isReady, isAnalyzing, analyzeVideo, results, progress } = usePoseAnalysis();
    const [isPlaying, setIsPlaying] = useState(false);
    const [summary, setSummary] = useState<AnalysisSummary | null>(null);

    useEffect(() => {
        if (isReady && videoRef.current && !isAnalyzing && results.length === 0) {
            setTimeout(() => { }, 500);
        }
    }, [isReady, isAnalyzing, results.length]);

    useEffect(() => {
        if (results.length > 0 && !isAnalyzing) {
            const riskFrames = results.map((pose, idx) =>
                analyzeFrame(pose, idx * 0.033, idx, actionType)
            );
            const computedSummary = summarizeAnalysis(riskFrames, actionType);
            setSummary(computedSummary);
        }
    }, [results, isAnalyzing, actionType]);

    const handleStartAnalysis = () => {
        if (videoRef.current) {
            analyzeVideo(videoRef.current);
        }
    };

    const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: Point2D[]) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const drawLine = (idx1: number, idx2: number, color: string = 'white', width: number = 2) => {
            const p1 = landmarks[idx1];
            const p2 = landmarks[idx2];
            if (p1 && p2 && (p1.visibility ?? 1) > 0.5 && (p2.visibility ?? 1) > 0.5) {
                ctx.beginPath();
                ctx.moveTo(p1.x * w, p1.y * h);
                ctx.lineTo(p2.x * w, p2.y * h);
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.stroke();
            }
        };

        const leftHip = landmarks[LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
        const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

        // ===== 骨盆模拟 (Pelvis Simulation) =====
        const hipBias = 0.007;
        leftHip.x = leftHip.x * (1 + hipBias);
        rightHip.x = rightHip.x * (1 - hipBias);
        if (leftHip && rightHip &&
            (leftHip.visibility ?? 1) > 0.5 && (rightHip.visibility ?? 1) > 0.5) {

            // 1. 模拟耻骨点 (Simulated Pubic Symphysis)
            const hipMidX = (leftHip.x + rightHip.x) / 2;
            const hipMidY = (leftHip.y + rightHip.y) / 2;
            const hipWidth = Math.abs(rightHip.x - leftHip.x);

            const pubicBone: Point2D = {
                x: hipMidX,
                y: hipMidY + hipWidth * 0.18, // 向下约18%髋宽
                visibility: Math.min(leftHip.visibility ?? 1, rightHip.visibility ?? 1)
            };

            // 2. 绘制骨盆三角形 (Pelvis Triangle)
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#FBBF24'; // 金色填充
            ctx.beginPath();
            ctx.moveTo(leftHip.x * w, leftHip.y * h);
            ctx.lineTo(rightHip.x * w, rightHip.y * h);
            ctx.lineTo(pubicBone.x * w, pubicBone.y * h);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // 3. 骨盆轮廓线 (Pelvis Outline)
            ctx.strokeStyle = '#FBBF24';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(leftHip.x * w, leftHip.y * h);
            ctx.lineTo(rightHip.x * w, rightHip.y * h);
            ctx.lineTo(pubicBone.x * w, pubicBone.y * h);
            ctx.closePath();
            ctx.stroke();

            // 4. 髋部横线加粗显示
            drawLine(LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP, '#FBBF24', 6);

            // 5. 耻骨点标记
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(pubicBone.x * w, pubicBone.y * h, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // ===== 腰线可视化 (Waistline) =====
        if (leftHip && rightHip && leftShoulder && rightShoulder &&
            (leftShoulder.visibility ?? 1) > 0.5 && (rightShoulder.visibility ?? 1) > 0.5) {

            const waistRatio = 0.7; // 从肩膀向下50%处（更接近髋部）

            // 计算肩膀和髋部的中点X坐标
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const hipMidX = (leftHip.x + rightHip.x) / 2;
            const torsoMidX = (shoulderMidX + hipMidX) / 2;

            // 腰线宽度收缩系数（0.7表示腰线宽度为肩宽的70%）
            const waistNarrowFactor = 0.5;

            const leftWaist: Point2D = {
                x: torsoMidX + (leftShoulder.x - shoulderMidX) * waistNarrowFactor,
                y: leftShoulder.y + (leftHip.y - leftShoulder.y) * waistRatio,
            };

            const rightWaist: Point2D = {
                x: torsoMidX + (rightShoulder.x - shoulderMidX) * waistNarrowFactor,
                y: rightShoulder.y + (rightHip.y - rightShoulder.y) * waistRatio,
            };

            // 上半身梯形（肩膀 → 腰部：上宽下窄）
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#A78BFA'; // 紫色
            ctx.beginPath();
            ctx.moveTo(leftShoulder.x * w, leftShoulder.y * h);
            ctx.lineTo(rightShoulder.x * w, rightShoulder.y * h);
            ctx.lineTo(rightWaist.x * w, rightWaist.y * h);
            ctx.lineTo(leftWaist.x * w, leftWaist.y * h);
            ctx.closePath();
            ctx.fill();

            // 下半身梯形（腰部 → 髋部：上窄下宽）
            ctx.fillStyle = '#F59E0B'; // 金色/琥珀色
            ctx.beginPath();
            ctx.moveTo(leftWaist.x * w, leftWaist.y * h);
            ctx.lineTo(rightWaist.x * w, rightWaist.y * h);
            ctx.lineTo(rightHip.x * w, rightHip.y * h);
            ctx.lineTo(leftHip.x * w, leftHip.y * h);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // 腰部标记点（保留用于显示腰线位置）
            ctx.fillStyle = '#EC4899';
            ctx.beginPath();
            ctx.arc(leftWaist.x * w, leftWaist.y * h, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(rightWaist.x * w, rightWaist.y * h, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // ===== 下肢骨骼 =====
        drawLine(LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, '#34D399', 4);
        drawLine(LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE, '#34D399', 4);
        drawLine(LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, '#60A5FA', 4);
        drawLine(LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE, '#60A5FA', 4);

        // ===== 上肢骨骼 =====
        drawLine(LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER, '#FBBF24', 3);
        drawLine(LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP, '#A78BFA', 2);
        drawLine(LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP, '#A78BFA', 2);

        // 手臂
        drawLine(LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, '#F472B6', 3);
        drawLine(LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, '#F472B6', 3);
        drawLine(LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, '#FB923C', 3);
        drawLine(LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST, '#FB923C', 3);

        // 颈部/头部
        const nose = landmarks[LANDMARKS.NOSE];

        if (nose && leftShoulder && rightShoulder &&
            (nose.visibility ?? 1) > 0.5 &&
            (leftShoulder.visibility ?? 1) > 0.5 &&
            (rightShoulder.visibility ?? 1) > 0.5) {
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

            ctx.beginPath();
            ctx.moveTo(shoulderMidX * w, shoulderMidY * h);
            ctx.lineTo(nose.x * w, nose.y * h);
            ctx.strokeStyle = '#E0E7FF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };

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

    const actionLabels: Record<ActionType, string> = {
        climbing: '攀岩',
        standing: '自然站立',
        single_leg_standing: '单脚站立',
        walking: '自然步行',
        squat: '深蹲',
        arms_overhead: '双手上举',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                    background: '#EEF2FF',
                    color: 'var(--color-primary)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                }}>
                    {actionLabels[actionType]}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                    {cameraAngle === 'front' ? '正面' : '侧面'}
                </span>
                {experienceLevel && (
                    <span style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                    }}>
                        {experienceLevel === 'beginner' ? '初学者' : experienceLevel === 'intermediate' ? '中级' : '高级'}
                    </span>
                )}
            </div>

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
                        <h3>正在分析动作...</h3>
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
                    {isReady ? '开始分析动作' : '加载视觉引擎中...'}
                </button>
            )}

            {summary && !isAnalyzing && (
                <InsightCard summary={summary} />
            )}
        </div>
    );
}

import { Pose } from '@mediapipe/pose';
import type { Results, Options } from '@mediapipe/pose';
import type { PoseResult } from './types';

export class PoseDetector {
    private pose: Pose | null = null;
    private isReady = false;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            this.pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                },
            });

            const options: Options = {
                modelComplexity: 1, // 0=Lite, 1=Full, 2=Heavy. 1 is good balance.
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            };

            await this.pose.setOptions(options);

            this.isReady = true;
            console.log('PoseDetector initialized');
        } catch (error) {
            console.error('Failed to initialize PoseDetector:', error);
        }
    }

    public async detect(
        image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ): Promise<PoseResult | null> {
        if (!this.pose || !this.isReady) {
            console.warn('PoseDetector not ready');
            return null;
        }

        return new Promise((resolve) => {
            const handleResults = (results: Results) => {
                if (results.poseLandmarks) {
                    resolve({
                        landmarks: results.poseLandmarks,
                        worldLandmarks: results.poseWorldLandmarks,
                    });
                } else {
                    resolve(null);
                }
            };

            // We set the callback for this specific detection
            // Note: This overrides any previous onResults, which is fine for single-shot Promise use.
            this.pose!.onResults(handleResults);
            this.pose!.send({ image: image });
        });
    }

    public close() {
        if (this.pose) {
            this.pose.close();
        }
    }
}

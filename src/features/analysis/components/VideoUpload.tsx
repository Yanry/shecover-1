import { useRef } from 'react';
import type { ChangeEvent } from 'react';

interface VideoUploadProps {
    onFileSelect: (file: File, url: string) => void;
}

export function VideoUpload({ onFileSelect }: VideoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onFileSelect(file, url);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                style={{ display: 'none' }}
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: '2px dashed var(--color-text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '40px',
                    cursor: 'pointer',
                    background: 'var(--color-bg)',
                    transition: 'all 0.2s ease',
                }}
            >
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📹</div>
                <h3 style={{ marginBottom: '8px' }}>Select Climbing Video</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Choose a clear video from your gallery.
                    <br />
                    (10-40 seconds recommended)
                </p>
            </div>

            <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Privacy Note: Your video is processed right here on your device.
                <br />
                It is never uploaded to any server.
            </p>
        </div>
    );
}

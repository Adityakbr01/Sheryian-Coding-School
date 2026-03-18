import { useState, useRef, useEffect, useCallback } from 'react';
import { type IDownloadPayload, type IJobStatus, JobState } from '../types';
import { requestDownload, cancelDownloadJob } from '../services/api';
import { io, Socket } from 'socket.io-client';

export const useDownloader = () => {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<IJobStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);

    const clearConnection = useCallback(() => {
        if (socketRef.current) {
            if (jobId) {
                socketRef.current.emit('unsubscribe', jobId);
            }
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, [jobId]);

    const connectStream = useCallback((id: string) => {
        clearConnection();
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // Connect to root of API url for socket instance
        const urlToUse = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

        const socket = io(urlToUse, {
            transports: ['websocket'],
            upgrade: false
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log(`[Socket] Connected to server, ID: ${socket.id}`);
            console.log(`[Socket] Subscribing to job: ${id}`);
            socket.emit('subscribe', id);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket] Disconnected. Reason: ${reason}`);
        });

        socket.on('status', (data: any) => {
            console.log(`[Socket] Received status update:`, data);
            if (data.error) {
                setError(data.error);
                clearConnection();
                localStorage.removeItem('activeJobId');
                return;
            }

            setStatus(data);

            if (data.state === JobState.COMPLETED || data.state === JobState.FAILED) {
                clearConnection();
                localStorage.removeItem('activeJobId');
            }
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setError("Lost connection to server. Please try again.");
            clearConnection();
        });
    }, [clearConnection]);

    // Check for active job on mount
    useEffect(() => {
        const activeJobId = localStorage.getItem('activeJobId');
        if (activeJobId) {
            setJobId(activeJobId);
            setLoading(false);
            connectStream(activeJobId);
        }

        return () => clearConnection();
    }, [connectStream, clearConnection]);

    const startDownload = async (payload: IDownloadPayload) => {
        setLoading(true);
        setError(null);
        setStatus(null);
        setJobId(null);
        clearConnection();

        try {
            const { jobId: newJobId } = await requestDownload(payload);
            setJobId(newJobId);
            localStorage.setItem('activeJobId', newJobId);
            setLoading(false);
            connectStream(newJobId);
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message || 'Failed to start download');
        }
    };

    const reset = useCallback(() => {
        clearConnection();
        localStorage.removeItem('activeJobId');
        setJobId(null);
        setStatus(null);
        setError(null);
        setLoading(false);
    }, [clearConnection]);

    const cancelDownload = async () => {
        if (!jobId) return;
        setLoading(true);
        try {
            await cancelDownloadJob(jobId);
            reset();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to cancel download');
            setLoading(false);
        }
    };

    return {
        startDownload,
        cancelDownload,
        jobId,
        status,
        loading,
        error,
        reset
    };
};

import api from '../../../lib/axios';
import type { IDownloadPayload, IJobStatus } from '../types';
import type { AxiosResponse } from 'axios';

interface IApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

export const requestDownload = async (payload: IDownloadPayload): Promise<{ jobId: string }> => {
    const response: AxiosResponse<IApiResponse<{ jobId: string }>> = await api.post('/download', payload);
    return response.data.data;
};

export const getJobStatus = async (jobId: string): Promise<IJobStatus> => {
    const response: AxiosResponse<IApiResponse<IJobStatus>> = await api.get(`/status/${jobId}`);
    return response.data.data;
};

export const cancelDownloadJob = async (jobId: string): Promise<boolean> => {
    const response: AxiosResponse<IApiResponse<null>> = await api.delete(`/cancel/${jobId}`);
    return response.data.success;
};

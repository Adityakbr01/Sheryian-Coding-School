import api from '@/services/api';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export const sendMessage = async (prompt: string): Promise<string> => {
    const response = await api.post('/ai/chat', { prompt });
    console.log("API response for sendMessage:", response.data?.data?.response);
    return response.data?.data?.response || '';
};

export const getHistory = async (): Promise<ChatMessage[]> => {
    const response = await api.get('/ai/history');
    if (response.data?.data?.history) {
        // Parsing the stringified History coming from Backend Api
        const historyData = typeof response.data.data.history === 'string'
            ? JSON.parse(response.data.data.history)
            : response.data.data.history;

        return historyData.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt,
        }));
    }
    return [];
};

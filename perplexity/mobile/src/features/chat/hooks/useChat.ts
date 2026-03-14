import { useState, useEffect } from 'react';
import * as ChatApi from '../api/chat.api';

export const useChat = () => {
    const [messages, setMessages] = useState<ChatApi.ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const history = await ChatApi.getHistory();
            setMessages(history);
        } catch (err: any) {
            console.error('Failed to load chat history:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const sendMessage = async (prompt: string) => {
        if (!prompt.trim()) return;

        // Optimistic UI updates
        const userMessage: ChatApi.ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: prompt,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const responseContent = await ChatApi.sendMessage(prompt);

            const aiMessage: ChatApi.ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseContent,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to send message');
            // Remove optimistic message if failed, or handle error visually
            console.error("Chat Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
    };
};

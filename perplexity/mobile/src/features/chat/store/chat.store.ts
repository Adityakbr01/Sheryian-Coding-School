import { create } from 'zustand';
import api from '@/services/api';
import { getSocket } from '@/services/socket';
import { ChatMessage } from '../api/chat.api';
import { jwtDecode } from 'jwt-decode';
import { getItem, STORAGE_KEYS } from '@/services/storage';

interface ChatStore {
  userId: string | null;
  chats: any[];
  activeChatId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  
  initialize: () => Promise<void>;
  loadChats: () => Promise<void>;
  createNewChat: () => void;
  switchChat: (chatId: string | null) => Promise<void>;
  sendMessage: (prompt: string) => void;
  setupSocketListeners: () => void;
  cleanupSocketListeners: () => void;
  clearStore: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  userId: null,
  chats: [],
  activeChatId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,

  clearStore: () => {
    set({
      userId: null,
      chats: [],
      activeChatId: null,
      messages: [],
      isLoading: false,
      isStreaming: false,
    });
  },

  initialize: async () => {
    const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.id || decoded.userId) {
          set({ userId: decoded.id || decoded.userId });
        }
      } catch (e) {
        console.error("Token decoding failed", e);
      }
    }
  },

  loadChats: async () => {
    try {
      const response = await api.get('/ai/chats');
      if (response.data?.data?.chats) {
        set({ chats: response.data.data.chats });
      }
    } catch (e) {
      console.error("Failed to load chats:", e);
    }
  },

  createNewChat: () => {
    set({ activeChatId: null, messages: [] });
  },

  switchChat: async (chatId) => {
    set({ activeChatId: chatId, messages: [], isLoading: !!chatId });
    if (!chatId) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await api.get(`/ai/chats/${chatId}/messages?limit=50`);
      if (response.data?.data?.history) {
        const historyData = response.data.data.history;
        set({ 
          messages: historyData.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt,
          })),
          isLoading: false
        });
      }

      // Join chat room in socket
      const socket = getSocket();
      socket.emit("join_chat", chatId);

    } catch (err) {
      console.error('Failed to load messages:', err);
      set({ isLoading: false });
    }
  },

  sendMessage: (prompt) => {
    const { activeChatId, userId, messages } = get();
    console.log("sendMessage called:", { prompt, activeChatId, userId });
    
    if (!userId) {
        console.warn("No userId available to send message!");
        return;
    }
    
    const socket = getSocket();
    
    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };
    
    // Add placeholder for AI response
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    set({ 
      messages: [...messages, userMessage, aiMessage],
      isStreaming: true 
    });

    socket.emit("send_message", {
      chatId: activeChatId,
      prompt,
      userId
    });
  },

  setupSocketListeners: () => {
    const socket = getSocket();
    
    socket.off('chat_title_updated');
    socket.off('response_start');
    socket.off('response_chunk');
    socket.off('response_end');
    socket.off('error');

    socket.on('chat_title_updated', (data: { chatId: string, title: string }) => {
      set((state) => {
        const isNewChat = !state.activeChatId;
        const newState: Partial<ChatStore> = {
          chats: state.chats.some(c => c.id === data.chatId) 
            ? state.chats.map(c => c.id === data.chatId ? { ...c, title: data.title } : c)
            : [{ id: data.chatId, title: data.title }, ...state.chats]
        };
        if (isNewChat) {
          newState.activeChatId = data.chatId;
          // Join the room for the new chat
          socket.emit("join_chat", data.chatId);
        }
        return newState;
      });
    });

    socket.on('response_start', (data: { chatId: string }) => {
      set({ isStreaming: true });
    });

    socket.on('response_chunk', (data: { chatId: string, content: string }) => {
      console.log('socket chunk received:', data.content);
      set((state) => {
        const newMsgs = [...state.messages];
        const lastIndex = newMsgs.length - 1;
        if (lastIndex >= 0 && newMsgs[lastIndex].role === 'assistant') {
          newMsgs[lastIndex] = {
            ...newMsgs[lastIndex],
            content: newMsgs[lastIndex].content + data.content
          };
        }
        return { messages: newMsgs };
      });
    });

    socket.on('response_end', (data: { chatId: string, totalContent: string }) => {
      console.log('socket end received:', data.totalContent);
      set((state) => {
        const newMsgs = [...state.messages];
        const lastIndex = newMsgs.length - 1;
        if (lastIndex >= 0 && newMsgs[lastIndex].role === 'assistant') {
          newMsgs[lastIndex] = {
            ...newMsgs[lastIndex],
            content: data.totalContent
          };
        }
        return { isStreaming: false, messages: newMsgs };
      });
      get().loadChats(); 
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      set({ isStreaming: false });
    });
  },

  cleanupSocketListeners: () => {
    const socket = getSocket();
    socket.off('chat_title_updated');
    socket.off('response_start');
    socket.off('response_chunk');
    socket.off('response_end');
    socket.off('error');
  }
}));

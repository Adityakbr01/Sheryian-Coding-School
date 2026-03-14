import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const SOCKET_URL = Platform.OS === 'android' ? 'http://10.115.15.27:3001' : 'http://localhost:3001';

let socket: Socket | null = null;

export const initSocket = () => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('Connected to socket', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket');
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

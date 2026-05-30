import io from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const backendUrl =
      process.env.REACT_APP_BACKEND_URL ||
      'http://localhost:4000';

    socket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket']
    });

    // socket.on('connect', () => {
    //   console.log('✅ Socket connected:', socket.id);
    // });

    // socket.on('disconnect', () => {
    //   console.log('❌ Socket disconnected');
    // });

    socket.on('connect_error', (err) => {
      console.error('Socket Error:', err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

let globalSocket = null;
const getSocket = () => {
  if (!globalSocket) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    globalSocket = io(backendUrl, { autoConnect: true });
    globalSocket.on('connect', () => console.log('✅ Socket.IO connected (orders)'));
    globalSocket.on('disconnect', () => console.log('❌ Socket.IO disconnected (orders)'));
  }
  return globalSocket;
};

/**
 * Hook to listen for order updates and call back with the changed order
 * @param {(order: object)=>void} onOrderChange
 */
const useOrdersSync = (onOrderChange) => {
  const ref = useRef();
  useEffect(() => {
    if (!onOrderChange) return;
    const socket = getSocket();
    ref.current = socket;

    const handler = (order) => {
      try {
        onOrderChange(order);
      } catch (e) {
        console.warn('useOrdersSync handler error', e);
      }
    };

    socket.on('order:updated', handler);

    return () => {
      socket.off('order:updated', handler);
    };
  }, [onOrderChange]);
};

export default useOrdersSync;

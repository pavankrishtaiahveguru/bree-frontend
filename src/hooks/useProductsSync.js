import { useEffect, useCallback } from 'react';
import { useRef } from 'react';
import io from 'socket.io-client';

// Singleton socket instance to avoid multiple connections
let globalSocket = null;

const getSocket = () => {
  if (!globalSocket) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    globalSocket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    globalSocket.on('connect', () => console.log('✅ Socket.IO connected'));
    globalSocket.on('disconnect', () => console.log('❌ Socket.IO disconnected'));
    globalSocket.on('connect_error', (error) => console.warn('Socket.IO error:', error));
  }
  return globalSocket;
};

/**
 * Hook to listen for product updates and trigger refetch
 * @param {Function} onProductChange - callback when product is created/updated/deleted
 */
export const useProductsSync = (onProductChange) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!onProductChange) return;

    socketRef.current = getSocket();
    const socket = socketRef.current;

    const handleProductCreated = (product) => {
      console.log('📡 Product created:', product.id);
      onProductChange('created', product);
    };

    const handleProductUpdated = (product) => {
      console.log('📡 Product updated:', product.id);
      onProductChange('updated', product);
    };

    const handleProductDeleted = (product) => {
      console.log('📡 Product deleted:', product.id);
      onProductChange('deleted', product);
    };

    socket.on('product:created', handleProductCreated);
    socket.on('product:updated', handleProductUpdated);
    socket.on('product:deleted', handleProductDeleted);

    return () => {
      socket.off('product:created', handleProductCreated);
      socket.off('product:updated', handleProductUpdated);
      socket.off('product:deleted', handleProductDeleted);
    };
  }, [onProductChange]);
};

// Cleanup function (call on app unmount)
export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

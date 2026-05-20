import { useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";

export const useProductsSync = (onProductChange) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!onProductChange) return;

    socketRef.current = getSocket();

    const socket = socketRef.current;

    const handleCreate = (product) => onProductChange("created", product);

    const handleUpdate = (product) => onProductChange("updated", product);

    const handleDelete = (product) => onProductChange("deleted", product);

    socket.on("product:created", handleCreate);
    socket.on("product:updated", handleUpdate);
    socket.on("product:deleted", handleDelete);

    return () => {
      socket.off("product:created", handleCreate);
      socket.off("product:updated", handleUpdate);
      socket.off("product:deleted", handleDelete);
    };
  }, [onProductChange]);
};

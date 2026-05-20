import { useEffect } from "react";
import { getSocket } from "../lib/socket";

const useOrdersSync = (onOrderChange) => {
  useEffect(() => {
    if (!onOrderChange) return;

    const socket = getSocket();

    const handler = (order) => {
      try {
        onOrderChange(order);
      } catch (err) {
        console.warn("useOrdersSync error:", err);
      }
    };

    socket.on("order:updated", handler);

    return () => {
      socket.off("order:updated", handler);
    };
  }, [onOrderChange]);
};

export default useOrdersSync;

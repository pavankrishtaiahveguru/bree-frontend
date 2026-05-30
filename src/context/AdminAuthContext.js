import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "@/lib/api";
import { toast } from "sonner";

const AdminAuthContext = createContext();
const ADMIN_TOKEN_KEY = "bree_admin_token";

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  const verifyAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/me");
      setAdmin(data.admin || null);
      return data.admin || null;
    } catch (error) {
      setAdmin(null);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only call verifyAdmin if we have a stored token — avoids 401 spam on public pages
    const stored = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (stored) {
      verifyAdmin();
    } else {
      setLoading(false);
    }
  }, [verifyAdmin]);

  const loginAdmin = async (email, password) => {
    setAuthenticating(true);
    try {
      const { data } = await axios.post("/api/admin/login", {
        email,
        password,
      });
      setAdmin(data.admin || null);

      // Store actual JWT token
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);

      return data.admin;
    } catch (error) {
      throw error;
    } finally {
      setAuthenticating(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      await axios.post("/api/admin/logout");
    } catch (err) {
      toast.error(
        "Unable to log out cleanly. You will still be signed out locally.",
      );
    } finally {
      setAdmin(null);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        authenticating,
        loginAdmin,
        logoutAdmin,
        verifyAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

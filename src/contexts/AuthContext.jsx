import { createContext, useContext, useEffect, useState } from "react";
import { TOKEN_STORAGE_KEY } from "../services/api";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem("bloom-user");
    setUser(null);
  };

  const saveSession = (token, nextUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem("bloom-user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
        setIsRestoring(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        localStorage.setItem("bloom-user", JSON.stringify(currentUser));
        setUser(currentUser);
      } catch {
        clearSession();
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials) => {
    const { token, user: loginUser } = await authService.login(credentials);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    try {
      const currentUser = loginUser || (await authService.getCurrentUser());
      saveSession(token, currentUser);
      return currentUser;
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // The local session must still be cleared when the server is unavailable.
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isRestoring, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

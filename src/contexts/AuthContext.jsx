import { createContext, useContext, useState } from "react";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("bloom-user") || "null"),
  );
  const login = (email) => {
    const next = {
      name: email
        .split("@")[0]
        .replace(/(^|[._-])\w/g, (x) => x.at(-1).toUpperCase()),
      email,
      role: "Super Admin",
    };
    setUser(next);
    localStorage.setItem("bloom-user", JSON.stringify(next));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("bloom-user");
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);

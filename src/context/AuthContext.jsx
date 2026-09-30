import { createContext, useContext, useEffect, useState } from "react";
import api, { setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post("/auth/refresh")
      .then(({ data }) => {
        setToken(data.data.accessToken);
        setUser(data.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = (payload) => api.post("/auth/register", payload);

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
import { useState, useEffect } from "react";

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Erro ao parsear usuário:", error);
      }
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isProfessor = user?.role === "PROFESSOR";
  const isCoordenador = user?.role === "COORDENADOR";
  const isAluno = user?.role === "ALUNO";

  const hasRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return {
    user,
    loading,
    isAdmin,
    isProfessor,
    isCoordenador,
    isAluno,
    hasRole,
    logout,
  };
};

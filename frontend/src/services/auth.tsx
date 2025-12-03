import { apiUrl } from "./api";

interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      senha,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao realizar login");
  }

  return response.json();
}

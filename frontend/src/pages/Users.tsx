import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Plus, 
  MoreVertical,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface UserAPI {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  COORDENADOR: "Coordenador",
  PROFESSOR: "Professor"
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500",
  COORDENADOR: "bg-purple-500",
  PROFESSOR: "bg-blue-500"
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserAPI[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newUser, setNewUser] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "PROFESSOR"
  })

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingUser, setEditingUser] = useState({
    id: "",
    nome: "",
    email: "",
    role: ""
  })

  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === "ADMIN") {
            setIsAuthDialogOpen(true);
            setLoading(false); // Não mostrar loading antes da autenticação
          }
        } catch (error) {
          console.error("Erro ao verificar usuário:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Validar senha do admin
  const handleValidateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("Usuário não encontrado");

      const user = JSON.parse(userStr);
      
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          senha: adminPassword
        })
      });

      if (!response.ok) {
        throw new Error("Senha incorreta");
      }

      setIsAuthenticated(true);
      setIsAuthDialogOpen(false);
      toast({ title: "Autenticado", description: "Acesso liberado!" });
      fetchUsers();

    } catch (error) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: "Senha incorreta. Tente novamente." 
      });
    } finally {
      setIsValidating(false);
      setAdminPassword("");
    }
  };

  // 1. Buscar Usuários (GET)
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/v1/usuarios", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.status === 403 || response.status === 401) {
        toast({ variant: "destructive", title: "Sessão expirada", description: "Faça login novamente." });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => window.location.href = "/login", 1500);
        return;
      }

      if (!response.ok) throw new Error("Falha ao buscar usuários");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar lista." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchUsers();
    }
  }, [isAuthenticated]);

  // 2. Criar Usuário (POST)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ variant: "destructive", title: "Sessão expirada" });
        return;
      }

      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: newUser.nome,
          email: newUser.email,
          senha: newUser.senha,
          role: newUser.role
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao criar usuário");

      toast({ title: "Sucesso", description: "Usuário cadastrado com sucesso!" });
      setIsCreateOpen(false);
      setNewUser({ nome: "", email: "", senha: "", role: "PROFESSOR" });
      fetchUsers();

    } catch (error) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido" 
      });
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Preparar Edição
  const handleOpenEdit = (user: UserAPI) => {
    setEditingUser({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role
    });
    setIsEditOpen(true);
  };

  // 4. Atualizar Usuário (PUT)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/usuarios/${editingUser.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: editingUser.nome,
          email: editingUser.email,
          role: editingUser.role
        })
      });

      if (!response.ok) throw new Error("Erro ao atualizar usuário");

      toast({ title: "Atualizado", description: "Dados salvos com sucesso." });
      setIsEditOpen(false);
      fetchUsers();

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar alterações." });
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Excluir Usuário (DELETE)
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/usuarios/${userToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast({ title: "Removido", description: "Usuário excluído com sucesso." });
      setUsers(prev => prev.filter(u => u.id !== userToDelete));

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir." });
    } finally {
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roleLabels[user.role]?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.ativo).length;
  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const coordCount = users.filter(u => u.role === "COORDENADOR").length;

  return (
    <div className="space-y-6">
      {/* Dialog de Autenticação Admin */}
      <Dialog open={isAuthDialogOpen} onOpenChange={(open) => {
        if (!open && !isAuthenticated) {
          window.location.href = "/dashboard";
        }
        setIsAuthDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>🔒 Autenticação Necessária</DialogTitle>
            <DialogDescription>
              Por segurança, confirme sua senha de administrador para acessar esta área.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleValidateAdmin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha de Administrador</Label>
              <Input
                id="admin-password"
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => window.location.href = "/dashboard"}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isValidating}>
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loading state após autenticação */}
      {loading && isAuthenticated && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      )}

      {/* Conteúdo principal - só mostra se autenticado e não estiver carregando */}
      {!loading && isAuthenticated && (
        <>
      {/* Cabeçalho e Botão Novo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários e suas permissões</p>
        </div>

        {/* Modal de CRIAÇÃO */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>Crie um usuário com permissões específicas.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" 
                  required 
                  value={newUser.nome}
                  onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                  placeholder="Ex: João da Silva"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  required 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Ex: joao@cursinho.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input 
                  id="senha" 
                  type="password"
                  required 
                  minLength={6}
                  value={newUser.senha}
                  onChange={(e) => setNewUser({...newUser, senha: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">👑 Administrador</SelectItem>
                    <SelectItem value="COORDENADOR">📋 Coordenador</SelectItem>
                    <SelectItem value="PROFESSOR">👨‍🏫 Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">⚠️ Atenção:</p>
                <p className="text-amber-700 dark:text-amber-300">
                  <strong>Admin:</strong> Acesso total ao sistema<br />
                  <strong>Coordenador:</strong> Gerencia turmas, professores e alunos<br />
                  <strong>Professor:</strong> Gerencia aulas e registra presenças
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de EDIÇÃO */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados e permissões do usuário.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome Completo</Label>
              <Input 
                id="edit-nome" 
                required
                value={editingUser.nome}
                onChange={(e) => setEditingUser({...editingUser, nome: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email"
                required
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Tipo de Usuário</Label>
              <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">👑 Administrador</SelectItem>
                  <SelectItem value="COORDENADOR">📋 Coordenador</SelectItem>
                  <SelectItem value="PROFESSOR">👨‍🏫 Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{adminCount}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coordenadores</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{coordCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`${roleColors[user.role]} text-white`}>
                      {user.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{user.nome}</h3>
                      <Badge variant={user.ativo ? "default" : "secondary"} className="text-xs">
                        {user.ativo ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {user.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge className={`${roleColors[user.role]} text-white`}>
                        {roleLabels[user.role]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setUserToDelete(user.id)}
                      className="text-destructive"
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  )
}

export default Users

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Plus, 
  Mail, 
  Phone, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  MoreVertical,
  Loader2,
  Search,
  Filter
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

interface TeacherAPI {
  id: string;
  apelido: string | null;
  usuario: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
    createdAt?: string;
  };
  _count?: {
    turmas: number;
  };
}

const Teachers = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [teachers, setTeachers] = useState<TeacherAPI[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    nome: "",
    email: "",
    senha: "",
    apelido: ""
  })

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState({
    id: "",
    nome: "",
    email: "",   
    apelido: ""
  })

  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null)

  // 1. Buscar Professores (GET)
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/v1/professores", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Falha ao buscar professores");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar lista." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 2. Criar Professor (Auth + Profile)
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ variant: "destructive", title: "Sessão expirada" });
        return;
      }

      // Passo A: Criar Usuário
      const authRes = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: newTeacher.nome,
          email: newTeacher.email,
          senha: newTeacher.senha,
          role: "PROFESSOR"
        })
      });

      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.message || "Erro ao criar usuário");

      // Passo B: Criar Perfil de Professor
      const profRes = await fetch("/api/v1/professores", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          idUsuario: authData.usuario.id,
          apelido: newTeacher.apelido || undefined
        })
      });

      const profData = await profRes.json();
      if (!profRes.ok) throw new Error(profData.message || "Erro ao criar perfil de professor");

      toast({ title: "Sucesso", description: "Professor cadastrado com sucesso!" });
      setIsCreateOpen(false);
      setNewTeacher({ nome: "", email: "", senha: "", apelido: "" });
      fetchTeachers();

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
  const handleOpenEdit = (teacher: TeacherAPI) => {
    setEditingTeacher({
      id: teacher.id,
      nome: teacher.usuario.nome,
      email: teacher.usuario.email,
      apelido: teacher.apelido || ""
    });
    setIsEditOpen(true);
  };

  // 4. Salvar Edição (PUT)
  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/professores/${editingTeacher.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apelido: editingTeacher.apelido
        })
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      toast({ title: "Atualizado", description: "Dados salvos com sucesso." });
      setIsEditOpen(false);
      fetchTeachers();

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar." });
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Excluir Professor
  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/professores/${teacherToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast({ title: "Removido", description: "Professor excluído com sucesso." });
      setTeachers(prev => prev.filter(t => t.id !== teacherToDelete));

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir." });
    } finally {
      setTeacherToDelete(null);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.apelido && t.apelido.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalTeachers = teachers.length
  const activeTeachers = teachers.filter(t => t.usuario.ativo).length
  const totalClasses = teachers.reduce((acc, t) => acc + (t._count?.turmas || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Professores</h1>
          <p className="text-muted-foreground">
            Gerencie o corpo docente do cursinho
          </p>
        </div>
        
        {/* Modal de Criação */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Professor</DialogTitle>
              <DialogDescription>Crie o usuário e o perfil do professor.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeacher} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" required value={newTeacher.nome}
                  onChange={(e) => setNewTeacher({...newTeacher, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" type="email" required value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input 
                    id="senha" type="password" required minLength={6} value={newTeacher.senha}
                    onChange={(e) => setNewTeacher({...newTeacher, senha: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apelido">Apelido (Opcional)</Label>
                  <Input 
                    id="apelido" value={newTeacher.apelido}
                    onChange={(e) => setNewTeacher({...newTeacher, apelido: e.target.value})}
                    placeholder="Ex: Prof. Beto"
                  />
                </div>
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

      {/* Busca e Filtros */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou apelido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">{totalTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-xl font-semibold">{activeTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <BookOpen className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turmas Atribuídas</p>
                <p className="text-xl font-semibold">{totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card opacity-70">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estudantes</p>
                <p className="text-xl font-semibold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Cards de Professores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="shadow-card hover:shadow-elevated transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      {teacher.usuario.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-foreground truncate" title={teacher.usuario.nome}>
                      {teacher.usuario.nome}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {teacher.apelido || "Sem apelido"}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(teacher)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setTeacherToDelete(teacher.id)}
                    >
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status e Rating Placeholder */}
              <div className="flex items-center justify-between">
                {teacher.usuario.ativo 
                  ? <Badge className="bg-accent text-accent-foreground">Ativo</Badge>
                  : <Badge variant="secondary">Inativo</Badge>
                }
                <div className="flex items-center gap-1 opacity-50" title="Funcionalidade futura">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-3 w-3 text-muted-foreground" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">--</span>
                </div>
              </div>

              {/* Disciplinas Placeholder */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Disciplinas</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
                    Não atribuídas
                  </Badge>
                </div>
              </div>

              {/* Estatísticas (Com dados reais de turmas se disponível) */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {teacher._count?.turmas || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Turmas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">--</p>
                    <p className="text-xs text-muted-foreground">Estudantes</p>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span className="truncate" title={teacher.usuario.email}>{teacher.usuario.email}</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Phone className="h-3 w-3" />
                  <span>--</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Clock className="h-3 w-3" />
                  <span>-- de experiência</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTeachers.length === 0 && !loading && (
           <div className="col-span-full text-center p-8 text-muted-foreground">
             Nenhum professor encontrado.
           </div>
        )}
      </div>

      {/* Modal de EDIÇÃO */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Professor</DialogTitle>
            <DialogDescription>Atualize os dados do professor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTeacher} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome (Leitura)</Label>
              <Input id="edit-nome" value={editingTeacher.nome} disabled className="bg-muted" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-apelido">Apelido</Label>
              <Input 
                id="edit-apelido" 
                value={editingTeacher.apelido}
                onChange={(e) => setEditingTeacher({...editingTeacher, apelido: e.target.value})}
              />
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

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={!!teacherToDelete} onOpenChange={() => setTeacherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o perfil do professor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTeacher}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir professor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Teachers
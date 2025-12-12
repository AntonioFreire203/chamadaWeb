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
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  BookOpen,
  TrendingUp,
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

interface StudentAPI {
  id: string;
  matricula: string | null;
  usuario: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
    createdAt: string;
  };
}

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<StudentAPI[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newStudent, setNewStudent] = useState({
    nome: "",
    email: "",
    nascimento: ""
  })

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingStudent, setEditingStudent] = useState({
    id: "",
    nome: "",
    nascimento: ""
  })

  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)

  // 1. Buscar Alunos (GET)
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/v1/alunos", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Falha ao buscar estudantes");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar lista." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Criar Estudante (POST Auth + POST Aluno)
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ variant: "destructive", title: "Sessão expirada" });
        return;
      }

      // Gerar senha automaticamente (alunos não fazem login)
      const senhaGerada = "aluno123"; // Senha padrão

      const authRes = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: newStudent.nome,
          email: newStudent.email,
          senha: senhaGerada,
          role: "ALUNO"
        })
      });

      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.message || "Erro ao criar usuário");

      // Criar perfil de aluno com data de nascimento
      const alunoRes = await fetch("/api/v1/alunos", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          idUsuario: authData.usuario.id,
          nascimento: newStudent.nascimento ? new Date(newStudent.nascimento).toISOString() : undefined
        })
      });

      // Se retornar 409, significa que o perfil já foi criado automaticamente (tudo ok)
      if (alunoRes.status === 409) {
        console.log("Perfil de aluno já existe - criado automaticamente pelo backend");
      } else if (!alunoRes.ok) {
        const alunoData = await alunoRes.json();
        throw new Error(alunoData.message || "Erro ao criar perfil de aluno");
      }

      toast({ title: "Sucesso", description: "Estudante cadastrado com sucesso!" });
      setIsCreateOpen(false);
      setNewStudent({ nome: "", email: "", nascimento: "" });
      fetchStudents();

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

  // 3. Preparar Edição (Abrir Modal)
  const handleOpenEdit = (student: StudentAPI) => {
    let dataNascimentoFormatada = "";
    // @ts-ignore - Ignorando erro de tipagem caso o campo nascimento venha extra
    if (student.nascimento) {
       // @ts-ignore
       dataNascimentoFormatada = new Date(student.nascimento).toISOString().split('T')[0];
    }

    setEditingStudent({
      id: student.id,
      nome: student.usuario.nome,
      nascimento: dataNascimentoFormatada
    });
    setIsEditOpen(true);
  };

  // 4. Salvar Edição (PUT)
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/alunos/${editingStudent.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nascimento: editingStudent.nascimento ? new Date(editingStudent.nascimento).toISOString() : undefined
        })
      });

      if (!response.ok) throw new Error("Erro ao atualizar estudante");

      toast({ title: "Atualizado", description: "Dados salvos com sucesso." });
      setIsEditOpen(false);
      fetchStudents();

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar alterações." });
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Excluir Estudante (DELETE)
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/alunos/${studentToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast({ title: "Removido", description: "Estudante excluído com sucesso." });
      setStudents(prev => prev.filter(s => s.id !== studentToDelete));

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir." });
    } finally {
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(student =>
    student.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.matricula && student.matricula.includes(searchTerm))
  )

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.usuario.ativo).length;
  
  const newStudentsThisMonth = students.filter(s => {
    if (!s.usuario.createdAt) return false;
    const date = new Date(s.usuario.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

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
      {/* Cabeçalho e Botão Novo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estudantes</h1>
          <p className="text-muted-foreground">Gerencie os estudantes do cursinho</p>
        </div>

        {/* Modal de CRIAÇÃO */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Estudante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Estudante</DialogTitle>
              <DialogDescription>Crie um usuário e o perfil de estudante.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStudent} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" 
                  required 
                  value={newStudent.nome}
                  onChange={(e) => setNewStudent({...newStudent, nome: e.target.value})}
                  placeholder="Ex: João da Silva"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  required 
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="Ex: joao.silva@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nascimento">Data de Nascimento</Label>
                <Input 
                  id="nascimento" 
                  type="date" 
                  required
                  value={newStudent.nascimento}
                  onChange={(e) => setNewStudent({...newStudent, nascimento: e.target.value})}
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
                <p className="font-medium mb-1">ℹ️ Informação:</p>
                <p>Os estudantes não fazem login no sistema. A senha é gerada automaticamente.</p>
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
            <DialogTitle>Editar Estudante</DialogTitle>
            <DialogDescription>Atualize os dados acadêmicos.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome Completo</Label>
              <Input 
                id="edit-nome" 
                value={editingStudent.nome} 
                disabled 
                className="bg-muted" 
              />
              <p className="text-xs text-muted-foreground">O nome não pode ser alterado aqui</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-nascimento">Data de Nascimento</Label>
              <Input 
                id="edit-nascimento" 
                type="date" 
                required
                value={editingStudent.nascimento}
                onChange={(e) => setEditingStudent({...editingStudent, nascimento: e.target.value})}
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

      {/* Busca e Filtros */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou matrícula..."
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
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-xl font-semibold">{activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Novos (Mês)</p>
                <p className="text-xl font-semibold">{newStudentsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card opacity-70">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequência</p>
                <p className="text-xl font-semibold">--%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Estudantes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lista de Estudantes ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Estudante</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Cadastro</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {student.usuario.nome.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{student.usuario.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Matrícula: {student.matricula || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {student.usuario.email}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {student.usuario.createdAt 
                        ? new Date(student.usuario.createdAt).toLocaleDateString()
                        : "--"}
                    </td>
                    <td className="p-4">
                      {student.usuario.ativo 
                        ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge> 
                        : <Badge variant="secondary">Inativo</Badge>}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(student)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => setStudentToDelete(student.id)}
                          >Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && !loading && (
                   <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum estudante encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o perfil do aluno
              e todos os dados associados do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >Sim, excluir aluno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Students
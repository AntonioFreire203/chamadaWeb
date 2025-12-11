import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Users, BookOpen, Calendar, Loader2, UserPlus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- INTERFACES ---

interface ClassAPI {
  id: string;
  nome: string;
  codigo: string | null;
  anoLetivo: number;
  periodo: string | null;
  ativo: boolean;
  _count?: {
    alunos: number;
  };
  professores?: Array<{
    id: string;
    professor: {
      id: string;
      usuario: {
        nome: string;
      }
    }
  }>;
}

interface TeacherSimple {
  id: string;
  usuario: {
    id: string;
    nome: string;
  };
}

interface StudentSimple {
  id: string; 
  usuario: {
    nome: string;
    email: string;
  };
}

interface EnrolledStudent {
  id: string;
  aluno: {
    id: string;
    usuario: {
      nome: string;
      email: string;
    }
  }
}

const ClassManagement = () => {
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassAPI[]>([]);
  const [teachers, setTeachers] = useState<TeacherSimple[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassAPI | null>(null);

  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [allStudents, setAllStudents] = useState<StudentSimple[]>([]); // Para o select
  const [studentToAddId, setStudentToAddId] = useState<string>("");
  const [currentClassForStudents, setCurrentClassForStudents] = useState<ClassAPI | null>(null);

  const [classToDelete, setClassToDelete] = useState<string | null>(null);


  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { "Authorization": `Bearer ${token}` };

      const [turmasRes, profsRes] = await Promise.all([
        fetch("/api/v1/turmas", { headers }),
        fetch("/api/v1/professores", { headers })
      ]);

      if (!turmasRes.ok) throw new Error("Erro ao buscar turmas");
      
      const turmasData = await turmasRes.json();
      setClasses(turmasData);

      if (profsRes.ok) {
        const profsData = await profsRes.json();
        setTeachers(profsData);
      }

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      nome: formData.get("nome") as string,
      codigo: formData.get("codigo") as string || undefined,
      anoLetivo: parseInt(formData.get("year") as string),
      periodo: formData.get("periodo") as string || undefined,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const url = editingClass 
        ? `/api/v1/turmas/${editingClass.id}`
        : "/api/v1/turmas";
      
      const method = editingClass ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Erro ao salvar turma");

      toast({
        title: "Sucesso",
        description: editingClass ? "Turma atualizada." : "Turma criada."
      });

      setIsDialogOpen(false);
      setEditingClass(null);
      fetchData();

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/turmas/${classToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast({ title: "Turma excluída", description: "Registro removido." });
      setClasses(prev => prev.filter(c => c.id !== classToDelete));

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir." });
    } finally {
      setClassToDelete(null);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedClassId || !selectedTeacherId) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Encontrar o professor selecionado para pegar o idUsuario
      const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
      if (!selectedTeacher) {
        throw new Error("Professor não encontrado");
      }

      const response = await fetch(`/api/v1/turmas/${selectedClassId}/professores`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          idUsuario: selectedTeacher.usuario.id,
          papel: "RESPONSAVEL"
        })
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Erro ao vincular professor");

      toast({ title: "Professor vinculado", description: "O professor foi atribuído à turma." });
      setIsTeacherDialogOpen(false);
      setSelectedTeacherId("");
      fetchData();

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha no vínculo." });
    } finally {
      setIsSaving(false);
    }
  };

  const openStudentManager = async (classItem: ClassAPI) => {
    setCurrentClassForStudents(classItem);
    setIsStudentDialogOpen(true);
    setEnrolledStudents([]); 
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Buscar alunos da turma
      const enrolledRes = await fetch(`/api/v1/turmas/${classItem.id}/alunos`, { headers });
      
      // 2. Buscar todos os alunos
      const allRes = await fetch("/api/v1/alunos", { headers });

      if (enrolledRes.ok) {
        const enrolledData = await enrolledRes.json();
        setEnrolledStudents(enrolledData);
      }

      if (allRes.ok) {
        const allData = await allRes.json();
        setAllStudents(allData);
      }

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar alunos." });
    }
  };

  const handleEnrollStudent = async () => {
    if (!currentClassForStudents || !studentToAddId) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/turmas/${currentClassForStudents.id}/alunos`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ idAluno: studentToAddId })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao matricular");
      }

      toast({ title: "Aluno matriculado", description: "Estudante adicionado à turma." });
      setStudentToAddId(""); 

      const enrolledRes = await fetch(`/api/v1/turmas/${currentClassForStudents.id}/alunos`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (enrolledRes.ok) setEnrolledStudents(await enrolledRes.json());
      fetchData();

    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: error instanceof Error ? error.message : "Falha na matrícula" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!currentClassForStudents) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/turmas/${currentClassForStudents.id}/alunos/${studentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao remover aluno");

      toast({ title: "Removido", description: "Aluno removido da turma." });
      
      setEnrolledStudents(prev => prev.filter(s => s.aluno.id !== studentId));
      fetchData();

    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao remover." });
    }
  };

  // --- HELPERS E UI ---

  const handleCreateClick = () => {
    setEditingClass(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (classItem: ClassAPI) => {
    setEditingClass(classItem);
    setIsDialogOpen(true);
  };

  const handleTeacherClick = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedTeacherId("");
    setIsTeacherDialogOpen(true);
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (classItem.codigo && classItem.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = yearFilter === "all" || classItem.anoLetivo.toString() === yearFilter;
    return matchesSearch && matchesYear;
  });

  const getSubjectColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("matemática") || n.includes("cálculo")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (n.includes("português") || n.includes("letras")) return "bg-red-100 text-red-700 border-red-200";
    if (n.includes("história") || n.includes("geo")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (n.includes("física") || n.includes("química")) return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-muted text-muted-foreground border-border";
  };

  const availableStudents = allStudents.filter(
    s => !enrolledStudents.some(e => e.aluno.id === s.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Turmas</h1>
          <p className="text-muted-foreground">Gerencie as turmas e anos letivos</p>
        </div>
        
        <Button onClick={handleCreateClick} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nova Turma
        </Button>
      </div>

      {/* Modal Criar/Editar Turma */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Editar Turma" : "Criar Nova Turma"}
            </DialogTitle>
            <DialogDescription>
              Dados básicos da turma. Professores e alunos são vinculados depois.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Turma</Label>
              <Input
                id="nome" name="nome" required
                defaultValue={editingClass?.nome || ""}
                placeholder="Ex: Matemática Básica A"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código (Opcional)</Label>
                <Input
                  id="codigo" name="codigo"
                  defaultValue={editingClass?.codigo || ""}
                  placeholder="Ex: MAT-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodo">Período</Label>
                <Select name="periodo" defaultValue={editingClass?.periodo || "Matutino"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matutino">Matutino</SelectItem>
                    <SelectItem value="Vespertino">Vespertino</SelectItem>
                    <SelectItem value="Noturno">Noturno</SelectItem>
                    <SelectItem value="Integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Ano Letivo</Label>
              <Select name="year" defaultValue={editingClass?.anoLetivo.toString() || new Date().getFullYear().toString()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingClass ? "Salvar" : "Criar Turma")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Vincular Professor */}
      <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Definir Professor Responsável</DialogTitle>
            <DialogDescription>Selecione um professor para esta turma.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Professor</Label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.usuario.nome}
                    </SelectItem>
                  ))}
                  {teachers.length === 0 && <SelectItem value="none" disabled>Nenhum professor cadastrado</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeacherDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAssignTeacher} disabled={!selectedTeacherId || isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Vincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Alunos</DialogTitle>
            <DialogDescription>
              Turma: <span className="font-medium text-foreground">{currentClassForStudents?.nome}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4 overflow-hidden py-4">
            {/* Adicionar Aluno */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label>Adicionar Estudante</Label>
                <Select value={studentToAddId} onValueChange={setStudentToAddId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione para matricular..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.usuario.nome} ({s.usuario.email})
                      </SelectItem>
                    ))}
                    {availableStudents.length === 0 && <SelectItem value="none" disabled>Todos os alunos já matriculados</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEnrollStudent} disabled={!studentToAddId || isSaving}>
                <UserPlus className="h-4 w-4 mr-2" />
                Matricular
              </Button>
            </div>
            <Separator />
            <div className="flex-1 overflow-hidden flex flex-col">
              <Label className="mb-2">Alunos Matriculados ({enrolledStudents.length})</Label>
              <ScrollArea className="flex-1 border rounded-md p-2">
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum aluno matriculado nesta turma.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrolledStudents.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/40 rounded-md hover:bg-muted/60">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.aluno.usuario.nome}</span>
                          <span className="text-xs text-muted-foreground">{item.aluno.usuario.email}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:text-destructive"
                          onClick={() => handleRemoveStudent(item.aluno.id)}
                          title="Remover da turma"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filtros */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-32">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => {
          const professorName = classItem.professores?.[0]?.professor?.usuario?.nome || "Sem professor";
          const studentCount = classItem._count?.alunos || 0;

          return (
            <Card key={classItem.id} className="hover:shadow-elevated transition-smooth flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{classItem.nome}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getSubjectColor(classItem.nome)}>
                        {classItem.codigo || "Geral"}
                      </Badge>
                      {classItem.periodo && (
                        <Badge variant="secondary" className="text-xs">{classItem.periodo}</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTeacherClick(classItem.id)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Definir Professor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openStudentManager(classItem)}>
                        <Users className="mr-2 h-4 w-4" /> Gerenciar Alunos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(classItem)}>
                        Editar Turma
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setClassToDelete(classItem.id)}>
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className={professorName === "Sem professor" ? "text-muted-foreground italic" : "font-medium"}>
                      {professorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{studentCount} estudantes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Ano: {classItem.anoLetivo}</span>
                  </div>
                </div>

                <div className="pt-2 border-t flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" disabled title="Em breve">
                    Detalhes
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openStudentManager(classItem)}
                  >
                    Alunos
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClasses.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma turma encontrada</h3>
            <Button onClick={handleCreateClick}><Plus className="w-4 h-4 mr-2" /> Criar Primeira Turma</Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Turma?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação é irreversível. Alunos matriculados serão desvinculados desta turma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassManagement;
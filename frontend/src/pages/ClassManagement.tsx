import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Users, BookOpen, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassData {
  id: string;
  name: string;
  description: string;
  subject: string;
  teacher: string;
  students: number;
  schedule: string;
  year: string;
}

const ClassManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  // Mock data for classes
  const [classes, setClasses] = useState<ClassData[]>([
    {
      id: "1",
      name: "Matemática Básica A",
      description: "Fundamentos de matemática para vestibular",
      subject: "Matemática",
      teacher: "Prof. Carlos Silva",
      students: 24,
      schedule: "Seg, Qua, Sex - 14h às 16h",
      year: "2024"
    },
    {
      id: "2",
      name: "Português Avançado B",
      description: "Literatura e interpretação de texto",
      subject: "Português",
      teacher: "Profa. Maria Santos",
      students: 28,
      schedule: "Ter, Qui - 16h às 18h",
      year: "2024"
    },
    {
      id: "3",
      name: "História Geral A",
      description: "História do Brasil e mundial",
      subject: "História",
      teacher: "Prof. João Oliveira",
      students: 22,
      schedule: "Seg, Wed - 10h às 12h",
      year: "2024"
    },
    {
      id: "4",
      name: "Física Moderna",
      description: "Mecânica e termodinâmica",
      subject: "Física",
      teacher: "Prof. Ana Costa",
      students: 19,
      schedule: "Ter, Qui, Sex - 8h às 10h",
      year: "2024"
    }
  ]);

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "all" || classItem.subject === subjectFilter;
    const matchesYear = yearFilter === "all" || classItem.year === yearFilter;
    
    return matchesSearch && matchesSubject && matchesYear;
  });

  const handleCreateClass = () => {
    setEditingClass(null);
    setIsDialogOpen(true);
  };

  const handleEditClass = (classItem: ClassData) => {
    setEditingClass(classItem);
    setIsDialogOpen(true);
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(classes.filter(c => c.id !== classId));
    toast({
      title: "Turma excluída",
      description: "A turma foi removida com sucesso.",
    });
  };

  const handleSaveClass = (formData: FormData) => {
    const classData: ClassData = {
      id: editingClass?.id || Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      subject: formData.get("subject") as string,
      teacher: formData.get("teacher") as string,
      students: parseInt(formData.get("students") as string) || 0,
      schedule: formData.get("schedule") as string,
      year: formData.get("year") as string,
    };

    if (editingClass) {
      setClasses(classes.map(c => c.id === editingClass.id ? classData : c));
      toast({
        title: "Turma atualizada",
        description: "As informações da turma foram atualizadas com sucesso.",
      });
    } else {
      setClasses([...classes, classData]);
      toast({
        title: "Turma criada",
        description: "Nova turma criada com sucesso.",
      });
    }

    setIsDialogOpen(false);
    setEditingClass(null);
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      "Matemática": "bg-secondary/10 text-secondary border-secondary/20",
      "Português": "bg-accent/10 text-accent border-accent/20",
      "História": "bg-primary/10 text-primary border-primary/20",
      "Física": "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[subject] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Turmas</h1>
          <p className="text-muted-foreground">Gerencie turmas, professores e horários</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClass}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Editar Turma" : "Criar Nova Turma"}
              </DialogTitle>
              <DialogDescription>
                {editingClass 
                  ? "Atualize as informações da turma abaixo."
                  : "Preencha os dados para criar uma nova turma."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveClass(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Turma</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingClass?.name || ""}
                    placeholder="Ex: Matemática Básica A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Matéria</Label>
                  <Select name="subject" defaultValue={editingClass?.subject || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matemática">Matemática</SelectItem>
                      <SelectItem value="Português">Português</SelectItem>
                      <SelectItem value="História">História</SelectItem>
                      <SelectItem value="Física">Física</SelectItem>
                      <SelectItem value="Química">Química</SelectItem>
                      <SelectItem value="Biologia">Biologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingClass?.description || ""}
                  placeholder="Descreva o conteúdo e objetivos da turma"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Professor</Label>
                  <Input
                    id="teacher"
                    name="teacher"
                    defaultValue={editingClass?.teacher || ""}
                    placeholder="Nome do professor responsável"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="students">Número de Estudantes</Label>
                  <Input
                    id="students"
                    name="students"
                    type="number"
                    defaultValue={editingClass?.students || ""}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Horário</Label>
                  <Input
                    id="schedule"
                    name="schedule"
                    defaultValue={editingClass?.schedule || ""}
                    placeholder="Ex: Seg, Qua, Sex - 14h às 16h"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Select name="year" defaultValue={editingClass?.year || "2024"} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClass ? "Atualizar" : "Criar"} Turma
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome da turma ou professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as matérias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as matérias</SelectItem>
                  <SelectItem value="Matemática">Matemática</SelectItem>
                  <SelectItem value="Português">Português</SelectItem>
                  <SelectItem value="História">História</SelectItem>
                  <SelectItem value="Física">Física</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-32">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
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

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-elevated transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <Badge variant="outline" className={getSubjectColor(classItem.subject)}>
                    {classItem.subject}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClass(classItem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(classItem.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {classItem.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{classItem.teacher}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{classItem.students} estudantes</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{classItem.schedule}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Detalhes
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    Gerenciar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground mb-6">
              Não foram encontradas turmas com os filtros aplicados.
            </p>
            <Button onClick={handleCreateClass}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Turma
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassManagement;
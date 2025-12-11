import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ClipboardCheck,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Download,
  Loader2
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiUrl, getAuthHeaders } from "@/services/api"

interface Turma {
  id: string;
  nome: string;
  codigo: string | null;
  anoLetivo: number;
  periodo: string | null;
}

interface Aula {
  id: string;
  titulo: string;
  dataAula: string;
  horaInicio?: string;
  horaFim?: string;
}

interface Aluno {
  id: string;
  aluno: {
    id: string;
    usuario: {
      nome: string;
    }
  }
}

interface StudentAttendance {
  id: string;
  name: string;
  status: 'PRESENTE' | 'AUSENTE' | 'ATRASO' | 'JUSTIFICADA';
  observacao?: string;
}

const Attendance = () => {
  const { toast } = useToast()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedAula, setSelectedAula] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingAulas, setLoadingAulas] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [classes, setClasses] = useState<Turma[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [students, setStudents] = useState<StudentAttendance[]>([])

  // Buscar turmas
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${apiUrl}/turmas`, {
          headers: getAuthHeaders()
        });

        if (response.status === 403 || response.status === 401) {
          toast({ variant: "destructive", title: "Sessão expirada" });
          localStorage.removeItem("token");
          setTimeout(() => window.location.href = "/login", 1500);
          return;
        }

        if (!response.ok) throw new Error("Erro ao buscar turmas");
        
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar turmas." });
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Buscar aulas quando selecionar uma turma
  useEffect(() => {
    if (!selectedClass) {
      setAulas([]);
      setSelectedAula("");
      return;
    }

    const fetchAulas = async () => {
      setLoadingAulas(true);
      try {
        const response = await fetch(`${apiUrl}/turmas/${selectedClass}/aulas`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error("Erro ao buscar aulas");
        
        const data = await response.json();
        setAulas(data);
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar aulas." });
      } finally {
        setLoadingAulas(false);
      }
    };

    fetchAulas();
  }, [selectedClass]);

  // Buscar alunos e presenças quando selecionar uma aula
  useEffect(() => {
    if (!selectedClass || !selectedAula) {
      setStudents([]);
      return;
    }

    const fetchStudentsAndPresencas = async () => {
      setLoadingStudents(true);
      try {
        // Buscar alunos da turma
        const alunosResponse = await fetch(`${apiUrl}/turmas/${selectedClass}/alunos`, {
          headers: getAuthHeaders()
        });

        if (!alunosResponse.ok) throw new Error("Erro ao buscar alunos");
        
        const alunosData: Aluno[] = await alunosResponse.json();

        // Buscar presenças já registradas para esta aula
        const presencasResponse = await fetch(`${apiUrl}/aulas/${selectedAula}/presencas`, {
          headers: getAuthHeaders()
        });

        const presencasData = presencasResponse.ok ? await presencasResponse.json() : [];
        
        // Mapear presenças por aluno
        const presencasMap = new Map(
          presencasData.map((p: any) => [p.idAluno, p])
        );
        
        // Converter para formato de attendance
        const studentsData: StudentAttendance[] = alunosData.map(item => {
          const presenca = presencasMap.get(item.aluno.id);
          return {
            id: item.aluno.id,
            name: item.aluno.usuario.nome,
            status: presenca?.status || 'PRESENTE',
            observacao: presenca?.observacao
          };
        });

        setStudents(studentsData);
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar dados." });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudentsAndPresencas();
  }, [selectedClass, selectedAula]);

  const updateStudentStatus = (studentId: string, status: StudentAttendance['status']) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, status }
        : student
    ))
  }

  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'PRESENTE' as const })))
  }

  const markAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'AUSENTE' as const })))
  }

  const saveAttendance = async () => {
    if (!selectedAula) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione uma aula" });
      return;
    }

    setSaving(true);
    try {
      const presencas = students.map(student => ({
        idAluno: student.id,
        status: student.status,
        observacao: student.observacao
      }));

      const response = await fetch(`${apiUrl}/aulas/${selectedAula}/presencas`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ presencas })
      });

      if (!response.ok) throw new Error("Erro ao salvar presenças");

      toast({ 
        title: "Sucesso!", 
        description: `Presença registrada para ${students.length} alunos.` 
      });
    } catch (error) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: "Erro ao registrar chamada." 
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'PRESENTE').length
  const absentCount = students.filter(s => s.status === 'AUSENTE').length
  const justifiedCount = students.filter(s => s.status === 'JUSTIFICADA').length
  const atrasoCount = students.filter(s => s.status === 'ATRASO').length
  const totalStudents = students.length
  const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chamada</h1>
          <p className="text-muted-foreground">
            Registre a presença dos estudantes
          </p>
        </div>

      </div>

      {/* Class Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Turma
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={classes.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={classes.length === 0 ? "Nenhuma turma cadastrada" : "Selecione uma turma"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.nome} {cls.codigo ? `(${cls.codigo})` : ""} - {cls.anoLetivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Aula
              </label>
              {loadingAulas ? (
                <div className="flex h-10 items-center px-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <Select value={selectedAula} onValueChange={setSelectedAula} disabled={!selectedClass || aulas.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedClass ? "Selecione uma turma primeiro" : aulas.length === 0 ? "Nenhuma aula cadastrada" : "Selecione uma aula"} />
                  </SelectTrigger>
                  <SelectContent>
                    {aulas.map((aula) => (
                      <SelectItem key={aula.id} value={aula.id}>
                        {aula.titulo} - {new Date(aula.dataAula).toLocaleDateString('pt-BR')}
                        {aula.horaInicio && ` ${new Date(aula.horaInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingStudents && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando alunos...</span>
        </div>
      )}

      {selectedClass && selectedAula && !loadingStudents && students.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno matriculado</h3>
            <p className="text-muted-foreground">
              Esta turma ainda não possui alunos matriculados.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedClass && selectedAula && !loadingStudents && students.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
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
                    <CheckCircle className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Presentes</p>
                    <p className="text-xl font-semibold">{presentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Faltas</p>
                    <p className="text-xl font-semibold">{absentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Clock className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Justificadas</p>
                    <p className="text-xl font-semibold">{justifiedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Atrasos</p>
                    <p className="text-xl font-semibold">{atrasoCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Card */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Lista de Presença</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Taxa de presença: <span className="font-medium text-accent">{attendancePercentage}%</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    Marcar Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={markAllAbsent}>
                    Desmarcar Todos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Matrícula: {String(student.id).padStart(4, '0')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      {student.status === 'PRESENTE' ? (
                        <Badge className="bg-accent text-accent-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Presente
                        </Badge>
                      ) : student.status === 'JUSTIFICADA' ? (
                        <Badge className="bg-secondary/20 text-secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Justificada
                        </Badge>
                      ) : student.status === 'ATRASO' ? (
                        <Badge className="bg-warning/20 text-warning">
                          <Clock className="h-3 w-3 mr-1" />
                          Atraso
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Ausente
                        </Badge>
                      )}

                      {/* Status Selector */}
                      <Select 
                        value={student.status} 
                        onValueChange={(value) => updateStudentStatus(student.id, value as StudentAttendance['status'])}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENTE">Presente</SelectItem>
                          <SelectItem value="AUSENTE">Ausente</SelectItem>
                          <SelectItem value="ATRASO">Atraso</SelectItem>
                          <SelectItem value="JUSTIFICADA">Justificada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botão Registrar Chamada */}
          <div className="flex justify-center gap-3">
            <Button 
              size="lg" 
              className="gradient-primary min-w-[200px]"
              onClick={saveAttendance}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Registrar Chamada
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {!selectedClass && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Selecione uma turma e aula
            </h3>
            <p className="text-muted-foreground">
              Escolha uma turma e aula para iniciar a chamada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Attendance
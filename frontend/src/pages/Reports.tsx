import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Download, FileText, TrendingUp, UserCheck, UserX, Clock, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/components/ui/use-toast";

interface Turma {
  id: string;
  nome: string;
  codigo: string | null;
}

interface Estatisticas {
  presente: number;
  ausente: number;
  atraso: number;
  justificada: number;
  totalRegistros: number;
  percentualPresenca: number;
  percentualAusencia: number;
}

interface AlunoRelatorio {
  id: string;
  nome: string;
  matricula: string;
  estatisticas: Estatisticas;
}

interface Relatorio {
  turma: {
    id: string;
    nome: string;
    codigo: string | null;
  };
  periodo: {
    de: string | null;
    ate: string | null;
  };
  totalAulas: number;
  alunos: AlunoRelatorio[];
}

const Reports = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("last-30-days");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [loading, setLoading] = useState(true);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);

  // Calculate date range for API query
  const getDateRange = () => {
    const hoje = new Date();
    let de: Date | null = null;
    
    switch (dateRange) {
      case "last-7-days":
        de = new Date(hoje);
        de.setDate(de.getDate() - 7);
        break;
      case "last-30-days":
        de = new Date(hoje);
        de.setDate(de.getDate() - 30);
        break;
      case "last-3-months":
        de = new Date(hoje);
        de.setMonth(de.getMonth() - 3);
        break;
      default:
        de = null;
    }
    
    return { de, ate: hoje };
  };

  // Fetch turmas and relatorios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch turmas
        const turmasRes = await fetch("/api/v1/turmas", { headers });
        if (!turmasRes.ok) throw new Error("Erro ao buscar turmas");
        const turmasData = await turmasRes.json();
        setTurmas(turmasData);

        // Build query params for date range
        const { de, ate } = getDateRange();
        const queryParams = new URLSearchParams();
        if (de) queryParams.append("de", de.toISOString().split('T')[0]);
        queryParams.append("ate", ate.toISOString().split('T')[0]);
        const queryString = queryParams.toString();

        // Fetch relatorios for all turmas
        const relatoriosPromises = turmasData.map((turma: Turma) =>
          fetch(`/api/v1/turmas/${turma.id}/presencas/relatorio?${queryString}`, { headers })
            .then(res => res.ok ? res.json() : null)
        );

        const relatoriosData = await Promise.all(relatoriosPromises);
        const relatoriosFiltrados = relatoriosData.filter((r): r is Relatorio => r !== null);
        console.log("📊 Relatórios carregados:", relatoriosFiltrados);
        console.log("📊 Total de alunos:", relatoriosFiltrados.flatMap(r => r.alunos).length);
        setRelatorios(relatoriosFiltrados);

      } catch (error) {
        console.error("❌ Erro ao carregar relatórios:", error);
        toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar relatórios." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate aggregate statistics from all relatorios
  const todosAlunos = relatorios.flatMap(r => r.alunos);
  
  const frequenciaGeral = todosAlunos.length > 0
    ? todosAlunos.reduce((sum, a) => sum + a.estatisticas.percentualPresenca, 0) / todosAlunos.length
    : 0;

  const melhorAluno = todosAlunos.length > 0
    ? todosAlunos.reduce((prev, curr) => 
        curr.estatisticas.percentualPresenca > prev.estatisticas.percentualPresenca ? curr : prev
      )
    : null;

  const piorAluno = todosAlunos.length > 0
    ? todosAlunos.reduce((prev, curr) => 
        curr.estatisticas.ausente > prev.estatisticas.ausente ? curr : prev
      )
    : null;

  const totalAtrasos = todosAlunos.reduce((sum, a) => sum + a.estatisticas.atraso, 0);
  const mediaAtrasos = todosAlunos.length > 0 ? totalAtrasos / todosAlunos.length : 0;

  // Distribution data (aggregate all presencas)
  const totalPresente = todosAlunos.reduce((sum, a) => sum + a.estatisticas.presente, 0);
  const totalAusente = todosAlunos.reduce((sum, a) => sum + a.estatisticas.ausente, 0);
  const totalAtraso = todosAlunos.reduce((sum, a) => sum + a.estatisticas.atraso, 0);
  const totalRegistros = totalPresente + totalAusente + totalAtraso;

  // Função de exportação CSV
  const exportToCSV = () => {
    if (studentsData.length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Não há dados para exportar" });
      return;
    }

    const headers = ["Nome", "Matrícula", "Frequência %", "Presentes", "Faltas", "Atrasos", "Justificadas"];
    const rows = studentsData.map(student => [
      student.nome,
      student.matricula || "N/A",
      student.estatisticas.percentualPresenca.toFixed(1) + "%",
      student.estatisticas.presente,
      student.estatisticas.ausente,
      student.estatisticas.atraso,
      student.estatisticas.justificada
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_frequencia_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({ title: "Sucesso!", description: "Relatório CSV baixado com sucesso" });
  };

  // Função de exportação PDF
  const exportToPDF = () => {
    if (studentsData.length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Não há dados para exportar" });
      return;
    }

    toast({ 
      title: "Em desenvolvimento", 
      description: "A exportação para PDF será implementada em breve" 
    });
  };

  const distributionData = [
    { name: "Presente", value: totalPresente, color: "hsl(var(--accent))" },
    { name: "Ausente", value: totalAusente, color: "hsl(var(--destructive))" },
    { name: "Atraso", value: totalAtraso, color: "hsl(var(--primary))" },
  ];

  // Filter students based on selected class
  const filteredAlunos = selectedClass === "all"
    ? todosAlunos
    : relatorios.find(r => r.turma.id === selectedClass)?.alunos || [];

  // Further filter by selected student
  const studentsData = selectedStudent === "all"
    ? filteredAlunos
    : filteredAlunos.filter(a => a.id === selectedStudent);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  // Show message if no data available
  if (relatorios.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise de frequência e desempenho</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                Nenhuma turma encontrada
              </h3>
              <p className="text-muted-foreground">
                Crie turmas e registre chamadas para visualizar relatórios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise de frequência e desempenho</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last-30-days">Últimos 30 dias</SelectItem>
                  <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Estudante</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estudantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estudantes</SelectItem>
                  {todosAlunos.map(aluno => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Turma</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {turmas.map(turma => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as matérias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as matérias</SelectItem>
                  <SelectItem value="math">Matemática</SelectItem>
                  <SelectItem value="portuguese">Português</SelectItem>
                  <SelectItem value="history">História</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frequenciaGeral.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média de todos os estudantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Frequência</CardTitle>
            <UserCheck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{melhorAluno ? melhorAluno.nome : "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {melhorAluno ? `${melhorAluno.estatisticas.percentualPresenca.toFixed(1)}% de presença` : "Sem dados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Faltas</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{piorAluno ? piorAluno.nome : "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {piorAluno ? `${piorAluno.estatisticas.ausente} faltas no período` : "Sem dados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasos Médios</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaAtrasos.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Por estudante</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Frequência</CardTitle>
          <CardDescription>Presença, ausência e atrasos - Total de {totalRegistros} registros</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Estudante</CardTitle>
          <CardDescription>Relatório completo de frequência individual ({studentsData.length} estudantes)</CardDescription>
        </CardHeader>
        <CardContent>
          {studentsData.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-muted-foreground">
                Não há dados de frequência disponíveis para o filtro selecionado.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Estudante</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Frequência %</TableHead>
                  <TableHead>Presentes</TableHead>
                  <TableHead>Faltas</TableHead>
                  <TableHead>Atrasos</TableHead>
                  <TableHead>Justificadas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.nome}</TableCell>
                    <TableCell>{student.matricula || "N/A"}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        student.estatisticas.percentualPresenca >= 90 ? 'text-accent' : 
                        student.estatisticas.percentualPresenca >= 75 ? 'text-primary' : 'text-destructive'
                      }`}>
                        {student.estatisticas.percentualPresenca.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>{student.estatisticas.presente}</TableCell>
                    <TableCell>{student.estatisticas.ausente}</TableCell>
                    <TableCell>{student.estatisticas.atraso}</TableCell>
                    <TableCell>{student.estatisticas.justificada}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
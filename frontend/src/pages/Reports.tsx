import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Download, FileText, TrendingUp, UserCheck, UserX, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Reports = () => {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

  // Mock data for charts
  const attendanceData = [
    { month: "Jan", attendance: 85 },
    { month: "Fev", attendance: 88 },
    { month: "Mar", attendance: 82 },
    { month: "Abr", attendance: 90 },
    { month: "Mai", attendance: 87 },
    { month: "Jun", attendance: 89 },
  ];

  const distributionData = [
    { name: "Presente", value: 75, color: "hsl(var(--accent))" },
    { name: "Ausente", value: 15, color: "hsl(var(--destructive))" },
    { name: "Atraso", value: 10, color: "hsl(var(--primary))" },
  ];

  const studentsData = [
    { name: "Maria Silva", attendance: "92%", absences: 3, lateness: 2, lastAttendance: "2024-01-08" },
    { name: "João Santos", attendance: "88%", absences: 5, lateness: 4, lastAttendance: "2024-01-08" },
    { name: "Ana Costa", attendance: "95%", absences: 2, lateness: 1, lastAttendance: "2024-01-07" },
    { name: "Pedro Lima", attendance: "76%", absences: 8, lateness: 6, lastAttendance: "2024-01-05" },
    { name: "Sofia Oliveira", attendance: "90%", absences: 4, lateness: 3, lastAttendance: "2024-01-08" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise de frequência e desempenho</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm">
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
                  <SelectItem value="maria">Maria Silva</SelectItem>
                  <SelectItem value="joao">João Santos</SelectItem>
                  <SelectItem value="ana">Ana Costa</SelectItem>
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
                  <SelectItem value="mat-a">Matemática A</SelectItem>
                  <SelectItem value="port-b">Português B</SelectItem>
                  <SelectItem value="hist-a">História A</SelectItem>
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
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Frequência</CardTitle>
            <UserCheck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ana Costa</div>
            <p className="text-xs text-muted-foreground">95% de presença</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Faltas</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pedro Lima</div>
            <p className="text-xs text-muted-foreground">8 faltas no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasos Médios</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">Por estudante/mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Frequência</CardTitle>
            <CardDescription>Porcentagem de presença ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Frequência</CardTitle>
            <CardDescription>Presença, ausência e atrasos</CardDescription>
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
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Estudante</CardTitle>
          <CardDescription>Relatório completo de frequência individual</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Estudante</TableHead>
                <TableHead>Frequência %</TableHead>
                <TableHead>Faltas</TableHead>
                <TableHead>Atrasos</TableHead>
                <TableHead>Última Presença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsData.map((student, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      parseInt(student.attendance) >= 90 ? 'text-accent' : 
                      parseInt(student.attendance) >= 80 ? 'text-primary' : 'text-destructive'
                    }`}>
                      {student.attendance}
                    </span>
                  </TableCell>
                  <TableCell>{student.absences}</TableCell>
                  <TableCell>{student.lateness}</TableCell>
                  <TableCell>{student.lastAttendance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
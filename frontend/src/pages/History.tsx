import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Eye
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const History = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("last-month")

  // Sample history data
  const historyData = [
    {
      id: 1,
      type: "attendance",
      title: "Chamada realizada - Matemática",
      description: "Presença registrada para 28 estudantes",
      date: "2024-03-15",
      time: "14:30",
      user: "Prof. Ana Silva",
      details: { present: 25, absent: 3, class: "Álgebra Linear" },
      status: "completed"
    },
    {
      id: 2,
      type: "student",
      title: "Novo estudante cadastrado",
      description: "Marina Oliveira Costa foi adicionada ao sistema",
      date: "2024-03-14",
      time: "16:45",
      user: "Coordenação",
      details: { course: "Medicina", status: "Ativo" },
      status: "completed"
    },
    {
      id: 3,
      type: "grade",
      title: "Notas atualizadas - Física",
      description: "Avaliação de Mecânica - 32 estudantes avaliados",
      date: "2024-03-14",
      time: "10:20",
      user: "Prof. Carlos Mendes",
      details: { average: 7.8, highest: 9.5, lowest: 5.2 },
      status: "completed"
    },
    {
      id: 4,
      type: "class",
      title: "Aula cancelada - Química",
      description: "Aula de Química Orgânica cancelada por motivo de saúde",
      date: "2024-03-13",
      time: "18:00",
      user: "Prof. Maria Santos",
      details: { reason: "Doença do professor", rescheduled: "2024-03-20" },
      status: "cancelled"
    },
    {
      id: 5,
      type: "system",
      title: "Relatório mensal gerado",
      description: "Relatório de frequência e desempenho - Fevereiro 2024",
      date: "2024-03-01",
      time: "09:00",
      user: "Sistema",
      details: { period: "Fevereiro 2024", students: 342, attendance: "87%" },
      status: "completed"
    },
    {
      id: 6,
      type: "teacher",
      title: "Professor adicionado",
      description: "João Pedro Costa foi cadastrado como professor",
      date: "2024-02-28",
      time: "14:15",
      user: "Coordenação",
      details: { subjects: ["História", "Geografia"], experience: "15 anos" },
      status: "completed"
    },
    {
      id: 7,
      type: "exam",
      title: "Simulado ENEM aplicado",
      description: "Simulado de Fevereiro aplicado para 150 estudantes",
      date: "2024-02-25",
      time: "08:00",
      user: "Coordenação",
      details: { participants: 150, completion: "94%", average: 520 },
      status: "completed"
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return <Clock className="h-4 w-4" />
      case "student":
        return <User className="h-4 w-4" />
      case "grade":
        return <TrendingUp className="h-4 w-4" />
      case "class":
        return <BookOpen className="h-4 w-4" />
      case "system":
        return <FileText className="h-4 w-4" />
      case "teacher":
        return <User className="h-4 w-4" />
      case "exam":
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attendance":
        return "text-primary bg-primary/10"
      case "student":
        return "text-accent bg-accent/10"
      case "grade":
        return "text-secondary bg-secondary/10"
      case "class":
        return "text-primary bg-primary/10"
      case "system":
        return "text-muted-foreground bg-muted"
      case "teacher":
        return "text-accent bg-accent/10"
      case "exam":
        return "text-secondary bg-secondary/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-accent text-accent-foreground">Concluído</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      case "pending":
        return <Badge className="bg-primary/20 text-primary">Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredHistory = historyData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === "all" || item.type === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const typeStats = {
    attendance: historyData.filter(h => h.type === "attendance").length,
    student: historyData.filter(h => h.type === "student").length,
    grade: historyData.filter(h => h.type === "grade").length,
    class: historyData.filter(h => h.type === "class").length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as atividades do sistema
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Histórico
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chamadas</p>
                <p className="text-xl font-semibold">{typeStats.attendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <User className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estudantes</p>
                <p className="text-xl font-semibold">{typeStats.student}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avaliações</p>
                <p className="text-xl font-semibold">{typeStats.grade}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aulas</p>
                <p className="text-xl font-semibold">{typeStats.class}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no histórico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="attendance">Chamadas</SelectItem>
                <SelectItem value="student">Estudantes</SelectItem>
                <SelectItem value="grade">Avaliações</SelectItem>
                <SelectItem value="class">Aulas</SelectItem>
                <SelectItem value="teacher">Professores</SelectItem>
                <SelectItem value="exam">Simulados</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="last-week">Última semana</SelectItem>
                <SelectItem value="last-month">Último mês</SelectItem>
                <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Atividades Recentes ({filteredHistory.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredHistory.map((item, index) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors">
              {/* Icon */}
              <div className={`p-2 rounded-lg flex-shrink-0 ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                {/* Details */}
                {item.details && (
                  <div className="bg-muted/30 rounded-md p-3 mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(item.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          <span className="font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.user}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros para encontrar o que você procura.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default History
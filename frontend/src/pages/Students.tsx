import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  TrendingUp
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const students = [
    {
      id: 1,
      name: "Ana Carolina Silva",
      email: "ana.silva@email.com",
      phone: "(41) 99999-1234",
      course: "Medicina",
      status: "Ativo",
      attendance: 92,
      grade: 8.5,
      joinDate: "2024-02-15",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 2,
      name: "Carlos Eduardo Santos",
      email: "carlos.santos@email.com", 
      phone: "(41) 98888-5678",
      course: "Engenharia",
      status: "Ativo",
      attendance: 88,
      grade: 7.8,
      joinDate: "2024-01-20",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 3,
      name: "Marina Oliveira Costa",
      email: "marina.costa@email.com",
      phone: "(41) 97777-9012", 
      course: "Direito",
      status: "Ativo",
      attendance: 95,
      grade: 9.1,
      joinDate: "2024-03-01",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 4,
      name: "João Pedro Almeida",
      email: "joao.almeida@email.com",
      phone: "(41) 96666-3456",
      course: "Medicina",
      status: "Inativo", 
      attendance: 76,
      grade: 6.9,
      joinDate: "2023-11-10",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 5,
      name: "Beatriz Ferreira Lima",
      email: "beatriz.lima@email.com",
      phone: "(41) 95555-7890",
      course: "Psicologia",
      status: "Ativo",
      attendance: 90,
      grade: 8.2,
      joinDate: "2024-02-28",
      avatar: "/api/placeholder/32/32"
    }
  ]

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    return status === "Ativo" 
      ? <Badge className="bg-accent text-accent-foreground">Ativo</Badge>
      : <Badge variant="secondary">Inativo</Badge>
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-accent"
    if (attendance >= 80) return "text-primary"
    return "text-destructive"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estudantes</h1>
          <p className="text-muted-foreground">
            Gerencie os estudantes do cursinho
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Estudante
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estudantes por nome, email ou curso..."
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">{students.length}</p>
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
                <p className="text-xl font-semibold">
                  {students.filter(s => s.status === "Ativo").length}
                </p>
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
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-xl font-semibold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequência</p>
                <p className="text-xl font-semibold">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
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
                  <th className="text-left p-4 font-medium text-muted-foreground">Contato</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Curso Desejado</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Frequência</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Média</th>
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
                            {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Ingressou em {new Date(student.joinDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{student.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-foreground">{student.course}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getAttendanceColor(student.attendance)}`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-foreground">
                        {student.grade.toFixed(1)}
                      </span>
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
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Histórico</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Students
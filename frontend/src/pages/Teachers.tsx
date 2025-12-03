import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Mail,
  Phone,
  BookOpen,
  Clock,
  Users,
  Star,
  MoreVertical
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Teachers = () => {
  const teachers = [
    {
      id: 1,
      name: "Prof. Ana Maria Silva",
      email: "ana.silva@utfpr.edu.br",
      phone: "(41) 99999-1234",
      subjects: ["Matemática", "Física"],
      classes: 12,
      students: 145,
      rating: 4.8,
      status: "Ativo",
      experience: "8 anos",
      qualification: "Doutora em Matemática Aplicada"
    },
    {
      id: 2,
      name: "Prof. Carlos Eduardo Mendes",
      email: "carlos.mendes@utfpr.edu.br",
      phone: "(41) 98888-5678", 
      subjects: ["Física", "Química"],
      classes: 8,
      students: 98,
      rating: 4.6,
      status: "Ativo",
      experience: "12 anos",
      qualification: "Doutor em Física"
    },
    {
      id: 3,
      name: "Prof. Maria Santos Oliveira",
      email: "maria.santos@utfpr.edu.br",
      phone: "(41) 97777-9012",
      subjects: ["Química", "Biologia"],
      classes: 10,
      students: 112,
      rating: 4.9,
      status: "Ativo",
      experience: "6 anos",
      qualification: "Mestra em Química Orgânica"
    },
    {
      id: 4,
      name: "Prof. João Pedro Costa",
      email: "joao.costa@utfpr.edu.br",
      phone: "(41) 96666-3456",
      subjects: ["História", "Geografia"],
      classes: 6,
      students: 87,
      rating: 4.4,
      status: "Ativo",
      experience: "15 anos",
      qualification: "Doutor em História"
    },
    {
      id: 5,
      name: "Prof. Beatriz Lima Ferreira",
      email: "beatriz.ferreira@utfpr.edu.br",
      phone: "(41) 95555-7890",
      subjects: ["Português", "Literatura"],
      classes: 14,
      students: 156,
      rating: 4.7,
      status: "Férias",
      experience: "10 anos",
      qualification: "Doutora em Letras"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Badge className="bg-accent text-accent-foreground">Ativo</Badge>
      case "Férias":
        return <Badge className="bg-primary/20 text-primary">Férias</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-primary fill-current' : 'text-muted-foreground'}`} 
      />
    ))
  }

  const totalTeachers = teachers.length
  const activeTeachers = teachers.filter(t => t.status === "Ativo").length
  const totalClasses = teachers.reduce((sum, t) => sum + t.classes, 0)
  const totalStudents = teachers.reduce((sum, t) => sum + t.students, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Professores</h1>
          <p className="text-muted-foreground">
            Gerencie o corpo docente do cursinho
          </p>
        </div>
        <Button className="gradient-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Professor
        </Button>
      </div>

      {/* Statistics Cards */}
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
                <p className="text-sm text-muted-foreground">Turmas</p>
                <p className="text-xl font-semibold">{totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estudantes</p>
                <p className="text-xl font-semibold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="shadow-card hover:shadow-elevated transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      {teacher.name.split(' ')[1]?.charAt(0)}{teacher.name.split(' ')[2]?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
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
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Horários</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Desativar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Rating */}
              <div className="flex items-center justify-between">
                {getStatusBadge(teacher.status)}
                <div className="flex items-center gap-1">
                  {renderStars(teacher.rating)}
                  <span className="text-sm text-muted-foreground ml-1">{teacher.rating}</span>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Disciplinas</p>
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{teacher.classes}</p>
                    <p className="text-xs text-muted-foreground">Turmas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{teacher.students}</p>
                    <p className="text-xs text-muted-foreground">Estudantes</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{teacher.experience} de experiência</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Teachers
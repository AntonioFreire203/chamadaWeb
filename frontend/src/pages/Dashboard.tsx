import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Award
} from "lucide-react"

const Dashboard = () => {
  const stats = [
    {
      title: "Total de Estudantes",
      value: "342",
      change: "+12%",
      icon: GraduationCap,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Professores Ativos",
      value: "24",
      change: "+2",
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Aulas Esta Semana",
      value: "48",
      change: "92%",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Taxa de Presença",
      value: "87%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ]

  const recentActivities = [
    {
      title: "Nova turma de Matemática criada",
      time: "2 horas atrás",
      type: "success"
    },
    {
      title: "Professor João adicionou nova aula",
      time: "4 horas atrás", 
      type: "info"
    },
    {
      title: "15 novos estudantes matriculados",
      time: "1 dia atrás",
      type: "success"
    },
    {
      title: "Relatório mensal gerado",
      time: "2 dias atrás",
      type: "default"
    }
  ]

  const upcomingClasses = [
    {
      subject: "Matemática - Álgebra",
      teacher: "Prof. Ana Silva",
      time: "14:00 - 16:00",
      room: "Sala A-101",
      students: 28
    },
    {
      subject: "Física - Mecânica", 
      teacher: "Prof. Carlos Mendes",
      time: "16:00 - 18:00",
      room: "Sala B-203",
      students: 32
    },
    {
      subject: "Química - Orgânica",
      teacher: "Prof. Maria Santos",
      time: "19:00 - 21:00", 
      room: "Lab. Química",
      students: 25
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do cursinho comunitário
          </p>
        </div>
        <Button className="gradient-secondary">
          Gerar Relatório
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Aulas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximas Aulas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{classItem.subject}</p>
                    <p className="text-sm text-muted-foreground">{classItem.teacher}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{classItem.time}</p>
                  <p className="text-xs text-muted-foreground">{classItem.room}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Meta de Estudantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Atual</span>
              <span className="font-medium">342 / 400</span>
            </div>
            <Progress value={85} className="h-2" />
            <p className="text-xs text-muted-foreground">
              85% da meta anual alcançada
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Aprovações ENEM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa atual</span>
              <span className="font-medium">78%</span>
            </div>
            <Progress value={78} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Meta: 80% de aprovações
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Frequência Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Média mensal</span>
              <span className="font-medium">87%</span>
            </div>
            <Progress value={87} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Acima da média nacional
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
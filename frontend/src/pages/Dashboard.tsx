import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  BookOpen,
  Clock,
  Loader2
} from "lucide-react"
import { apiUrl, getAuthHeaders } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

interface Stats {
  totalAlunos: number;
  totalProfessores: number;
  totalAulas: number;
  totalTurmas: number;
}

interface Aula {
  id: string;
  titulo: string;
  dataAula: string;
  horaInicio?: string;
  horaFim?: string;
  turma: {
    nome: string;
  };
}

const Dashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    totalProfessores: 0,
    totalAulas: 0,
    totalTurmas: 0
  });
  const [proximasAulas, setProximasAulas] = useState<Aula[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = getAuthHeaders();

        // Buscar estatísticas
        const [alunosRes, turmasRes, usuariosRes] = await Promise.all([
          fetch(`${apiUrl}/alunos`, { headers }),
          fetch(`${apiUrl}/turmas`, { headers }),
          fetch(`${apiUrl}/usuarios`, { headers }).catch(() => ({ ok: false }))
        ]);

        const alunos = alunosRes.ok ? await alunosRes.json() : [];
        const turmas = turmasRes.ok ? await turmasRes.json() : [];
        const usuarios = usuariosRes.ok ? await usuariosRes.json() : [];

        // Buscar aulas de todas as turmas
        const aulasPromises = turmas.map((turma: any) =>
          fetch(`${apiUrl}/turmas/${turma.id}/aulas`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then(aulas => aulas.map((a: any) => ({ ...a, turma: { nome: turma.nome } })))
        );

        const aulasArrays = await Promise.all(aulasPromises);
        const todasAulas = aulasArrays.flat();

        // Filtrar próximas aulas (futuras)
        const agora = new Date();
        const aulasProximas = todasAulas
          .filter((aula: Aula) => new Date(aula.dataAula) >= agora)
          .sort((a: Aula, b: Aula) => 
            new Date(a.dataAula).getTime() - new Date(b.dataAula).getTime()
          )
          .slice(0, 5);

        setStats({
          totalAlunos: alunos.length,
          totalProfessores: usuarios.filter((u: any) => u.role === "PROFESSOR").length,
          totalAulas: todasAulas.length,
          totalTurmas: turmas.length
        });

        setProximasAulas(aulasProximas);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        toast({ 
          variant: "destructive", 
          title: "Erro", 
          description: "Erro ao carregar dados do dashboard" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: "Total de Estudantes",
      value: stats.totalAlunos,
      icon: GraduationCap,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Professores Ativos",
      value: stats.totalProfessores,
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Total de Aulas",
      value: stats.totalAulas,
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Turmas Ativas",
      value: stats.totalTurmas,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
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

      {/* Próximas Aulas */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Próximas Aulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximasAulas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma aula agendada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proximasAulas.map((aula) => (
                <div key={aula.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{aula.titulo}</p>
                      <p className="text-sm text-muted-foreground">{aula.turma.nome}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(aula.dataAula).toLocaleDateString('pt-BR')}
                    </p>
                    {aula.horaInicio && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(aula.horaInicio).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {aula.horaFim && ` - ${new Date(aula.horaFim).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Loader2
} from "lucide-react"
import { apiUrl, getAuthHeaders } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

interface Turma {
  id: string
  nome: string
  codigo: string
  anoLetivo: number
}

interface Aula {
  id: string
  idTurma: string
  titulo: string
  conteudo?: string
  dataAula: string
  horaInicio?: string
  horaFim?: string
  turma?: {
    nome: string
  }
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  
  const [newAula, setNewAula] = useState({
    idTurma: "",
    titulo: "",
    conteudo: "",
    dataAula: "",
    horaInicio: "",
    horaFim: ""
  })

  // Get current month info
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  // Load turmas and aulas
  useEffect(() => {
    loadTurmas()
    loadAulas()
  }, [])

  const loadTurmas = async () => {
    try {
      const response = await fetch(`${apiUrl}/turmas`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setTurmas(data)
      }
    } catch (error) {
      console.error("Erro ao carregar turmas:", error)
    }
  }

  const loadAulas = async () => {
    try {
      setLoading(true)
      // Carregar aulas de todas as turmas
      const response = await fetch(`${apiUrl}/turmas`, {
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const turmas = await response.json()
        const todasAulas: Aula[] = []
        
        // Para cada turma, buscar suas aulas
        for (const turma of turmas) {
          const aulasResponse = await fetch(`${apiUrl}/turmas/${turma.id}/aulas`, {
            headers: getAuthHeaders(),
          })
          
          if (aulasResponse.ok) {
            const aulasData = await aulasResponse.json()
            todasAulas.push(...aulasData.map((a: any) => ({ ...a, turma: { nome: turma.nome } })))
          }
        }
        
        setAulas(todasAulas)
      }
    } catch (error) {
      console.error("Erro ao carregar aulas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAula = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAula.idTurma || !newAula.titulo || !newAula.dataAula) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      
      // Preparar dados
      const aulaData = {
        titulo: newAula.titulo,
        conteudo: newAula.conteudo || undefined,
        dataAula: new Date(newAula.dataAula).toISOString(),
        horaInicio: newAula.horaInicio ? new Date(`${newAula.dataAula}T${newAula.horaInicio}`).toISOString() : undefined,
        horaFim: newAula.horaFim ? new Date(`${newAula.dataAula}T${newAula.horaFim}`).toISOString() : undefined,
      }

      const response = await fetch(`${apiUrl}/turmas/${newAula.idTurma}/aulas`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(aulaData),
      })

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Aula criada com sucesso",
        })
        
        setShowCreateModal(false)
        setNewAula({
          idTurma: "",
          titulo: "",
          conteudo: "",
          dataAula: "",
          horaInicio: "",
          horaFim: ""
        })
        
        loadAulas()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.mensagem || "Erro ao criar aula",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao criar aula:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar aula",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const getAulasForDay = (day: number) => {
    return aulas.filter(aula => {
      const aulaDate = new Date(aula.dataAula)
      return aulaDate.getDate() === day && 
             aulaDate.getMonth() === currentMonth && 
             aulaDate.getFullYear() === currentYear
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground">
            Gerencie aulas e eventos do cursinho
          </p>
        </div>
        <Button 
          className="gradient-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {months[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="p-3 min-h-[120px]" />
                  ))}
                  
                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const dayAulas = getAulasForDay(day)
                    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()
                    
                    return (
                      <div
                        key={day}
                        className={`p-2 min-h-[120px] border border-border rounded-lg ${
                          isToday ? 'bg-primary/5 border-primary' : 'hover:bg-muted/20'
                        } transition-colors cursor-pointer`}
                      >
                        <div className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-primary' : 'text-foreground'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayAulas.slice(0, 3).map((aula) => (
                            <div
                              key={aula.id}
                              className="text-xs p-1 rounded border bg-primary/10 text-primary border-primary/20 truncate"
                              title={`${aula.titulo} - ${aula.turma?.nome}`}
                            >
                              {aula.titulo}
                            </div>
                          ))}
                          {dayAulas.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayAulas.length - 3} mais
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getAulasForDay(new Date().getDate()).length > 0 ? (
                getAulasForDay(new Date().getDate()).map((aula) => (
                  <div key={aula.id} className="p-3 rounded-lg border border-border">
                    <h4 className="font-medium text-foreground text-sm">{aula.titulo}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{aula.turma?.nome}</p>
                    <div className="space-y-1 mt-2">
                      {(aula.horaInicio || aula.horaFim) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(aula.horaInicio)} - {formatTime(aula.horaFim)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma aula hoje</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Aula Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
            <DialogDescription>
              Crie uma nova aula para uma turma
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateAula} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="turma">Turma *</Label>
              <Select
                value={newAula.idTurma}
                onValueChange={(value) => setNewAula({ ...newAula, idTurma: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome} {turma.codigo ? `(${turma.codigo})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={newAula.titulo}
                onChange={(e) => setNewAula({ ...newAula, titulo: e.target.value })}
                placeholder="Ex: Álgebra Linear"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo</Label>
              <Textarea
                id="conteudo"
                value={newAula.conteudo}
                onChange={(e) => setNewAula({ ...newAula, conteudo: e.target.value })}
                placeholder="Descrição do conteúdo da aula"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataAula">Data *</Label>
              <Input
                id="dataAula"
                type="date"
                value={newAula.dataAula}
                onChange={(e) => setNewAula({ ...newAula, dataAula: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora Início</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={newAula.horaInicio}
                  onChange={(e) => setNewAula({ ...newAula, horaInicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaFim">Hora Fim</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={newAula.horaFim}
                  onChange={(e) => setNewAula({ ...newAula, horaFim: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Aula'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Calendar
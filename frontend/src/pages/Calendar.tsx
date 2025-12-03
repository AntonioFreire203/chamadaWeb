import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users
} from "lucide-react"

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
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

  // Sample events
  const events = [
    {
      id: 1,
      title: "Matemática - Álgebra Linear",
      date: 5,
      time: "14:00 - 16:00",
      teacher: "Prof. Ana Silva",
      room: "Sala A-101",
      students: 28,
      type: "class"
    },
    {
      id: 2,
      title: "Física - Mecânica",
      date: 5,
      time: "16:00 - 18:00", 
      teacher: "Prof. Carlos Mendes",
      room: "Sala B-203",
      students: 32,
      type: "class"
    },
    {
      id: 3,
      title: "Reunião Pedagógica",
      date: 8,
      time: "10:00 - 12:00",
      teacher: "Coordenação",
      room: "Sala de Reuniões",
      students: 0,
      type: "meeting"
    },
    {
      id: 4,
      title: "Simulado ENEM",
      date: 12,
      time: "08:00 - 17:00",
      teacher: "Todos os professores",
      room: "Auditório Principal",
      students: 150,
      type: "exam"
    },
    {
      id: 5,
      title: "Química - Orgânica",
      date: 15,
      time: "19:00 - 21:00",
      teacher: "Prof. Maria Santos",
      room: "Lab. Química",
      students: 25,
      type: "class"
    },
    {
      id: 6,
      title: "Palestra: Preparação Psicológica",
      date: 18,
      time: "14:00 - 16:00",
      teacher: "Dr. João Psicólogo",
      room: "Auditório",
      students: 100,
      type: "event"
    }
  ]

  const getEventsForDay = (day: number) => {
    return events.filter(event => event.date === day)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-primary/10 text-primary border-primary/20"
      case "meeting":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "exam":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "event":
        return "bg-accent/10 text-accent border-accent/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const upcomingEvents = events
    .filter(event => event.date >= new Date().getDate())
    .sort((a, b) => a.date - b.date)
    .slice(0, 5)

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
        <Button className="gradient-primary">
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
              {/* Calendar Grid */}
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
                  const dayEvents = getEventsForDay(day)
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
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
              {getEventsForDay(new Date().getDate()).length > 0 ? (
                getEventsForDay(new Date().getDate()).map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border border-border">
                    <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {event.room}
                      </div>
                      {event.students > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {event.students} estudantes
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum evento hoje</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{event.date}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                    <p className="text-xs text-muted-foreground">{event.teacher}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span className="text-sm text-muted-foreground">Aulas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-secondary"></div>
                <span className="text-sm text-muted-foreground">Reuniões</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-destructive"></div>
                <span className="text-sm text-muted-foreground">Provas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent"></div>
                <span className="text-sm text-muted-foreground">Eventos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Calendar
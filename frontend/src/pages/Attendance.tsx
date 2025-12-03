import { useState } from "react"
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
  Download
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  
  // Sample classes data
  const classes = [
    { id: "mat-alg", name: "Matemática - Álgebra Linear", teacher: "Prof. Ana Silva" },
    { id: "fis-mec", name: "Física - Mecânica", teacher: "Prof. Carlos Mendes" },
    { id: "qui-org", name: "Química - Orgânica", teacher: "Prof. Maria Santos" },
    { id: "his-bra", name: "História do Brasil", teacher: "Prof. João Costa" },
    { id: "por-lit", name: "Português - Literatura", teacher: "Prof. Beatriz Lima" }
  ]

  // Sample students data with attendance state
  const [students, setStudents] = useState([
    { id: 1, name: "Ana Carolina Silva", present: true, justified: false },
    { id: 2, name: "Carlos Eduardo Santos", present: true, justified: false },
    { id: 3, name: "Marina Oliveira Costa", present: false, justified: true },
    { id: 4, name: "João Pedro Almeida", present: false, justified: false },
    { id: 5, name: "Beatriz Ferreira Lima", present: true, justified: false },
    { id: 6, name: "Lucas Silva Rodrigues", present: true, justified: false },
    { id: 7, name: "Gabriela Santos Melo", present: false, justified: false },
    { id: 8, name: "Pedro Henrique Costa", present: true, justified: false },
    { id: 9, name: "Julia Oliveira Nunes", present: true, justified: false },
    { id: 10, name: "Rafael Almeida Souza", present: false, justified: true }
  ])

  const toggleAttendance = (studentId: number) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, present: !student.present, justified: false }
        : student
    ))
  }

  const toggleJustified = (studentId: number) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId && !student.present
        ? { ...student, justified: !student.justified }
        : student
    ))
  }

  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, present: true, justified: false })))
  }

  const markAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, present: false, justified: false })))
  }

  const presentCount = students.filter(s => s.present).length
  const absentCount = students.filter(s => !s.present && !s.justified).length
  const justifiedCount = students.filter(s => s.justified).length
  const totalStudents = students.length
  const attendancePercentage = Math.round((presentCount / totalStudents) * 100)

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
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button className="gradient-accent">
            <Save className="h-4 w-4 mr-2" />
            Salvar Chamada
          </Button>
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
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div>
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-sm text-muted-foreground">{cls.teacher}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Data da Aula
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
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

                    <div className="flex items-center gap-4">
                      {/* Justified checkbox (only show if absent) */}
                      {!student.present && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`justified-${student.id}`}
                            checked={student.justified}
                            onCheckedChange={() => toggleJustified(student.id)}
                          />
                          <label 
                            htmlFor={`justified-${student.id}`}
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            Justificada
                          </label>
                        </div>
                      )}

                      {/* Status Badge */}
                      {student.present ? (
                        <Badge className="bg-accent text-accent-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Presente
                        </Badge>
                      ) : student.justified ? (
                        <Badge className="bg-secondary/20 text-secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Justificada
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Ausente
                        </Badge>
                      )}

                      {/* Attendance Toggle */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`present-${student.id}`}
                          checked={student.present}
                          onCheckedChange={() => toggleAttendance(student.id)}
                        />
                        <label 
                          htmlFor={`present-${student.id}`}
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          Presente
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedClass && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Selecione uma turma
            </h3>
            <p className="text-muted-foreground">
              Escolha uma turma e data para iniciar a chamada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Attendance
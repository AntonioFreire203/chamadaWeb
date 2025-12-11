import { NavLink, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  BarChart3,
  GraduationCap,
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  BookOpen,
  BarChart2,
  School,
  Shield,
  LogIn
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3, allowedRoles: ["ADMIN", "PROFESSOR", "COORDENADOR"] },
  { title: "Estudantes", url: "/estudantes", icon: GraduationCap, allowedRoles: ["ADMIN", "PROFESSOR", "COORDENADOR"] },
  { title: "Professores", url: "/professores", icon: Users, allowedRoles: ["ADMIN", "COORDENADOR"] },
  { title: "Usuários", url: "/usuarios", icon: Shield, allowedRoles: ["ADMIN"] },
  { title: "Turmas", url: "/turmas", icon: School, allowedRoles: ["ADMIN", "PROFESSOR", "COORDENADOR"] },
  { title: "Calendário", url: "/calendario", icon: Calendar, allowedRoles: ["ADMIN", "PROFESSOR", "COORDENADOR"] },
  { title: "Chamada", url: "/chamada", icon: ClipboardCheck, allowedRoles: ["ADMIN", "PROFESSOR", "COORDENADOR"] },
  { title: "Histórico", url: "/historico", icon: FileText, allowedRoles: ["ADMIN", "PROFESSOR", "COORDENADOR"] },
  { title: "Relatórios", url: "/relatorios", icon: BarChart2, allowedRoles: ["ADMIN", "COORDENADOR"] },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role)
      } catch (error) {
        console.error("Erro ao parsear usuário:", error)
      }
    }
  }, [])

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth w-full"
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground shadow-card`
    }
    return `${baseClasses} text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`
  }

  return (
    <Sidebar
      className="border-r border-sidebar-border transition-smooth"
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Cursinho UTFPR
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                Sistema de Gestão
              </span>
            </div>
          )}
        </div>

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={`text-xs font-medium text-sidebar-foreground/70 mb-2 ${isCollapsed ? 'sr-only' : ''}`}>
            Menu Principal
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems
                .filter(item => !userRole || item.allowedRoles.includes(userRole))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavClasses(item.url)}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className={`truncate ${isCollapsed ? 'sr-only' : ''}`}>
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
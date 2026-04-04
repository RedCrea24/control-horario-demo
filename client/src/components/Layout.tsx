import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  Settings, 
  FileBarChart,
  SlidersHorizontal,
  Menu,
  ShieldCheck,
  Info,
  CreditCard,
  CheckSquare
} from "lucide-react";
import { useActiveCompany, useCurrentUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children, basePath = "" }: { children: React.ReactNode; basePath?: string }) {
  const [location] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { activeCompany, setActiveCompanyId, companies } = useActiveCompany();
  const { currentUser, setCurrentUserId, employees } = useCurrentUser();

  const withBasePath = (path: string) => `${basePath}${path}`;

  const isAdmin = currentUser?.systemRole === 'admin';
  const isSupervisor = currentUser?.systemRole === 'supervisor' || isAdmin;

  const navItems = [
    { href: withBasePath("/"), label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: withBasePath("/fichajes"), label: "Fichajes", icon: Clock, show: true },
    { href: withBasePath("/vacaciones"), label: "Ausencias", icon: CalendarDays, show: true },
    { href: withBasePath("/empleados"), label: "Empleados", icon: Users, show: isSupervisor },
    { href: withBasePath("/informes"), label: "Informes", icon: FileBarChart, show: isSupervisor },
    { href: withBasePath("/configuracion"), label: "Empresa", icon: Settings, show: isAdmin },
    { href: withBasePath("/pasos"), label: "Cómo Comprar", icon: CheckSquare, show: true },
    { href: withBasePath("/precios"), label: "Precios", icon: CreditCard, show: true },
    { href: withBasePath("/mas-info"), label: "Más Info", icon: Info, show: true },
  ].filter(item => item.show);

  const NavLinks = () => (
    <div className="flex flex-col space-y-1 mt-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <div key={item.href} onClick={() => setSheetOpen(false)}>
            <Link href={item.href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          </div>
        );
      })}
      
      {isAdmin && (
        <div className="pt-4 mt-4 border-t" onClick={() => setSheetOpen(false)}>
          <Link href={withBasePath("/control-pro")}>
            <div
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                location === withBasePath("/control-pro")
                  ? "bg-primary/10 text-primary font-medium border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 shrink-0" />
              <span>Control Horario de Empresas Pro</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r shadow-sm">
        <div className="p-4 border-b flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-lg leading-tight">
            <Clock className="w-6 h-6 shrink-0" />
            <span>Control Horario de Empresas Pro</span>
          </div>
          
          {isAdmin ? (
            <Select value={activeCompany?.id} onValueChange={setActiveCompanyId}>
              <SelectTrigger className="w-full bg-secondary/50 border-none">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="w-6 h-6 rounded-md">
                    <AvatarImage src={activeCompany?.logo} />
                    <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs">
                      {activeCompany?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{activeCompany?.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {companies?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden px-3 py-2 bg-secondary/50 rounded-md">
              <Avatar className="w-6 h-6 rounded-md">
                <AvatarImage src={activeCompany?.logo} />
                <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs">
                  {activeCompany?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-medium text-sm">{activeCompany?.name}</span>
            </div>
          )}
        </div>
        <div className="flex-1 px-3 py-2 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3" />
              Simular Sesión
            </div>
            <Select value={currentUser?.id} onValueChange={setCurrentUserId}>
              <SelectTrigger className="w-full h-auto py-2">
                <div className="flex items-center gap-3 text-left w-full overflow-hidden">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{currentUser?.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase truncate">
                      {currentUser?.systemRole === 'admin' ? 'Administrador' : 
                       currentUser?.systemRole === 'supervisor' ? 'Supervisor' : 'Empleado'}
                    </span>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {employees?.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.systemRole})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Clock className="w-5 h-5" />
            <span className="truncate">Control Horario de Empresas Pro</span>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="allow-demo-click">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 allow-demo-click">
              <div className="p-4 border-b flex flex-col gap-4">
                <div className="flex items-center gap-2 text-primary font-bold text-lg leading-tight">
                  <Clock className="w-6 h-6 shrink-0" />
                  <span>Control Horario de Empresas Pro</span>
                </div>
              </div>
              <div className="px-3">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

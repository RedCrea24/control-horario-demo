import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  Settings, 
  FileBarChart,
  SlidersHorizontal,
  Menu
} from "lucide-react";
import { useActiveCompany } from "@/lib/store";
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

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fichajes", label: "Fichajes", icon: Clock },
  { href: "/empleados", label: "Empleados", icon: Users },
  { href: "/vacaciones", label: "Ausencias", icon: CalendarDays },
  { href: "/informes", label: "Informes", icon: FileBarChart },
  { href: "/configuracion", label: "Empresa", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { activeCompany, setActiveCompanyId, companies } = useActiveCompany();

  const NavLinks = () => (
    <div className="flex flex-col space-y-1 mt-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
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
        );
      })}
      
      <div className="pt-4 mt-4 border-t">
        <Link href="/control-pro">
          <div
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
              location === "/control-pro"
                ? "bg-primary/10 text-primary font-medium border border-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Control Pro</span>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r shadow-sm">
        <div className="p-4 border-b flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Clock className="w-6 h-6" />
            <span>ControlPro</span>
          </div>
          
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
        </div>
        <div className="flex-1 px-3 py-2 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">Admin Usuario</span>
              <span className="text-xs text-muted-foreground truncate">admin@empresa.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Clock className="w-5 h-5" />
            <span>ControlPro</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4 border-b flex flex-col gap-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xl">
                  <Clock className="w-6 h-6" />
                  <span>ControlPro</span>
                </div>
                <Select value={activeCompany?.id} onValueChange={setActiveCompanyId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

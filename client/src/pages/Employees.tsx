import { useState } from "react";
import { useActiveCompany, useStore, Employee, Schedule, useCurrentUser, TimeEntry, Vacation } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, UserCog, Mail, Trash2, UserX, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const { currentUser } = useCurrentUser();
  const { activeCompany } = useActiveCompany();
  const [employees, setEmployees] = useStore<Employee[]>('employees');
  const [schedules] = useStore<Schedule[]>('schedules');
  const [entries, setEntries] = useStore<TimeEntry[]>('entries');
  const [vacations, setVacations] = useStore<Vacation[]>('vacations');
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeToManage, setEmployeeToManage] = useState<Employee | null>(null);

  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  
  const filteredEmployees = companyEmployees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.role.toLowerCase().includes(search.toLowerCase())
  );

  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: '', email: '', role: '', department: '', active: true, joinDate: new Date().toISOString().split('T')[0], systemRole: 'employee', weeklyHours: 40
  });

  const isSupervisor = currentUser?.systemRole === 'admin' || currentUser?.systemRole === 'supervisor';

  const handleAdd = () => {
    if (!activeCompany) return;
    const emp: Employee = {
      id: 'e' + Date.now(),
      companyId: activeCompany.id,
      name: newEmp.name || 'Sin nombre',
      email: newEmp.email || '',
      role: newEmp.role || '',
      department: newEmp.department || '',
      systemRole: newEmp.systemRole as any || 'employee',
      weeklyHours: newEmp.weeklyHours || 40,
      scheduleId: schedules?.filter(s => s.companyId === activeCompany.id)[0]?.id || '',
      joinDate: newEmp.joinDate || '',
      active: true,
    };
    setEmployees([...(employees || []), emp]);
    setIsDialogOpen(false);
    setNewEmp({name: '', email: '', role: '', department: '', active: true, joinDate: new Date().toISOString().split('T')[0], systemRole: 'employee', weeklyHours: 40});
    toast({ title: "Empleado añadido", description: "El empleado ha sido registrado correctamente." });
  };

  const handleDeactivate = (id: string) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, active: false } : e));
    toast({ title: "Empleado desactivado", description: "El empleado ya no tiene acceso, pero su historial se conserva." });
  };

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    setEntries(entries.filter(e => e.employeeId !== id));
    setVacations(vacations.filter(v => v.employeeId !== id));
    toast({ title: "Empleado eliminado", description: "Se han borrado permanentemente todos sus datos asociados.", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-muted-foreground mt-1">Directorio y gestión del personal</p>
        </div>

        {isSupervisor && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Empleado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} placeholder="Ej. Ana García" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} placeholder="ana@empresa.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Input value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} placeholder="Marketing" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} placeholder="Especialista SEO" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Jornada Semanal (Horas)</Label>
                  <Select value={newEmp.weeklyHours?.toString() || '40'} onValueChange={(val) => setNewEmp({...newEmp, weeklyHours: parseInt(val)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="40">Jornada Completa (40h)</SelectItem>
                      <SelectItem value="35">Jornada Reducida (35h)</SelectItem>
                      <SelectItem value="30">Jornada Parcial (30h)</SelectItem>
                      <SelectItem value="20">Media Jornada (20h)</SelectItem>
                      <SelectItem value="15">Jornada Parcial (15h)</SelectItem>
                      <SelectItem value="10">Jornada Parcial (10h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Incorporación</Label>
                  <Input type="date" value={newEmp.joinDate} onChange={e => setNewEmp({...newEmp, joinDate: e.target.value})} />
                </div>
                <Button onClick={handleAdd} className="w-full mt-4">Guardar Empleado</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar empleado por nombre, cargo o departamento..." 
              className="pl-10 max-w-md"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rol</TableHead>
                {isSupervisor && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map(emp => (
                  <TableRow key={emp.id} className="hover:bg-secondary/10">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{emp.name}</div>
                          <div className="text-xs text-muted-foreground">{emp.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {emp.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{emp.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.active ? "default" : "secondary"} className={emp.active ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200" : ""}>
                        {emp.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs text-muted-foreground uppercase">{emp.systemRole}</span>
                    </TableCell>
                    {isSupervisor && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEmployeeToManage(emp)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!employeeToManage} onOpenChange={(open) => !open && setEmployeeToManage(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Gestionar Empleado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-secondary/30 rounded text-center mb-2 font-medium">
              {employeeToManage?.name}
            </div>
            <p className="text-sm text-muted-foreground">
              Elige cómo deseas proceder con este empleado. Puedes desactivarlo para bloquear su acceso manteniendo su histórico legal, o eliminarlo completamente.
            </p>
            
            <div className="flex flex-col gap-4 mt-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 flex flex-col items-start gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => {
                  if (employeeToManage) {
                    handleDeactivate(employeeToManage.id);
                    setEmployeeToManage(null);
                  }
                }}
              >
                <div className="flex items-center gap-2 font-bold text-primary">
                  <UserX className="w-4 h-4" /> Desactivación Segura
                </div>
                <div className="text-xs text-muted-foreground text-left whitespace-normal font-normal">
                  El empleado no podrá acceder ni fichar, pero se conservará todo su historial de jornadas y ausencias para auditorías legales. Recomendado.
                </div>
              </Button>
              
              <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold text-destructive">
                  <AlertTriangle className="w-5 h-5" /> Eliminación Total (Irreversible)
                </div>
                <div className="text-xs text-destructive/80 text-left whitespace-normal">
                  Se borrará permanentemente el empleado y <strong>TODOS sus datos asociados</strong> (fichajes, firmas, ausencias, historial de auditoría). Esta acción no se puede deshacer.
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full mt-2 font-medium"
                  onClick={() => {
                    if (employeeToManage && confirm(`⚠️ ATENCIÓN: Estás a punto de eliminar a ${employeeToManage.name} y todos sus registros de forma definitiva.\n\n¿Estás ABSOLUTAMENTE SEGURO? Esta acción no se puede deshacer.`)) {
                      handleDelete(employeeToManage.id);
                      setEmployeeToManage(null);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar Permanentemente
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

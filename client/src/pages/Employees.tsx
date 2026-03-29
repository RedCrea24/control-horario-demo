import { useState } from "react";
import { useActiveCompany, useStore, Employee, Schedule } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, UserCog, Mail } from "lucide-react";
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

export default function Employees() {
  const { activeCompany } = useActiveCompany();
  const [employees, setEmployees] = useStore<Employee[]>('employees');
  const [schedules] = useStore<Schedule[]>('schedules');
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  
  const filteredEmployees = companyEmployees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.role.toLowerCase().includes(search.toLowerCase())
  );

  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: '', email: '', role: '', department: '', active: true, joinDate: new Date().toISOString().split('T')[0]
  });

  const handleAdd = () => {
    if (!activeCompany) return;
    const emp: Employee = {
      id: 'e' + Date.now(),
      companyId: activeCompany.id,
      name: newEmp.name || 'Sin nombre',
      email: newEmp.email || '',
      role: newEmp.role || '',
      department: newEmp.department || '',
      scheduleId: schedules?.filter(s => s.companyId === activeCompany.id)[0]?.id || '',
      joinDate: newEmp.joinDate || '',
      active: true,
    };
    setEmployees([...(employees || []), emp]);
    setIsDialogOpen(false);
    setNewEmp({name: '', email: '', role: '', department: '', active: true, joinDate: new Date().toISOString().split('T')[0]});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-muted-foreground mt-1">Directorio y gestión del personal</p>
        </div>

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
                <Label>Fecha de Incorporación</Label>
                <Input type="date" value={newEmp.joinDate} onChange={e => setNewEmp({...newEmp, joinDate: e.target.value})} />
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Guardar Empleado</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <UserCog className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

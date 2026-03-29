import { useState } from "react";
import { useStore, Employee, TimeEntry, Vacation, Company } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Save, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function ControlPro() {
  const [employees, setEmployees] = useStore<Employee[]>('employees');
  const [entries, setEntries] = useStore<TimeEntry[]>('entries');
  const [vacations, setVacations] = useStore<Vacation[]>('vacations');
  const [companies] = useStore<Company[]>('companies');
  
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  // Edit states
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [editVacation, setEditVacation] = useState<Vacation | null>(null);

  // Search filtering
  const filteredEmployees = employees?.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())) || [];
  const filteredEntries = entries?.filter(e => {
    const emp = employees?.find(emp => emp.id === e.employeeId);
    return emp?.name.toLowerCase().includes(search.toLowerCase()) || e.date.includes(search);
  }) || [];
  const filteredVacations = vacations?.filter(v => {
    const emp = employees?.find(emp => emp.id === v.employeeId);
    return emp?.name.toLowerCase().includes(search.toLowerCase()) || v.startDate.includes(search);
  }) || [];

  // Delete handlers
  const deleteEmployee = (id: string) => {
    if(confirm('¿Seguro que deseas eliminar este empleado y todos sus registros asociados?')) {
      setEmployees(employees.filter(e => e.id !== id));
      setEntries(entries.filter(e => e.employeeId !== id));
      setVacations(vacations.filter(v => v.employeeId !== id));
      toast({ title: "Empleado eliminado", variant: "destructive" });
    }
  };

  const deleteEntry = (id: string) => {
    if(confirm('¿Seguro que deseas eliminar este fichaje?')) {
      setEntries(entries.filter(e => e.id !== id));
      toast({ title: "Fichaje eliminado", variant: "destructive" });
    }
  };

  const deleteVacation = (id: string) => {
    if(confirm('¿Seguro que deseas eliminar esta ausencia?')) {
      setVacations(vacations.filter(v => v.id !== id));
      toast({ title: "Ausencia eliminada", variant: "destructive" });
    }
  };

  // Save handlers
  const saveEmployee = () => {
    if(editEmployee) {
      setEmployees(employees.map(e => e.id === editEmployee.id ? editEmployee : e));
      setEditEmployee(null);
      toast({ title: "Empleado actualizado" });
    }
  };

  const saveEntry = () => {
    if(editEntry) {
      setEntries(entries.map(e => e.id === editEntry.id ? editEntry : e));
      setEditEntry(null);
      toast({ title: "Fichaje actualizado" });
    }
  };

  const saveVacation = () => {
    if(editVacation) {
      setVacations(vacations.map(v => v.id === editVacation.id ? editVacation : v));
      setEditVacation(null);
      toast({ title: "Ausencia actualizada" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldAlert className="w-8 h-8" />
            Control Pro
          </h1>
          <p className="text-muted-foreground mt-1">Gestión avanzada, corrección de errores y administración de base de datos</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar en todos los módulos..." 
            className="pl-10 w-full md:w-80 bg-background"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="empleados" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-card border shadow-sm h-12">
          <TabsTrigger value="empleados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Empleados</TabsTrigger>
          <TabsTrigger value="fichajes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Fichajes</TabsTrigger>
          <TabsTrigger value="ausencias" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Ausencias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="empleados">
          <Card>
            <CardHeader>
              <CardTitle>Gestor de Empleados</CardTitle>
              <CardDescription>Edición directa de perfiles, estados y departamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre / Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo / Dept.</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </TableCell>
                      <TableCell>{companies?.find(c => c.id === emp.companyId)?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{emp.role}</div>
                        <div className="text-xs text-muted-foreground">{emp.department}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.active ? "default" : "secondary"}>{emp.active ? 'Activo' : 'Inactivo'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditEmployee(emp)}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteEmployee(emp.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fichajes">
          <Card>
            <CardHeader>
              <CardTitle>Corrector de Fichajes</CardTitle>
              <CardDescription>Ajuste manual de horas de entrada y salida, detección de fichajes abiertos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                    <TableRow key={entry.id} className={!entry.clockOut ? "bg-orange-50/50" : ""}>
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell>{employees?.find(e => e.id === entry.employeeId)?.name}</TableCell>
                      <TableCell>{entry.clockIn}</TableCell>
                      <TableCell>
                        {entry.clockOut || <Badge variant="destructive" className="text-[10px]">Sin cerrar</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditEntry(entry)}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ausencias">
          <Card>
            <CardHeader>
              <CardTitle>Modificación de Ausencias</CardTitle>
              <CardDescription>Forzar estados, cambiar fechas y tipos de permiso</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVacations.map(vac => (
                    <TableRow key={vac.id}>
                      <TableCell className="font-medium">{employees?.find(e => e.id === vac.employeeId)?.name}</TableCell>
                      <TableCell>{vac.type}</TableCell>
                      <TableCell>{vac.startDate}</TableCell>
                      <TableCell>{vac.endDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{vac.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditVacation(vac)}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteVacation(vac.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editEmployee} onOpenChange={(open) => !open && setEditEmployee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Empleado</DialogTitle></DialogHeader>
          {editEmployee && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={editEmployee.name} onChange={e => setEditEmployee({...editEmployee, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={editEmployee.email} onChange={e => setEditEmployee({...editEmployee, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Departamento</Label><Input value={editEmployee.department} onChange={e => setEditEmployee({...editEmployee, department: e.target.value})} /></div>
              <div className="space-y-2"><Label>Cargo</Label><Input value={editEmployee.role} onChange={e => setEditEmployee({...editEmployee, role: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={editEmployee.companyId} onValueChange={v => setEditEmployee({...editEmployee, companyId: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companies?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de Alta</Label>
                <Input type="date" value={editEmployee.joinDate} onChange={e => setEditEmployee({...editEmployee, joinDate: e.target.value})} />
              </div>
              <div className="col-span-2 flex items-center justify-between p-4 border rounded-lg bg-secondary/20 mt-2">
                <div>
                  <div className="font-medium">Estado del empleado</div>
                  <div className="text-xs text-muted-foreground">Desactivar impedirá que el usuario fiche o acceda al sistema.</div>
                </div>
                <Switch checked={editEmployee.active} onCheckedChange={v => setEditEmployee({...editEmployee, active: v})} />
              </div>
              <Button onClick={saveEmployee} className="col-span-2 mt-4"><Save className="w-4 h-4 mr-2"/> Guardar Cambios</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Corrección de Fichaje</DialogTitle></DialogHeader>
          {editEntry && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-secondary/30 rounded text-sm text-center mb-2 font-medium">
                {employees?.find(e => e.id === editEntry.employeeId)?.name}
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={editEntry.date} onChange={e => setEditEntry({...editEntry, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Hora Entrada</Label><Input type="time" value={editEntry.clockIn} onChange={e => setEditEntry({...editEntry, clockIn: e.target.value})} /></div>
                <div className="space-y-2"><Label>Hora Salida</Label><Input type="time" value={editEntry.clockOut || ''} onChange={e => setEditEntry({...editEntry, clockOut: e.target.value})} /></div>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Jornada</Label>
                <Select value={editEntry.type} onValueChange={(v: any) => setEditEntry({...editEntry, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Ordinaria</SelectItem>
                    <SelectItem value="extra">Extra / Complementaria</SelectItem>
                    <SelectItem value="absence">Falta Injustificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Observaciones de corrección</Label><Input value={editEntry.notes || ''} onChange={e => setEditEntry({...editEntry, notes: e.target.value})} placeholder="Motivo de la corrección manual..." /></div>
              <Button onClick={saveEntry} className="w-full mt-4"><Save className="w-4 h-4 mr-2"/> Actualizar Registro</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Vacation Dialog */}
      <Dialog open={!!editVacation} onOpenChange={(open) => !open && setEditVacation(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Ausencia / Permiso</DialogTitle></DialogHeader>
          {editVacation && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-secondary/30 rounded text-sm text-center mb-2 font-medium">
                {employees?.find(e => e.id === editVacation.employeeId)?.name}
              </div>
              <div className="space-y-2">
                <Label>Estado de Aprobación</Label>
                <Select value={editVacation.status} onValueChange={(v: any) => setEditVacation({...editVacation, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Inicio</Label><Input type="date" value={editVacation.startDate} onChange={e => setEditVacation({...editVacation, startDate: e.target.value})} /></div>
                <div className="space-y-2"><Label>Fin</Label><Input type="date" value={editVacation.endDate} onChange={e => setEditVacation({...editVacation, endDate: e.target.value})} /></div>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Permiso</Label>
                <Select value={editVacation.type} onValueChange={(v: any) => setEditVacation({...editVacation, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacaciones</SelectItem>
                    <SelectItem value="sick">Baja Médica</SelectItem>
                    <SelectItem value="personal">Asuntos Propios / Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Notas Internas</Label><Input value={editVacation.notes || ''} onChange={e => setEditVacation({...editVacation, notes: e.target.value})} /></div>
              <Button onClick={saveVacation} className="w-full mt-4"><Save className="w-4 h-4 mr-2"/> Guardar Ausencia</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

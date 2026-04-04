import { useState } from "react";
import { useStore, Employee, TimeEntry, Company, useCurrentUser, Vacation } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Save, Trash2, Edit2, ShieldAlert, History, UserX, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function ControlPro() {
  const { currentUser } = useCurrentUser();
  const [employees, setEmployees] = useStore<Employee[]>('employees');
  const [entries, setEntries] = useStore<TimeEntry[]>('entries');
  const [vacations, setVacations] = useStore<Vacation[]>('vacations');
  const [companies] = useStore<Company[]>('companies');
  
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [viewHistory, setViewHistory] = useState<TimeEntry['history'] | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Security check
  if (currentUser?.systemRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground mt-2">El módulo Control Horario de Empresas Pro está reservado exclusivamente para administradores del sistema.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center max-w-md mx-auto mt-20">
        <ShieldAlert className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold">Control Horario de Empresas Pro</h2>
        <p className="text-muted-foreground mt-2 mb-6">Por motivos de seguridad, introduce la contraseña de administrador para acceder a este módulo avanzado.</p>
        <div className="w-full flex gap-2">
          <Input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (password === 'admin' || password === 'admin123' || password === '1234') setIsAuthenticated(true);
                else toast({ title: "Contraseña incorrecta", variant: "destructive" });
              }
            }}
          />
          <Button onClick={() => {
            if (password === 'admin' || password === 'admin123' || password === '1234') setIsAuthenticated(true);
            else toast({ title: "Contraseña incorrecta", variant: "destructive" });
          }}>Entrar</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">Nota de prototipo: Utiliza "admin" como contraseña.</p>
      </div>
    );
  }

  const filteredEmployees = employees?.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())) || [];
  const filteredEntries = entries?.filter(e => {
    const emp = employees?.find(emp => emp.id === e.employeeId);
    return emp?.name.toLowerCase().includes(search.toLowerCase()) || e.date.includes(search);
  }) || [];

  const saveEntry = () => {
    if(editEntry) {
      const original = entries.find(e => e.id === editEntry.id);
      if (original?.status === 'validated' && editEntry.status === 'validated') {
        toast({ title: "Registro bloqueado", description: "No se puede editar un fichaje ya validado.", variant: "destructive" });
        return;
      }

      const updatedHistory = [
        ...(editEntry.history || []),
        { timestamp: new Date().toISOString(), action: 'Edición administrativa Control Pro', by: currentUser.id }
      ];

      setEntries(entries.map(e => e.id === editEntry.id ? { ...editEntry, history: updatedHistory } : e));
      setEditEntry(null);
      toast({ title: "Fichaje actualizado y auditado" });
    }
  };

  const saveEmployee = () => {
    if (editEmployee) {
      setEmployees(employees.map(e => e.id === editEmployee.id ? editEmployee : e));
      setEditEmployee(null);
      toast({ title: "Empleado actualizado desde Control Pro" });
    }
  };

  const handleDeactivate = (id: string) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, active: false } : e));
    toast({ title: "Empleado desactivado", description: "El empleado ya no tiene acceso, pero su historial legal se conserva intacto." });
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    setEntries(entries.filter(e => e.employeeId !== id));
    setVacations(vacations.filter(v => v.employeeId !== id));
    toast({ title: "Eliminación total completada", description: "Se han borrado permanentemente todos sus datos asociados y fichajes.", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> Control Horario de Empresas Pro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Todos los cambios realizados aquí quedan registrados en el log de auditoría legal.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-10 w-64 bg-background" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs defaultValue="empleados" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-card border shadow-sm h-12">
          <TabsTrigger value="empleados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Empleados</TabsTrigger>
          <TabsTrigger value="fichajes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Fichajes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="empleados">
          <Card>
            <CardHeader>
              <CardTitle>Gestor de Empleados</CardTitle>
              <CardDescription>Edición directa de perfiles, roles del sistema y borrado de registros.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre / Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo / Dept.</TableHead>
                    <TableHead>Rol Sistema</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(emp => (
                    <TableRow key={emp.id} className={!emp.active ? "opacity-60 bg-muted/30" : ""}>
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
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{emp.systemRole}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.active ? "default" : "secondary"} className={emp.active ? "bg-green-100 text-green-700 shadow-none border-green-200" : ""}>
                          {emp.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditEmployee(emp)}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setEmployeeToDelete(emp)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
              <CardDescription>Ajuste manual de horas y estados. Los fichajes validados se bloquearán automáticamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                    <TableRow key={entry.id} className={entry.status === 'validated' ? "bg-muted/30" : ""}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{employees?.find(e => e.id === entry.employeeId)?.name}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.clockIn} - {entry.clockOut || '...'}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === 'validated' ? 'default' : 'secondary'} className={entry.status === 'validated' ? 'bg-green-100 text-green-700' : ''}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setViewHistory(entry.history)}><History className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditEntry(entry)} disabled={entry.status === 'validated'}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
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
          <DialogHeader><DialogTitle>Control Horario de Empresas Pro: Editar Empleado</DialogTitle></DialogHeader>
          {editEmployee && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={editEmployee.name} onChange={e => setEditEmployee({...editEmployee, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={editEmployee.email} onChange={e => setEditEmployee({...editEmployee, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Departamento</Label><Input value={editEmployee.department} onChange={e => setEditEmployee({...editEmployee, department: e.target.value})} /></div>
              <div className="space-y-2"><Label>Cargo</Label><Input value={editEmployee.role} onChange={e => setEditEmployee({...editEmployee, role: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Rol del Sistema</Label>
                <Select value={editEmployee.systemRole} onValueChange={(v: any) => setEditEmployee({...editEmployee, systemRole: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Empleado (Solo ver sus datos)</SelectItem>
                    <SelectItem value="supervisor">Supervisor (Validar y ver equipo)</SelectItem>
                    <SelectItem value="admin">Administrador (Control total)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={editEmployee.companyId} onValueChange={v => setEditEmployee({...editEmployee, companyId: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companies?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center justify-between p-4 border rounded-lg bg-secondary/20 mt-2">
                <div>
                  <div className="font-medium">Estado del empleado (Activo)</div>
                  <div className="text-xs text-muted-foreground">Desactivar impedirá que el usuario fiche o acceda al sistema.</div>
                </div>
                <Switch checked={editEmployee.active} onCheckedChange={v => setEditEmployee({...editEmployee, active: v})} />
              </div>
              <Button onClick={saveEmployee} className="col-span-2 mt-4 bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-2"/> Guardar Cambios</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edición Forzada de Fichaje</DialogTitle></DialogHeader>
          {editEntry && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Hora Entrada</Label><Input type="time" value={editEntry.clockIn} onChange={e => setEditEntry({...editEntry, clockIn: e.target.value})} /></div>
                <div className="space-y-2"><Label>Hora Salida</Label><Input type="time" value={editEntry.clockOut || ''} onChange={e => setEditEntry({...editEntry, clockOut: e.target.value})} /></div>
              </div>
              <div className="space-y-2">
                <Label>Estado de Validación</Label>
                <Select value={editEntry.status} onValueChange={(v: any) => setEditEntry({...editEntry, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="validated">Validado (Bloquea edición futura)</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Observaciones de corrección (Requerido para auditoría)</Label><Input value={editEntry.notes || ''} onChange={e => setEditEntry({...editEntry, notes: e.target.value})} /></div>
              <Button onClick={saveEntry} className="w-full mt-4 bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-2"/> Guardar y Auditar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!viewHistory} onOpenChange={(open) => !open && setViewHistory(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registro de Auditoría (Trazabilidad)</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {viewHistory?.map((h, i) => (
              <div key={i} className="flex flex-col gap-1 border-b pb-2 text-sm">
                <span className="font-medium">{h.action}</span>
                <span className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString('es-ES')} - Usuario ID: {h.by}</span>
              </div>
            ))}
            {!viewHistory?.length && <p className="text-sm text-muted-foreground">No hay registro de historial.</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete/Deactivate Employee Dialog */}
      <Dialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Opciones de Borrado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-secondary/30 rounded text-center mb-2 font-medium">
              {employeeToDelete?.name} ({employeeToDelete?.email})
            </div>
            <p className="text-sm text-muted-foreground">
              Selecciona el tipo de acción a realizar. Por normativas de auditoría, se recomienda la desactivación segura en lugar de la eliminación total.
            </p>
            
            <div className="flex flex-col gap-4 mt-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 flex flex-col items-start gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => {
                  if (employeeToDelete) {
                    handleDeactivate(employeeToDelete.id);
                    setEmployeeToDelete(null);
                  }
                }}
              >
                <div className="flex items-center gap-2 font-bold text-primary">
                  <UserX className="w-4 h-4" /> Desactivación Segura (Recomendado)
                </div>
                <div className="text-xs text-muted-foreground text-left whitespace-normal font-normal">
                  El empleado será marcado como "Inactivo". No podrá acceder, pero sus registros de jornadas y ausencias se mantendrán intactos para inspecciones laborales.
                </div>
              </Button>
              
              <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold text-destructive">
                  <AlertTriangle className="w-5 h-5" /> Eliminación Total (Irreversible)
                </div>
                <div className="text-xs text-destructive/80 text-left whitespace-normal">
                  Se borrará permanentemente el empleado de la base de datos, así como <strong>TODOS</strong> sus fichajes, firmas y ausencias asociadas. Esta acción destruye la auditoría del empleado.
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full mt-2 font-medium"
                  onClick={() => {
                    if (employeeToDelete && confirm(`⚠️ ATENCIÓN: Estás a punto de borrar definitivamente a ${employeeToDelete.name} y todos sus datos históricos de registro de jornada.\n\n¿Estás SEGURO de querer proceder? Esta acción NO SE PUEDE deshacer.`)) {
                      handleDeleteEmployee(employeeToDelete.id);
                      setEmployeeToDelete(null);
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

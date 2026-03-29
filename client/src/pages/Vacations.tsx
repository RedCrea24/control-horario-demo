import { useState } from "react";
import { useActiveCompany, useStore, Employee, Vacation } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Vacations() {
  const { activeCompany } = useActiveCompany();
  const [employees] = useStore<Employee[]>('employees');
  const [vacations, setVacations] = useStore<Vacation[]>('vacations');
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVacation, setNewVacation] = useState<Partial<Vacation>>({
    type: 'vacation',
    status: 'pending',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  const companyVacations = vacations?.filter(v => companyEmployees.some(e => e.id === v.employeeId)) || [];

  const handleAdd = () => {
    if (!newVacation.employeeId || !newVacation.startDate || !newVacation.endDate) {
      toast({ title: "Error", description: "Completa todos los campos obligatorios", variant: "destructive" });
      return;
    }

    const vac: Vacation = {
      id: 'v' + Date.now(),
      employeeId: newVacation.employeeId,
      startDate: newVacation.startDate,
      endDate: newVacation.endDate,
      type: newVacation.type as any,
      status: 'pending',
      notes: newVacation.notes
    };
    
    setVacations([vac, ...(vacations || [])]);
    setIsDialogOpen(false);
    toast({ title: "Solicitud registrada", description: "La ausencia ha sido enviada para aprobación" });
  };

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = vacations.map(v => v.id === id ? { ...v, status } : v);
    setVacations(updated);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">Aprobado</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">Rechazado</Badge>;
      default: return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 shadow-none">Pendiente</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'vacation': return 'Vacaciones';
      case 'sick': return 'Baja Médica';
      case 'personal': return 'Asuntos Propios';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ausencias y Vacaciones</h1>
          <p className="text-muted-foreground mt-1">Gestión de permisos y calendario laboral</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Ausencia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Empleado</Label>
                <Select onValueChange={(val) => setNewVacation({...newVacation, employeeId: val})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                  <SelectContent>
                    {companyEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Permiso</Label>
                <Select value={newVacation.type} onValueChange={(val) => setNewVacation({...newVacation, type: val as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacaciones</SelectItem>
                    <SelectItem value="sick">Baja Médica</SelectItem>
                    <SelectItem value="personal">Asuntos Propios / Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Input type="date" value={newVacation.startDate} onChange={e => setNewVacation({...newVacation, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <Input type="date" value={newVacation.endDate} onChange={e => setNewVacation({...newVacation, endDate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observaciones (Opcional)</Label>
                <Input value={newVacation.notes || ''} onChange={e => setNewVacation({...newVacation, notes: e.target.value})} />
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Guardar Solicitud</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="w-5 h-5 text-primary" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Pendientes de revisión</span>
              <span className="font-bold text-orange-600">{companyVacations.filter(v => v.status === 'pending').length}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Aprobadas (este año)</span>
              <span className="font-bold text-green-600">{companyVacations.filter(v => v.status === 'approved').length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Historial de Solicitudes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyVacations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No hay solicitudes registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  companyVacations.map((vac) => {
                    const emp = companyEmployees.find(e => e.id === vac.employeeId);
                    return (
                      <TableRow key={vac.id}>
                        <TableCell className="font-medium">{emp?.name}</TableCell>
                        <TableCell>{getTypeLabel(vac.type)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(vac.startDate).toLocaleDateString('es-ES')} - {new Date(vac.endDate).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>{getStatusBadge(vac.status)}</TableCell>
                        <TableCell className="text-right">
                          {vac.status === 'pending' && (
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => updateStatus(vac.id, 'approved')}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => updateStatus(vac.id, 'rejected')}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useActiveCompany, useStore, Company, Schedule } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Upload, Save, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { activeCompany, setActiveCompanyId } = useActiveCompany();
  const [companies, setCompanies] = useStore<Company[]>('companies');
  const [schedules, setSchedules] = useStore<Schedule[]>('schedules');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Company>>(activeCompany || {});
  
  const defaultSchedule: Schedule = {
    id: 's' + Date.now(),
    name: 'Horario Base',
    companyId: activeCompany?.id || '',
    monday: '09:00-14:00,15:00-18:00',
    tuesday: '09:00-14:00,15:00-18:00',
    wednesday: '09:00-14:00,15:00-18:00',
    thursday: '09:00-14:00,15:00-18:00',
    friday: '08:00-15:00',
    saturday: '',
    sunday: ''
  };

  const [scheduleData, setScheduleData] = useState<Schedule>(defaultSchedule);

  useEffect(() => {
    if (activeCompany) {
      setFormData(activeCompany);
      const compSchedule = schedules?.find(s => s.companyId === activeCompany.id);
      if (compSchedule) {
        setScheduleData(compSchedule);
      } else {
        setScheduleData({ ...defaultSchedule, companyId: activeCompany.id });
      }
    }
  }, [activeCompany, schedules]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScheduleChange = (day: keyof Schedule, value: string) => {
    setScheduleData(prev => ({ ...prev, [day]: value }));
  };

  const handleSave = () => {
    if (!activeCompany) return;
    
    const updatedCompanies = companies.map(c => 
      c.id === activeCompany.id ? { ...c, ...formData } as Company : c
    );
    setCompanies(updatedCompanies);

    const scheduleExists = schedules.some(s => s.companyId === activeCompany.id);
    if (scheduleExists) {
      setSchedules(schedules.map(s => s.companyId === activeCompany.id ? scheduleData : s));
    } else {
      setSchedules([...schedules, scheduleData]);
    }

    toast({
      title: "Cambios guardados",
      description: "Los datos y horarios de la empresa se han actualizado correctamente.",
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewCompany = () => {
    const newId = 'c' + Date.now();
    const newCompany: Company = {
      id: newId,
      name: 'Nueva Empresa',
      nif: '',
      address: '',
      workingHoursPerWeek: 40,
    };
    setCompanies([...companies, newCompany]);
    setActiveCompanyId(newId);
    setFormData(newCompany);
    toast({
      title: "Empresa creada",
      description: "Se ha creado una nueva empresa y la hemos seleccionado.",
    });
  };

  if (!activeCompany) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-1">Gestiona los datos y preferencias de la empresa</p>
        </div>
        <Button onClick={handleNewCompany} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Empresa</CardTitle>
            <CardDescription>Información fiscal y de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center sm:flex-row gap-6 mb-6">
              <Avatar className="w-24 h-24 border-2 border-border">
                <AvatarImage src={formData.logo} className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {formData.name?.substring(0, 2).toUpperCase() || <Building2 />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <Label>Logo de la Empresa</Label>
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Subir Imagen
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recomendado: PNG o JPG transparente, 200x200px máx.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre / Razón Social</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nif">NIF / CIF</Label>
              <Input 
                id="nif" 
                name="nif" 
                value={formData.nif || ''} 
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección Completa</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address || ''} 
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajustes Laborales y Horarios</CardTitle>
            <CardDescription>Configuración por defecto para empleados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 pb-4 border-b">
              <Label htmlFor="workingHoursPerWeek">Horas Semanales de Jornada Completa</Label>
              <Input 
                id="workingHoursPerWeek" 
                name="workingHoursPerWeek" 
                type="number"
                value={formData.workingHoursPerWeek || 40} 
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Usado para calcular el porcentaje de jornada y horas extra (Ej: 40h).</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <Label className="text-base font-semibold">Horario de Apertura / Base</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Introduce los turnos en formato HH:MM-HH:MM separados por comas. Déjalo en blanco si está cerrado.</p>
              
              <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
                <Label className="text-sm">Lunes</Label>
                <Input value={scheduleData.monday} onChange={e => handleScheduleChange('monday', e.target.value)} placeholder="09:00-14:00,15:00-18:00" className="font-mono text-sm" />
                
                <Label className="text-sm">Martes</Label>
                <Input value={scheduleData.tuesday} onChange={e => handleScheduleChange('tuesday', e.target.value)} placeholder="09:00-14:00,15:00-18:00" className="font-mono text-sm" />
                
                <Label className="text-sm">Miércoles</Label>
                <Input value={scheduleData.wednesday} onChange={e => handleScheduleChange('wednesday', e.target.value)} placeholder="09:00-14:00,15:00-18:00" className="font-mono text-sm" />
                
                <Label className="text-sm">Jueves</Label>
                <Input value={scheduleData.thursday} onChange={e => handleScheduleChange('thursday', e.target.value)} placeholder="09:00-14:00,15:00-18:00" className="font-mono text-sm" />
                
                <Label className="text-sm">Viernes</Label>
                <Input value={scheduleData.friday} onChange={e => handleScheduleChange('friday', e.target.value)} placeholder="08:00-15:00" className="font-mono text-sm" />
                
                <Label className="text-sm">Sábado</Label>
                <Input value={scheduleData.saturday} onChange={e => handleScheduleChange('saturday', e.target.value)} placeholder="Cerrado" className="font-mono text-sm" />
                
                <Label className="text-sm">Domingo</Label>
                <Input value={scheduleData.sunday} onChange={e => handleScheduleChange('sunday', e.target.value)} placeholder="Cerrado" className="font-mono text-sm" />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

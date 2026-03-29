import { useState, useEffect } from 'react';

// Types
export interface Company {
  id: string;
  name: string;
  nif: string;
  address: string;
  logo?: string; // base64
  workingHoursPerWeek: number;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  scheduleId: string;
  joinDate: string;
  avatar?: string;
  active: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  companyId: string;
  monday: string; // e.g. "09:00-14:00,15:00-18:00"
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut?: string; // HH:mm
  type: 'regular' | 'extra' | 'absence';
  notes?: string;
}

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'vacation' | 'sick' | 'personal';
  notes?: string;
}

// Initial Mock Data
const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Tech Solutions Iberia',
    nif: 'B12345678',
    address: 'Calle Innovación 42, Madrid',
    workingHoursPerWeek: 40,
    logo: '' // Will use a default avatar if empty
  },
  {
    id: 'c2',
    name: 'Creative Studio BCN',
    nif: 'B87654321',
    address: 'Paseo de Gracia 100, Barcelona',
    workingHoursPerWeek: 37.5,
  }
];

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 's1',
    name: 'Jornada Completa Partida',
    companyId: 'c1',
    monday: '09:00-14:00,15:00-18:00',
    tuesday: '09:00-14:00,15:00-18:00',
    wednesday: '09:00-14:00,15:00-18:00',
    thursday: '09:00-14:00,15:00-18:00',
    friday: '08:00-15:00',
    saturday: '',
    sunday: '',
  },
  {
    id: 's2',
    name: 'Jornada Intensiva',
    companyId: 'c1',
    monday: '08:00-16:00',
    tuesday: '08:00-16:00',
    wednesday: '08:00-16:00',
    thursday: '08:00-16:00',
    friday: '08:00-15:00',
    saturday: '',
    sunday: '',
  }
];

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    companyId: 'c1',
    name: 'Carlos Martínez',
    email: 'carlos@techsolutions.es',
    role: 'Desarrollador Senior',
    department: 'IT',
    scheduleId: 's1',
    joinDate: '2022-03-15',
    active: true,
  },
  {
    id: 'e2',
    companyId: 'c1',
    name: 'Laura Gómez',
    email: 'laura@techsolutions.es',
    role: 'Diseñadora UX/UI',
    department: 'Diseño',
    scheduleId: 's2',
    joinDate: '2023-01-10',
    active: true,
  },
  {
    id: 'e3',
    companyId: 'c2',
    name: 'Javier Ruiz',
    email: 'javier@creativestudio.es',
    role: 'Director de Arte',
    department: 'Dirección',
    scheduleId: 's1',
    joinDate: '2021-11-01',
    active: true,
  }
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const dbFormat = (d: Date) => d.toISOString().split('T')[0];

const MOCK_ENTRIES: TimeEntry[] = [
  {
    id: 't1',
    employeeId: 'e1',
    date: dbFormat(today),
    clockIn: '08:55',
    type: 'regular'
  },
  {
    id: 't2',
    employeeId: 'e2',
    date: dbFormat(today),
    clockIn: '08:05',
    clockOut: '16:05',
    type: 'regular'
  },
  {
    id: 't3',
    employeeId: 'e1',
    date: dbFormat(yesterday),
    clockIn: '09:02',
    clockOut: '18:15',
    type: 'regular'
  }
];

const MOCK_VACATIONS: Vacation[] = [
  {
    id: 'v1',
    employeeId: 'e1',
    startDate: '2024-08-01',
    endDate: '2024-08-15',
    status: 'approved',
    type: 'vacation'
  }
];

// Helper to initialize LocalStorage if empty
export function initStore() {
  if (!localStorage.getItem('companies')) {
    localStorage.setItem('companies', JSON.stringify(MOCK_COMPANIES));
    localStorage.setItem('employees', JSON.stringify(MOCK_EMPLOYEES));
    localStorage.setItem('schedules', JSON.stringify(MOCK_SCHEDULES));
    localStorage.setItem('entries', JSON.stringify(MOCK_ENTRIES));
    localStorage.setItem('vacations', JSON.stringify(MOCK_VACATIONS));
    localStorage.setItem('activeCompanyId', JSON.stringify('c1'));
  }
}

// React Hooks for Store
export function useStore<T>(key: string): [T, (data: T) => void] {
  const [data, setDataState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      // In case data is corrupted or wasn't stringified properly before
      return stored as unknown as T;
    }
  });

  const setData = (newData: T) => {
    localStorage.setItem(key, JSON.stringify(newData));
    setDataState(newData);
    // Dispatch custom event to sync across tabs/components
    window.dispatchEvent(new Event('store-changed'));
  };

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setDataState(JSON.parse(stored));
        } catch (e) {
          setDataState(stored as unknown as T);
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('store-changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('store-changed', handleStorage);
    };
  }, [key]);

  return [data, setData];
}

export function useActiveCompany() {
  const [companies] = useStore<Company[]>('companies');
  const [activeCompanyId, setActiveCompanyId] = useStore<string>('activeCompanyId');
  
  const activeCompany = companies?.find(c => c.id === activeCompanyId) || companies?.[0];
  
  return { activeCompany, setActiveCompanyId, companies };
}

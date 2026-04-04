import { useState, useEffect } from 'react';

// Types
export interface Company {
  id: string;
  name: string;
  nif: string;
  address: string;
  phone?: string;
  email?: string;
  logo?: string; // base64
  workingHoursPerWeek: number;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  role: string; // Job title
  systemRole: 'admin' | 'supervisor' | 'employee'; // App access level
  department: string;
  scheduleId: string;
  weeklyHours: number; // 40 = Completa, 20 = Media, etc
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
  breakStart?: string; // HH:mm
  breakEnd?: string; // HH:mm
  clockOut?: string; // HH:mm
  type: 'regular' | 'extra' | 'absence';
  notes?: string;
  status: 'pending' | 'validated' | 'rejected';
  validatedBy?: string; // Employee ID of the supervisor/admin
  employeeSignature?: string; // base64 signature or timestamp
  history?: { timestamp: string; action: string; by: string }[];
}

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'vacation' | 'sick' | 'personal';
  notes?: string;
  history?: { timestamp: string; action: string; by: string }[];
}

export interface WorkspaceSeed {
  companies: Company[];
  employees: Employee[];
  schedules: Schedule[];
  entries: TimeEntry[];
  vacations: Vacation[];
  activeCompanyId: string;
  currentUserId: string;
}

// Initial Mock Data
const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Tech Solutions Iberia',
    nif: 'B12345678',
    address: 'Calle Innovación 42, Madrid',
    workingHoursPerWeek: 40,
    logo: '' 
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
  }
];

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    companyId: 'c1',
    name: 'Carlos Martínez',
    email: 'carlos@techsolutions.es',
    role: 'Desarrollador Senior',
    systemRole: 'employee',
    department: 'IT',
    scheduleId: 's1',
    weeklyHours: 40,
    joinDate: '2022-03-15',
    active: true,
  },
  {
    id: 'e2',
    companyId: 'c1',
    name: 'Laura Gómez',
    email: 'laura@techsolutions.es',
    role: 'Directora de RRHH',
    systemRole: 'admin',
    department: 'RRHH',
    scheduleId: 's1',
    weeklyHours: 40,
    joinDate: '2021-01-10',
    active: true,
  },
  {
    id: 'e3',
    companyId: 'c1',
    name: 'Javier Ruiz',
    email: 'javier@techsolutions.es',
    role: 'Líder de Proyecto',
    systemRole: 'supervisor',
    department: 'IT',
    scheduleId: 's1',
    weeklyHours: 20,
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
    type: 'regular',
    status: 'pending',
    history: [{ timestamp: new Date().toISOString(), action: 'Fichaje de entrada creado', by: 'e1' }]
  },
  {
    id: 't2',
    employeeId: 'e2',
    date: dbFormat(yesterday),
    clockIn: '08:05',
    clockOut: '16:05',
    type: 'regular',
    status: 'validated',
    validatedBy: 'e2',
    employeeSignature: 'Firmado digitalmente: Laura Gómez',
    history: [{ timestamp: yesterday.toISOString(), action: 'Fichaje validado', by: 'e2' }]
  }
];

const MOCK_VACATIONS: Vacation[] = [];

const DEMO_PREFIX = "demo:";

function getScopedPrefix() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.startsWith("/demo-app") ? DEMO_PREFIX : "";
}

function prefixedKey(key: string, prefix = getScopedPrefix()) {
  return `${prefix}${key}`;
}

function initStoreForPrefix(prefix: string) {
  const companiesKey = prefixedKey("companies", prefix);
  if (!localStorage.getItem(companiesKey)) {
    localStorage.setItem(companiesKey, JSON.stringify(MOCK_COMPANIES));
    localStorage.setItem(prefixedKey("employees", prefix), JSON.stringify(MOCK_EMPLOYEES));
    localStorage.setItem(prefixedKey("schedules", prefix), JSON.stringify(MOCK_SCHEDULES));
    localStorage.setItem(prefixedKey("entries", prefix), JSON.stringify(MOCK_ENTRIES));
    localStorage.setItem(prefixedKey("vacations", prefix), JSON.stringify(MOCK_VACATIONS));
    localStorage.setItem(prefixedKey("activeCompanyId", prefix), JSON.stringify("c1"));
    // Set default logged in user to admin for testing
    localStorage.setItem(prefixedKey("currentUserId", prefix), JSON.stringify("e2"));
  }
}

// Helper to initialize LocalStorage if empty
export function initStore() {
  initStoreForPrefix("");
  initStoreForPrefix(DEMO_PREFIX);
}

export function applyWorkspaceSeed(seed: WorkspaceSeed) {
  localStorage.setItem("companies", JSON.stringify(seed.companies));
  localStorage.setItem("employees", JSON.stringify(seed.employees));
  localStorage.setItem("schedules", JSON.stringify(seed.schedules));
  localStorage.setItem("entries", JSON.stringify(seed.entries));
  localStorage.setItem("vacations", JSON.stringify(seed.vacations));
  localStorage.setItem("activeCompanyId", JSON.stringify(seed.activeCompanyId));
  localStorage.setItem("currentUserId", JSON.stringify(seed.currentUserId));
  window.dispatchEvent(new Event("store-changed"));
}

// React Hooks for Store
export function useStore<T>(key: string): [T, (data: T) => void] {
  const storageKey = prefixedKey(key);

  const [data, setDataState] = useState<T>(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      return stored as unknown as T;
    }
  });

  const setData = (newData: T) => {
    localStorage.setItem(storageKey, JSON.stringify(newData));
    setDataState(newData);
    window.dispatchEvent(new Event('store-changed'));
  };

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem(storageKey);
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
  }, [storageKey]);

  return [data, setData];
}

export function useActiveCompany() {
  const [companies] = useStore<Company[]>('companies');
  const [activeCompanyId, setActiveCompanyId] = useStore<string>('activeCompanyId');
  
  const activeCompany = companies?.find(c => c.id === activeCompanyId) || companies?.[0];
  
  return { activeCompany, setActiveCompanyId, companies };
}

export function useCurrentUser() {
  const [employees] = useStore<Employee[]>('employees');
  const [currentUserId, setCurrentUserId] = useStore<string>('currentUserId');
  
  const currentUser = employees?.find(e => e.id === currentUserId) || employees?.[0];
  
  return { currentUser, setCurrentUserId, employees };
}

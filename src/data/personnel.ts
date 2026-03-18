/**
 * Personnel Data
 * 
 * 12 Personnel: 2 admins, 5 growers, 2 vets, 3 staff
 * Realistic names and assignments to farms
 */

import type { Person } from '@/types';

export const personnel: Person[] = [
  // Admins (2)
  {
    id: 'person-001',
    name: 'Antonio Garcia',
    role: 'farm_admin',
    email: 'antonio.garcia@flockmate.ph',
    phone: '+63 912 345 6789',
    assignedFarms: ['farm-001', 'farm-002', 'farm-003', 'farm-004', 'farm-005'],
    status: 'active',
  },
  {
    id: 'person-002',
    name: 'Elena Rodriguez',
    role: 'farm_admin',
    email: 'elena.rodriguez@flockmate.ph',
    phone: '+63 917 890 1234',
    assignedFarms: ['farm-001', 'farm-002', 'farm-003', 'farm-004', 'farm-005'],
    status: 'active',
  },

  // Growers (5)
  {
    id: 'person-003',
    name: 'Bob Smith',
    role: 'grower',
    email: 'bob.smith@flockmate.ph',
    phone: '+63 918 234 5678',
    assignedFarms: ['farm-001'],
    status: 'active',
  },
  {
    id: 'person-004',
    name: 'Maria Santos',
    role: 'grower',
    email: 'maria.santos@flockmate.ph',
    phone: '+63 915 678 9012',
    assignedFarms: ['farm-002'],
    status: 'active',
  },
  {
    id: 'person-005',
    name: 'Juan Cruz',
    role: 'grower',
    email: 'juan.cruz@flockmate.ph',
    phone: '+63 919 345 6789',
    assignedFarms: ['farm-002'],
    status: 'active',
  },
  {
    id: 'person-006',
    name: 'Ana Reyes',
    role: 'grower',
    email: 'ana.reyes@flockmate.ph',
    phone: '+63 916 789 0123',
    assignedFarms: ['farm-003'],
    status: 'active',
  },
  {
    id: 'person-007',
    name: 'Carlos Mendoza',
    role: 'grower',
    email: 'carlos.mendoza@flockmate.ph',
    phone: '+63 920 456 7890',
    assignedFarms: ['farm-005'],
    status: 'active',
  },

  // Technicians (5) - Formerly Vets and Staff
  {
    id: 'person-008',
    name: 'Dr. Sarah Lim',
    role: 'technician',
    email: 'dr.lim@flockmate.ph',
    phone: '+63 913 567 8901',
    assignedFarms: ['farm-001', 'farm-002', 'farm-003'],
    status: 'active',
  },
  {
    id: 'person-009',
    name: 'Dr. David Chen',
    role: 'technician',
    email: 'dr.chen@flockmate.ph',
    phone: '+63 914 678 9012',
    assignedFarms: ['farm-004', 'farm-005'],
    status: 'active',
  },
  {
    id: 'person-010',
    name: 'Pedro Flores',
    role: 'technician',
    email: 'pedro.flores@flockmate.ph',
    phone: '+63 921 789 0123',
    assignedFarms: ['farm-001', 'farm-002'],
    status: 'active',
  },
  {
    id: 'person-011',
    name: 'Liza Torres',
    role: 'technician',
    email: 'liza.torres@flockmate.ph',
    phone: '+63 922 890 1234',
    assignedFarms: ['farm-003', 'farm-004'],
    status: 'active',
  },
  {
    id: 'person-012',
    name: 'Ramon Diaz',
    role: 'technician',
    email: 'ramon.diaz@flockmate.ph',
    phone: '+63 923 901 2345',
    assignedFarms: ['farm-005'],
    status: 'active',
  },
];

// Helper functions
export function getPersonById(id: string): Person | undefined {
  return personnel.find(person => person.id === id);
}

export function getPersonnelByRole(role: Person['role']): Person[] {
  return personnel.filter(person => person.role === role);
}

export function getPersonnelByFarmId(farmId: string): Person[] {
  return personnel.filter(person => person.assignedFarms.includes(farmId));
}

export function getGrowers(): Person[] {
  return personnel.filter(p => p.role === 'grower');
}

export function getTechnicians(): Person[] {
  return personnel.filter(p => p.role === 'technician');
}

export function getAdmins(): Person[] {
  return personnel.filter(p => p.role === 'farm_admin');
}

export function getActivePersonnel(): Person[] {
  return personnel.filter(p => p.status === 'active');
}

export function getPersonnelCount(): number {
  return personnel.length;
}

export function getGrowerCount(): number {
  return personnel.filter(p => p.role === 'grower').length;
}

export function getTechnicianCount(): number {
  return personnel.filter(p => p.role === 'technician').length;
}

export function getAdminCount(): number {
  return personnel.filter(p => p.role === 'farm_admin').length;
}

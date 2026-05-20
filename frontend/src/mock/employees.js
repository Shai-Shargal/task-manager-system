/**
 * Initial employee roster — mirrors db/seed.sql (departments + employees).
 */

export const DEPARTMENTS = {
  1: 'Engineering',
  2: 'Marketing',
  3: 'Human Resources',
};

export const INITIAL_EMPLOYEES = [
  {
    employee_id: 1,
    full_name: 'Alice Chen',
    email: 'alice.chen@deloitte-demo.com',
    department_id: 1,
    color_hex: '#3B82F6',
    created_at: '2025-11-03T09:15:00.000Z',
  },
  {
    employee_id: 2,
    full_name: 'Bob Martinez',
    email: 'bob.martinez@deloitte-demo.com',
    department_id: 1,
    color_hex: '#10B981',
    created_at: '2025-11-10T10:30:00.000Z',
  },
  {
    employee_id: 3,
    full_name: 'Carol Wu',
    email: 'carol.wu@deloitte-demo.com',
    department_id: 1,
    color_hex: '#8B5CF6',
    created_at: '2026-01-06T08:45:00.000Z',
  },
  {
    employee_id: 4,
    full_name: 'Diana Foster',
    email: 'diana.foster@deloitte-demo.com',
    department_id: 2,
    color_hex: '#F59E0B',
    created_at: '2025-10-21T11:00:00.000Z',
  },
  {
    employee_id: 5,
    full_name: 'Ethan Brooks',
    email: 'ethan.brooks@deloitte-demo.com',
    department_id: 2,
    color_hex: '#EF4444',
    created_at: '2026-02-17T14:20:00.000Z',
  },
  {
    employee_id: 6,
    full_name: 'Fiona Nguyen',
    email: 'fiona.nguyen@deloitte-demo.com',
    department_id: 3,
    color_hex: '#EC4899',
    created_at: '2025-12-01T09:00:00.000Z',
  },
];

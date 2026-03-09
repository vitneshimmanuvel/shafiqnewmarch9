import { Technician, User, RepairRequest } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  phone: '+91 98765 43210',
  address: '123, Silicon Valley Residency, Bangalore',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

export const MOCK_TECHNICIANS: Technician[] = [
  {
    id: 't1',
    name: 'Rahul Sharma',
    rating: 4.8,
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    phone: '+91 99999 88888',
  },
  {
    id: 't2',
    name: 'Priya Verma',
    rating: 4.9,
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    phone: '+91 99999 77777',
  },
];

export const MOCK_HISTORY: RepairRequest[] = [
  {
    id: 'r1',
    userId: 'u1',
    deviceType: 'Mobile',
    issue: 'Screen Replacement',
    estimatedCost: 2500,
    estimatedTime: '2 Hours',
    status: 'Delivered',
    pickupAddress: '123, Silicon Valley Residency, Bangalore',
    contactNumber: '+91 98765 43210',
    pickupTime: '2024-03-05 10:00 AM',
    technicianId: 't1',
    createdAt: '2024-03-05T09:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z',
  },
  {
    id: 'r2',
    userId: 'u1',
    deviceType: 'Laptop',
    issue: 'Battery Replacement',
    estimatedCost: 4500,
    estimatedTime: '4 Hours',
    status: 'Delivered',
    pickupAddress: '123, Silicon Valley Residency, Bangalore',
    contactNumber: '+91 98765 43210',
    pickupTime: '2024-02-15 11:00 AM',
    technicianId: 't2',
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-02-15T16:00:00Z',
  }
];

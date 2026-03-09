export type DeviceType = 'Mobile' | 'Laptop';

export type RepairStatus = 
  | 'Request Confirmed' 
  | 'Technician Assigned' 
  | 'On The Way' 
  | 'Device Picked Up' 
  | 'Repair In Progress' 
  | 'Repair Completed' 
  | 'Out For Delivery' 
  | 'Delivered';

export interface Technician {
  id: string;
  name: string;
  rating: number;
  photo: string;
  phone: string;
}

export interface RepairRequest {
  id: string;
  userId: string;
  deviceType: DeviceType;
  issue: string;
  description?: string;
  photoUrl?: string;
  estimatedCost: number;
  estimatedTime: string;
  status: RepairStatus;
  pickupAddress: string;
  contactNumber: string;
  pickupTime: string;
  technicianId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  address: string;
  avatar: string;
}

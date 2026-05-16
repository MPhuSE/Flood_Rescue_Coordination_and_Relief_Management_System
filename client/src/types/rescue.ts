export type RescueRequest = {
  requestId: number; description: string; location: string;
  latitude: number; longitude: number; urgencyLevel: string;
  status: string; image?: string; notes?: string;
  userId: number; assignedTeamId?: number; assignedTeamName?: string;
  createdTime: string; updatedTime?: string;
};
export type CreateRescueRequest = {
  description: string; location: string;
  latitude: number; longitude: number; urgencyLevel: string; imageUrl?: string;
};
export type RescueTeam = {
  teamId: number; teamName: string; memberCount: number;
  contactPhone: string; status: string; currentLocation: string;
  teamLeaderId: number; teamLeaderName?: string;
  description?: string; createdAt: string; vehicleNames?: string[];
};
export type RescueVehicle = {
  vehicleId: number; name: string; type: string; licensePlate: string;
  capacity: number; currentLocation: string; status: string;
  assignedTeamId?: number; assignedTeamName?: string;
  notes?: string; createdAt: string;
};
export type ReliefItem = {
  id: number; name: string; category: string; unit: string;
  quantityInStock: number; minimumStockLevel: number;
  description?: string; createdAt: string;
};
export type ReliefDistribution = {
  id: number; rescueRequestId: number; reliefItemId: number;
  reliefItemName?: string; quantityDistributed: number;
  distributionDate: string; notes?: string;
};
export type Shelter = {
  id: number; name: string; location: string;
  latitude: number; longitude: number;
  capacity: number; currentOccupancy: number;
  status: string; contactInfo?: string; createdAt: string;
};
export type FloodAlert = {
  id: number; title: string; description: string;
  severity: string; locationArea: string;
  startTime: string; endTime?: string;
  createdBy: number; createdAt: string;
};
export type Notification = {
  id: number; title: string; message: string;
  type: string; isRead: boolean; createdAt: string;
};
export type DashboardStats = {
  totalUsers: number; totalRescueRequests: number;
  totalTeams: number; totalVehicles: number;
  totalReliefItems: number; totalShelters: number;
  totalAlerts: number; requestsByStatus: Record<string, number>;
  requestsByUrgency: Record<string, number>;
};

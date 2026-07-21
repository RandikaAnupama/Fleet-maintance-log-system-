export const vehiclesSeed = [
  { id: 1, number: "CAB-1234", brand: "Toyota", model: "Hilux", year: 2021, mileage: 84500, status: "ACTIVE" },
  { id: 2, number: "CAD-5678", brand: "Isuzu", model: "D-Max", year: 2020, mileage: 102300, status: "SERVICE_DUE" },
  { id: 3, number: "CAR-9087", brand: "Nissan", model: "Navara", year: 2022, mileage: 56100, status: "ACTIVE" }
];

export const driversSeed = [
  { id: 1, name: "Nimal Silva", license: "B1234567", phone: "0771234567", vehicle: "CAB-1234", status: "ACTIVE" },
  { id: 2, name: "Saman Kumara", license: "B7654321", phone: "0719876543", vehicle: "CAD-5678", status: "ACTIVE" }
];

export const maintenanceSeed = [
  { id: 1, vehicle: "CAB-1234", type: "Oil Change", date: "2026-07-18", cost: 18500, nextDate: "2026-10-18", status: "COMPLETED" },
  { id: 2, vehicle: "CAD-5678", type: "Brake Inspection", date: "2026-07-20", cost: 32000, nextDate: "2026-08-20", status: "PENDING" }
];

export const fuelSeed = [
  { id: 1, vehicle: "CAB-1234", date: "2026-07-18", litres: 42, cost: 15120, odometer: 84500 },
  { id: 2, vehicle: "CAD-5678", date: "2026-07-19", litres: 50, cost: 18000, odometer: 102300 }
];

export const repairsSeed = [
  { id: 1, vehicle: "CAR-9087", date: "2026-07-12", garage: "City Auto Care", description: "Alternator replacement", cost: 68000, status: "COMPLETED" }
];

export const schedulesSeed = [
  { id: 1, vehicle: "CAD-5678", date: "2026-07-25", service: "Full Service", reminder: 3, status: "UPCOMING" },
  { id: 2, vehicle: "CAB-1234", date: "2026-10-18", service: "Oil Change", reminder: 7, status: "UPCOMING" }
];

export const issuesSeed = [
  { id: 1, title: "Brake noise", vehicle: "CAB-1234", priority: "HIGH", status: "OPEN", date: "2026-07-20" }
];

export const usersSeed = [
  { id: 1, name: "System Admin", email: "admin@fleet.com", role: "ADMIN", status: "ACTIVE" },
  { id: 2, name: "Kamal Perera", email: "user@fleet.com", role: "USER", status: "ACTIVE" }
];

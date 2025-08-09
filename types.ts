
export enum ApplicationStatus {
  Pending = '대기',
  Approved = '완료',
  Rejected = '반려',
}

export interface AccessApplication {
  id: string;
  name: string;
  phone: string;
  company: string;
  projectName: string;
  vehicleNumber?: string;
  agreedOn: string;
  signature: string; // Base64 string
  status: ApplicationStatus;
  createdAt: string;
  qrCodeUrl?: string;
  // 추가 필드
  gender?: string;
  nationality?: string;
  passportNumber?: string;
  isSiteRepresentative?: boolean;
  vehicleOwner?: boolean;
  vehicleOwnerName?: string;
  vehicleType?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  projectManager?: string;
  constructionDetails?: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  manager: string;
  department?: string;
  description: string;
}

export interface Company {
  id: string;
  name: string;
  department?: string;
  manager?: string;
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
  managers: Manager[];
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'general' | 'safety' | 'admin'; // 일반, 안전관리자, 관리자
  departmentId: string;
}

export interface DailyStats {
    date: string;
    entered: number;
    exited: number;
}

export interface StatusStats {
    name: string;
    value: number;
}

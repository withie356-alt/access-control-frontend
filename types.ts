
export enum ApplicationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface AccessApplication {
  id: string;
  applicant_name: string;
  applicant_phone: string;
  gender?: string;
  nationality?: string;
  passport_number?: string;
  company_name?: string;
  company_id?: string; // UUID
  project_id?: string; // UUID
  visit_date: string; // DATE
  status: ApplicationStatus;
  is_site_representative?: boolean;
  is_vehicle_owner?: boolean;
  vehicle_number?: string;
  vehicle_type?: string;
  agreed_on?: string; // TIMESTAMPTZ
  signature?: string; // Base64 string
  qrid?: string; // TEXT UNIQUE
  created_at: string; // TIMESTAMPTZ
  qrCodeUrl?: string; // This is not from DB, but might be generated
}

export interface FullAccessApplication extends AccessApplication {
  checkInTime?: string; // From access_logs
  checkOutTime?: string; // From access_logs
  projectName?: string; // From projects.name
  projectDescription?: string; // From projects.description
  projectStartDate?: string; // From projects.start_date
  projectEndDate?: string; // From projects.end_date
  projectManagerName?: string; // From managers.name
  projectManagerDepartmentName?: string; // From managers -> departments
  companyName?: string; // From companies.name
  companyDepartmentName?: string; // From companies -> departments
  companyContactPerson?: string; // From companies.contact_person (or managers.name from company join)
  companyPhoneNumber?: string; // From companies.phone_number (or managers.phone from company join)
  departmentName?: string; // From departments.name
  projectManagerPhone?: string; // From managers.phone
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string; // DATE
  end_date?: string; // DATE
  manager_id?: string; // UUID
  department_id?: string; // UUID
  manager_name?: string; // From managers table
  manager_role?: 'general' | 'safety' | 'admin'; // From managers table
  manager_department_name?: string; // From managers -> departments
  department_name?: string; // From departments table
  created_at: string; // TIMESTAMPTZ
}

export interface Company {
  id: string;
  name: string;
  contact_person?: string;
  phone_number?: string;
  created_at: string; // TIMESTAMPTZ
  department_id?: string; // UUID
  manager_id?: string; // UUID
  department_name?: string; // From departments table
  manager_name?: string; // From managers table
}

export interface Department {
  id: string;
  name: string;
  created_at: string; // TIMESTAMPTZ
  managers?: Manager[];
}

export interface Manager {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: 'general' | 'safety' | 'admin';
  department_id?: string; // UUID
  created_at: string; // TIMESTAMPTZ
}

export interface AccessLog {
  id: string;
  qrid: string;
  event_type: 'check_in' | 'check_out';
  timestamp: string;
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

export interface AccessLogEntry extends FullAccessApplication {
  log_id: string;
  event_type: 'check_in' | 'check_out';
  timestamp: string;
}

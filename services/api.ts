import { supabase } from './supabase';
import { AccessApplication, ApplicationStatus, Company, Project, DailyStats, StatusStats, Department, FullAccessApplication, AccessLog, Manager } from '../types';

const api = {
  getProjects: async (): Promise<Project[]> => {
    console.log('API: Fetching projects with manager and department info');
    const { data, error } = await supabase.from('projects').select(`
      *,
      managers (
        name,
        role,
        departments (
          name
        )
      ),
      departments (
        name
      )
    `);
    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    // Process data to flatten nested objects if needed, or adjust Project type to match.
    // For now, assume Project type can handle nested structure or direct access.
    return data.map((project: any) => ({
      ...project,
      manager_name: project.managers ? project.managers.name : '-',
      manager_role: project.managers ? project.managers.role : '-',
      manager_department_name: project.managers?.departments ? project.managers.departments.name : '-',
      department_name: project.departments ? project.departments.name : '-',
    })) || [];
  },

  addProject: async (projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    console.log('API: Adding project', projectData);
    const { data, error } = await supabase.from('projects').insert([projectData]).select();
    if (error) {
      console.error('Error adding project:', error);
      throw error;
    }
    return data[0] as Project;
  },

  updateProject: async (projectData: Project): Promise<Project> => {
    console.log('API: Updating project', projectData);
    const { id, ...updates } = projectData;
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select();
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    return data[0] as Project;
  },

  submitApplication: async (applicationData: Omit<AccessApplication, 'id' | 'status' | 'created_at' | 'qrCodeUrl'>): Promise<AccessApplication> => {
    console.log('API: Submitting application', applicationData);

    // Map AccessApplication fields to database column names
    const mappedData = {
      applicant_name: applicationData.applicant_name,
      applicant_phone: applicationData.applicant_phone,
      gender: applicationData.gender,
      nationality: applicationData.nationality,
      passport_number: applicationData.passport_number,
      company_name: applicationData.company_name,
      project_id: applicationData.project_id,
      visit_date: applicationData.visit_date,
      is_site_representative: applicationData.is_site_representative,
      is_vehicle_owner: applicationData.is_vehicle_owner,
      vehicle_number: applicationData.vehicle_number,
      vehicle_type: applicationData.vehicle_type,
      agreed_on: applicationData.agreed_on,
      signature: applicationData.signature,
      qrid: applicationData.qrid,
      status: ApplicationStatus.Pending, // Always pending on submission
    };

    const { data, error } = await supabase.from('access_applications').insert([
      mappedData
    ]).select();

    if (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
    return data[0] as AccessApplication;
  },

  getApplicationsByPhone: async (phone: string): Promise<AccessApplication[]> => {
    console.log('API: Fetching applications for phone', phone);
    const { data, error } = await supabase.from('access_applications').select('*').eq('applicant_phone', phone);
    if (error) {
      console.error('Error fetching applications by phone:', error);
      throw error;
    }
    return data || [];
  },

  updateApplication: async (id: string, data: Partial<AccessApplication>): Promise<AccessApplication> => {
    console.log('API: Updating application', id, data);
    // Map AccessApplication fields to database column names for update
    const mappedData: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Simple mapping for now, can be more sophisticated if needed
        mappedData[key] = (data as any)[key];
      }
    }

    const { data: updatedData, error } = await supabase.from('access_applications').update(mappedData).eq('id', id).select();
    if (error) {
      console.error('Error updating application:', error);
      throw error;
    }
    return updatedData[0] as AccessApplication;
  },

  getAccessApplications: async (): Promise<FullAccessApplication[]> => {
    console.log('API: Fetching all access applications with joins');
    const { data, error } = await supabase
      .from('access_applications')
      .select(`
        *,
        projects (
          name,
          description,
          start_date,
          end_date,
          managers (
            name,
            departments (
              name
            )
          )
        ),
        access_logs (
          qrid,
          event_type,
          timestamp
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching access applications:', error);
      throw error;
    }

    // Process fetched data to match FullAccessApplication structure
    const fullApplications: FullAccessApplication[] = data.map((app: any) => {
      const checkInLog = app.access_logs.find((log: any) => log.event_type === 'check_in');
      const checkOutLog = app.access_logs.find((log: any) => log.event_type === 'check_out');

      return {
        ...app,
        applicant_name: app.applicant_name,
        applicant_phone: app.applicant_phone,
        company_name: app.company_name,
        project_id: app.project_id,
        visit_date: app.visit_date,
        is_site_representative: app.is_site_representative,
        is_vehicle_owner: app.is_vehicle_owner,
        vehicle_number: app.vehicle_number,
        vehicle_type: app.vehicle_type,
        agreed_on: app.agreed_on,
        signature: app.signature,
        qrid: app.qrid,
        status: app.status,
        created_at: app.created_at,
        checkInTime: checkInLog ? new Date(checkInLog.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        checkOutTime: checkOutLog ? new Date(checkOutLog.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        projectName: app.projects?.name,
        projectDescription: app.projects?.description,
        projectStartDate: app.projects?.start_date,
        projectEndDate: app.projects?.end_date,
        projectManagerName: app.projects?.managers?.name,
        departmentName: app.projects?.managers?.departments?.name,
        // companyContactPerson and companyPhoneNumber are not directly joined here.
        // If needed, they would require a separate fetch or a more complex join if company_name was a foreign key.
        // For now, they will be undefined or require manual mapping if company_name is used to look up.
      };
    });

    return fullApplications;
  },

  approveApplications: async (ids: string[]): Promise<AccessApplication[]> => {
    console.log('API: Approving applications', ids);
    const updates = ids.map(id => ({ id, status: ApplicationStatus.Approved, qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=approved-${id}` }));
    const { data, error } = await supabase.from('access_applications').upsert(updates).select();

    if (error) {
      console.error('Error approving applications:', error);
      throw error;
    }
    return data || [];
  },

  rejectApplications: async (ids: string[]): Promise<AccessApplication[]> => {
    console.log('API: Rejecting applications', ids);
    const updates = ids.map(id => ({ id, status: ApplicationStatus.Rejected, qrCodeUrl: undefined }));
    const { data, error } = await supabase.from('access_applications').upsert(updates).select();

    if (error) {
      console.error('Error rejecting applications:', error);
      throw error;
    }
    return data || [];
  },

  deleteApplication: async (id: string): Promise<{ id: string }> => {
    console.log('API: Deleting application', id);
    const { error } = await supabase.from('access_applications').delete().eq('id', id);
    if (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
    return { id };
  },

  getDashboardStats: async () => {
    console.log('API: Fetching dashboard stats');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

    // Fetch all access logs for today
    const { data: logs, error: logsError } = await supabase
      .from('access_logs')
      .select('qrid, event_type, timestamp')
      .gte('timestamp', today.toISOString())
      .lt('timestamp', tomorrow.toISOString());

    if (logsError) {
      console.error('Error fetching access logs for stats:', logsError);
      throw logsError;
    }

    const onSiteQrids = new Set<string>();
    const exitedQridsToday = new Set<string>();
    const dailyStatsMap = new Map<string, { entered: number; exited: number }>();

    logs.forEach(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyStatsMap.has(logDate)) {
        dailyStatsMap.set(logDate, { entered: 0, exited: 0 });
      }
      const stats = dailyStatsMap.get(logDate)!;

      if (log.event_type === 'check_in') {
        onSiteQrids.add(log.qrid);
        stats.entered++;
      } else if (log.event_type === 'check_out') {
        onSiteQrids.delete(log.qrid); // If they checked out, they are no longer on site
        exitedQridsToday.add(log.qrid);
        stats.exited++;
      }
    });

    // For onSiteNow, we need to consider all check-ins that haven't been checked out yet,
    // not just those from today. This requires a more complex query or processing all logs.
    // For simplicity, let's assume onSiteNow is based on today's logs for now,
    // or we can fetch all logs and determine current status.
    // A more accurate 'onSiteNow' would involve checking the latest log for each qrid.

    // Let's refine onSiteNow: get the latest log for each qrid
    const { data: allLogs, error: allLogsError } = await supabase
      .from('access_logs')
      .select('qrid, event_type, timestamp')
      .order('timestamp', { ascending: false }); // Get latest first

    if (allLogsError) {
      console.error('Error fetching all access logs for onSiteNow:', allLogsError);
      throw allLogsError;
    }

    const latestLogForQrid = new Map<string, string>(); // qrid -> latest event_type
    const latestTimestampForQrid = new Map<string, Date>(); // qrid -> latest timestamp

    allLogs.forEach(log => {
      if (!latestTimestampForQrid.has(log.qrid) || new Date(log.timestamp) > latestTimestampForQrid.get(log.qrid)!) {
        latestLogForQrid.set(log.qrid, log.event_type);
        latestTimestampForQrid.set(log.qrid, new Date(log.timestamp));
      }
    });

    let onSiteNowCount = 0;
    latestLogForQrid.forEach((eventType) => {
      if (eventType === 'check_in') {
        onSiteNowCount++;
      }
    });


    const dailyStats: DailyStats[] = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({ date, entered: stats.entered, exited: stats.exited }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const exitedToday = exitedQridsToday.size; // Count of unique QR IDs that checked out today

    // Status stats (from all applications, not just today's logs)
    const { data: applications, error: appError } = await supabase.from('access_applications').select('status');
    if (appError) {
      console.error('Error fetching applications for status stats:', appError);
      throw appError;
    }

    const statusStats: StatusStats[] = [
      { name: ApplicationStatus.Pending, value: applications.filter(a => a.status === ApplicationStatus.Pending).length },
      { name: ApplicationStatus.Approved, value: applications.filter(a => a.status === ApplicationStatus.Approved).length },
      { name: ApplicationStatus.Rejected, value: applications.filter(a => a.status === ApplicationStatus.Rejected).length },
    ];

    return { dailyStats, onSiteNow: onSiteNowCount, exitedToday, statusStats };
  },

  getCompanies: async (): Promise<Company[]> => {
    console.log('API: Fetching companies with department and manager info');
    const { data, error } = await supabase.from('companies').select(`
      *,
      departments (
        name
      ),
      managers (
        name,
        phone
      )
    `);
    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
    return data.map((company: any) => ({
      ...company,
      department_name: company.departments ? company.departments.name : '-',
      manager_name: company.managers ? company.managers.name : '-',
      contact_person: company.managers ? company.managers.name : company.contact_person || '',
      phone_number: company.managers ? company.managers.phone : company.phone_number || '',
    })) || [];
  },

  getDepartments: async (): Promise<Department[]> => {
    console.log('API: Fetching departments');
    const { data, error } = await supabase.from('departments').select('*, managers(*)');
    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
    return data || [];
  },

  deleteProject: async (id: string): Promise<{ id: string }> => {
    console.log('API: Deleting project', id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
    return { id };
  },

  addCompany: async (companyData: Omit<Company, 'id' | 'created_at'>): Promise<Company> => {
    console.log('API: Adding company', companyData);
    const { data, error } = await supabase.from('companies').insert([companyData]).select();
    if (error) {
      console.error('Error adding company:', error);
      throw error;
    }
    return data[0] as Company;
  },

  updateCompany: async (company: Company): Promise<Company> => {
    console.log('API: Updating company', company);
    const { data, error } = await supabase.from('companies').update(company).eq('id', company.id).select();
    if (error) {
      console.error('Error updating company:', error);
      throw error;
    }
    return data[0] as Company;
  },

  deleteCompany: async (id: string): Promise<{ id: string }> => {
    console.log('API: Deleting company', id);
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
    return { id };
  },

  // New function to add access log
  addAccessLog: async (qrid: string, event_type: 'check_in' | 'check_out'): Promise<AccessLog> => {
    console.log(`API: Adding access log for QRID ${qrid}, event: ${event_type}`);
    const { data, error } = await supabase.from('access_logs').insert([{ qrid, event_type }]).select();
    if (error) {
      console.error('Error adding access log:', error);
      throw error;
    }
    return data[0] as AccessLog;
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    console.log('API: Fetching all access logs');
    const { data, error } = await supabase.from('access_logs').select('*');
    if (error) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
    return data || [];
  },

  getAccessLogsByQrid: async (qrid: string): Promise<AccessLog[]> => {
    console.log('API: Fetching access logs for QRID', qrid);
    const { data, error } = await supabase.from('access_logs').select('*').eq('qrid', qrid);
    if (error) {
      console.error('Error fetching access logs by QRID:', error);
      throw error;
    }
    return data || [];
  },

  deleteAccessLog: async (id: string): Promise<{ id: string }> => {
    console.log('API: Deleting access log', id);
    const { error } = await supabase.from('access_logs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting access log:', error);
      throw error;
    }
    return { id };
  },

  getManagers: async (): Promise<Manager[]> => {
    console.log('API: Fetching managers');
    const { data, error } = await supabase.from('managers').select('*');
    if (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
    return data || [];
  },

  addManager: async (managerData: Omit<Manager, 'id' | 'created_at'>): Promise<Manager> => {
    console.log('API: Adding manager', managerData);
    const { data, error } = await supabase.from('managers').insert([managerData]).select();
    if (error) {
      console.error('Error adding manager:', error);
      throw error;
    }
    return data[0] as Manager;
  },

  updateManager: async (manager: Manager): Promise<Manager> => {
    console.log('API: Updating manager', manager);
    const { data, error } = await supabase.from('managers').update(manager).eq('id', manager.id).select();
    if (error) {
      console.error('Error updating manager:', error);
      throw error;
    }
    return data[0] as Manager;
  },

  deleteManager: async (id: string): Promise<{ id: string }> => {
    console.log('API: Deleting manager', id);
    const { error } = await supabase.from('managers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting manager:', error);
      throw error;
    }
    return { id };
  },
};

export default api;
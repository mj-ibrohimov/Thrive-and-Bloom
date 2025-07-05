

// lib/api/jobs.tsx

export interface Job {
  id: string;
  title: string;
  company: string;
}

export const getJobs = async (): Promise<Job[]> => {
  // Mocked job data; replace with real API call as needed
  return [
    { id: '1', title: 'Frontend Developer', company: 'TechCorp' },
    { id: '2', title: 'UX Designer', company: 'DesignCo' },
    { id: '3', title: 'Data Analyst', company: 'DataWorks' },
  ];
};
import type { Job } from '../types/Job';
import type { ResumeProfile } from '../types/Resume';
import type { SearchPreferences } from '../types/User';

export const demoProfile: ResumeProfile = {
  fullName: 'Karthi',
  headline: 'Senior BI / Analytics Consultant',
  totalYearsExperience: 15,
  location: 'Dallas, TX',
  fileName: 'Karthi_Resume.pdf',
  skills: ['Power BI', 'DAX', 'Power Automate', 'SQL', 'Python', 'Tableau', 'Databricks', 'Snowflake', 'Microsoft Fabric', 'Cognos', 'GenAI / Claude', 'REST API', 'Data Governance'],
  industries: ['Healthcare', 'Financial Services', 'Enterprise'],
  certifications: ['Scrum Master', 'Tableau', 'Cognos', 'Databricks / GenAI-related credentials'],
  targetRoles: ['BI Architect', 'Analytics Architect', 'Power BI Architect', 'Senior BI Consultant', 'Data Analytics Architect'],
  achievements: ['$500K annual maintenance savings', '$2M client revenue', '60% faster claims-monitoring response', '40% dashboard load-time improvement'],
};

export const defaultPreferences: SearchPreferences = {
  targetRoles: ['BI Architect', 'Analytics Architect', 'Power BI Architect', 'Senior BI Consultant', 'Data Analytics Architect'],
  locations: ['Dallas, TX', 'Plano, TX', 'McKinney, TX', 'Irving, TX', 'Richardson, TX', 'Frisco, TX'],
  radiusMiles: 40,
  employmentTypes: ['Full Time'],
  includeRemoteStrongMatches: true,
  minimumFitment: 8,
  emailReports: true,
  emailAddress: '',
  reportTime: '07:00',
  includeExcel: true,
};

export const demoJobs: Job[] = [
  {
    id: 'capgemini-pbi-architect', title: 'Power BI Solution Architect', company: 'Capgemini', location: 'Westlake / Irving, TX', workArrangement: 'Hybrid', employmentType: 'Full Time', salary: '$150K–$180K', freshness: 'Demo record', applyUrl: '#', source: 'Demo data', description: 'Enterprise Power BI modernization, semantic modeling, architecture and reporting platform leadership.', requiredSkills: ['Power BI', 'DAX', 'SQL', 'Data Governance', 'Microsoft Fabric'], preferredSkills: ['Power Automate'], minYearsExperience: 10, industry: 'Enterprise', status: 'New'
  },
  {
    id: 'cdw-fabric', title: 'Microsoft Fabric Consulting Data Architect', company: 'CDW', location: 'Remote, US', workArrangement: 'Remote', employmentType: 'Full Time', salary: '$128K–$193K', freshness: 'Demo record', applyUrl: '#', source: 'Demo data', description: 'Consulting data architecture role focused on Microsoft Fabric and enterprise data modernization.', requiredSkills: ['Microsoft Fabric', 'Power BI', 'SQL', 'Data Governance'], preferredSkills: ['Databricks', 'Snowflake'], minYearsExperience: 10, industry: 'Enterprise', status: 'New'
  },
  {
    id: 'texas-health-bi-manager', title: 'Manager BI Applications & Production Support', company: 'Texas Health Resources', location: 'Arlington, TX', workArrangement: 'Hybrid', employmentType: 'Full Time', freshness: 'Demo record', applyUrl: '#', source: 'Demo data', description: 'BI applications, production support, governance, healthcare reporting, technical leadership and operational reliability.', requiredSkills: ['Power BI', 'SQL', 'Tableau', 'Data Governance', 'Healthcare'], preferredSkills: ['Cognos'], minYearsExperience: 7, industry: 'Healthcare', status: 'New'
  },
  {
    id: 'argo-manager', title: 'Manager of Reporting and Analytics', company: 'ARGO', location: 'Richardson, TX', workArrangement: 'Hybrid', employmentType: 'Full Time', freshness: 'Demo record', applyUrl: '#', source: 'Demo data', description: 'Lead analytics team using SQL, Power BI, Microsoft Fabric, Databricks and enterprise reporting practices.', requiredSkills: ['SQL', 'Power BI', 'Microsoft Fabric', 'Databricks'], minYearsExperience: 8, industry: 'Financial Services', status: 'New'
  },
  {
    id: 'prestige-pbi-ai', title: 'Senior Power BI Engineer – Enterprise AI', company: 'Prestige Staffing', location: 'Plano, TX', workArrangement: 'Hybrid', employmentType: 'Full Time', freshness: 'Demo record', applyUrl: '#', source: 'Demo data', description: 'Power BI engineering, executive reporting, data quality and AI-enabled analytics.', requiredSkills: ['Power BI', 'DAX', 'SQL', 'GenAI'], preferredSkills: ['Python'], minYearsExperience: 7, industry: 'Enterprise', status: 'New'
  }
];

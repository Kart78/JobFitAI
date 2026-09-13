import type { ResumeProfile } from '../types/Resume';
import type { SearchPreferences } from '../types/User';

export function createEmptyProfile(displayName = ''): ResumeProfile {
  return {
    fullName: displayName,
    headline: '',
    totalYearsExperience: 0,
    location: '',
    skills: [],
    industries: [],
    certifications: [],
    targetRoles: [],
    achievements: [],
  };
}

export const defaultPreferences: SearchPreferences = {
  targetRoles: [],
  locations: [],
  radiusMiles: 40,
  employmentTypes: ['Full Time'],
  includeRemoteStrongMatches: true,
  minimumFitment: 8,
  emailReports: true,
  emailAddress: '',
  reportTime: '07:00',
  includeExcel: true,
};

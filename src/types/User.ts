export interface SearchPreferences {
  targetRoles: string[];
  locations: string[];
  radiusMiles: number;
  employmentTypes: string[];
  includeRemoteStrongMatches: boolean;
  minimumFitment: number;
  emailReports: boolean;
  emailAddress: string;
  reportTime: string;
  includeExcel: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  preferences: SearchPreferences;
}

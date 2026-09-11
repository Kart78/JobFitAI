import type { Job } from '../types/Job';
import type { ResumeProfile } from '../types/Resume';
import type { SearchPreferences } from '../types/User';
import { skillOverlap } from './skills';

function roleScore(job: Job, profile: ResumeProfile, preferences: SearchPreferences): number {
  const haystack = `${job.title} ${job.description}`.toLowerCase();
  const targets = [...profile.targetRoles, ...preferences.targetRoles];
  const matches = targets.filter((role) => {
    const words = role.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    return words.some((word) => haystack.includes(word));
  });
  return Math.min(1, matches.length / 2);
}

export function calculateFitment(job: Job, profile: ResumeProfile, preferences: SearchPreferences) {
  const matchedSkills = skillOverlap(profile.skills, job.requiredSkills);
  const skillScore = job.requiredSkills.length ? matchedSkills.length / job.requiredSkills.length : 0.7;
  const seniorityScore = !job.minYearsExperience
    ? 0.85
    : Math.min(1, profile.totalYearsExperience / job.minYearsExperience);

  const desiredLocations = preferences.locations.map((l) => l.toLowerCase());
  const locationScore = job.workArrangement === 'Remote'
    ? preferences.includeRemoteStrongMatches ? 1 : 0.4
    : desiredLocations.some((loc) => job.location.toLowerCase().includes(loc.split(',')[0])) ? 1 : 0.65;

  const industryText = `${job.industry ?? ''} ${job.description}`.toLowerCase();
  const industryScore = profile.industries.some((i) => industryText.includes(i.toLowerCase())) ? 1 : 0.65;
  const employmentScore = preferences.employmentTypes.includes(job.employmentType) ? 1 : 0.35;
  const targetRoleScore = roleScore(job, profile, preferences);

  const weighted =
    targetRoleScore * 0.20 +
    skillScore * 0.30 +
    seniorityScore * 0.15 +
    locationScore * 0.10 +
    employmentScore * 0.10 +
    industryScore * 0.05 +
    0.10;

  const fitment = Math.max(0, Math.min(10, weighted * 10));
  const missing = job.requiredSkills.filter((skill) => !matchedSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase()));

  const matchReasons = [
    matchedSkills.length ? `Matches ${matchedSkills.slice(0, 6).join(', ')}` : 'Relevant BI/analytics background',
    seniorityScore >= 1 ? 'Experience level meets or exceeds requirement' : 'Seniority is reasonably aligned',
    locationScore === 1 ? 'Location/work arrangement matches your preference' : 'Location is outside the primary preference',
  ];

  return {
    fitment: Number(fitment.toFixed(1)),
    matchReasons,
    gaps: missing.slice(0, 5),
  };
}

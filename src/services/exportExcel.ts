import * as XLSX from 'xlsx';
import type { Job } from '../types/Job';

export function exportJobsToExcel(jobs: Job[]) {
  const rows = jobs.map((job, index) => ({
    Rank: index + 1,
    'Fitment /10': job.fitment ?? '',
    'Job Title': job.title,
    Company: job.company,
    Location: job.location,
    'Work Type': job.workArrangement,
    'Employment Type': job.employmentType,
    Salary: job.salary ?? '',
    Priority: job.isPriority ? 'Top Priority' : '',
    'Why It Fits': (job.matchReasons ?? []).join('; '),
    Gaps: (job.gaps ?? []).join('; '),
    Freshness: job.freshness ?? job.postedDate ?? '',
    'Apply Link': job.applyUrl,
    Source: job.source,
    Status: job.status ?? 'New',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [8, 12, 34, 24, 24, 14, 16, 18, 14, 60, 36, 18, 45, 24, 14].map((wch) => ({ wch }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Matches');
  XLSX.writeFile(workbook, `JobFit_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

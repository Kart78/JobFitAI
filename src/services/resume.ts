import type { ResumeProfile } from '../types/Resume';

export async function parseResume(file: File, currentProfile: ResumeProfile): Promise<ResumeProfile> {
  // Phase 1: keep parsing zero-cost and privacy-friendly. PDF/DOCX text extraction can
  // be added locally or on a Worker endpoint later. The uploaded file name is stored now.
  return {
    ...currentProfile,
    fileName: file.name,
  };
}

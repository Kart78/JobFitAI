import { FileText, UploadCloud } from 'lucide-react';

interface Props {
  fileName?: string;
  onUpload: (file: File) => void;
}

export default function ResumeUploader({ fileName, onUpload }: Props) {
  return (
    <label className="resume-uploader">
      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
      {fileName ? <FileText size={34} /> : <UploadCloud size={38} />}
      <strong>{fileName || 'Upload your resume'}</strong>
      <span>{fileName ? 'Click to replace resume' : 'PDF or DOCX, up to 10 MB'}</span>
    </label>
  );
}

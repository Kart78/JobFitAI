import ResumeUploader from '../components/ResumeUploader';
import SkillTags from '../components/SkillTags';
import type { ResumeProfile } from '../types/Resume';

interface Props { profile: ResumeProfile; onUpload: (file: File) => void; onProfileChange: (profile: ResumeProfile) => void; }

export default function Resume({ profile, onUpload, onProfileChange }: Props) {
  const addSkill = () => {
    const skill = window.prompt('Add a skill');
    if (skill?.trim()) onProfileChange({ ...profile, skills: [...new Set([...profile.skills, skill.trim()])] });
  };

  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Resume & Profile</h1><p>Your resume is the primary source for matching and fitment scoring.</p></div></div>
      <div className="two-column">
        <section className="section-card"><h2>Resume</h2><ResumeUploader fileName={profile.fileName} onUpload={onUpload}/><p className="helper">Phase 1 stores the file name and keeps the profile editable. Automatic PDF/DOCX extraction is the next backend integration.</p></section>
        <section className="section-card">
          <h2>Profile Summary</h2>
          <div className="form-grid">
            <label>Full name<input value={profile.fullName} onChange={(e) => onProfileChange({...profile, fullName: e.target.value})}/></label>
            <label>Current headline<input value={profile.headline} onChange={(e) => onProfileChange({...profile, headline: e.target.value})}/></label>
            <label>Total experience<input type="number" value={profile.totalYearsExperience} onChange={(e) => onProfileChange({...profile, totalYearsExperience: Number(e.target.value)})}/></label>
            <label>Location<input value={profile.location} onChange={(e) => onProfileChange({...profile, location: e.target.value})}/></label>
          </div>
        </section>
      </div>
      <section className="section-card"><div className="section-heading"><div><h2>Top Skills</h2><p>Used directly by the deterministic fitment engine.</p></div><button className="button secondary" onClick={addSkill}>Add Skill</button></div><SkillTags skills={profile.skills}/></section>
      <section className="section-card"><h2>Demonstrated Achievements</h2><ul className="clean-list">{profile.achievements.map((a) => <li key={a}>{a}</li>)}</ul></section>
    </div>
  );
}

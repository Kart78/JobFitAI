export default function SkillTags({ skills }: { skills: string[] }) {
  return <div className="skill-tags">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>;
}

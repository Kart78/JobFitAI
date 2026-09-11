const aliases: Record<string, string[]> = {
  'power bi': ['powerbi', 'power bi', 'pbix', 'pbip'],
  'power automate': ['power automate', 'flow'],
  dax: ['dax', 'data analysis expressions'],
  sql: ['sql', 'tsql', 't-sql'],
  python: ['python', 'pyspark'],
  tableau: ['tableau'],
  databricks: ['databricks'],
  snowflake: ['snowflake'],
  'microsoft fabric': ['microsoft fabric', 'fabric'],
  cognos: ['cognos'],
  'rest api': ['rest api', 'restful', 'api integration'],
  governance: ['governance', 'data governance'],
  genai: ['genai', 'generative ai', 'claude', 'llm', 'prompt engineering'],
  healthcare: ['healthcare', 'claims', 'payer', 'provider', 'revenue cycle'],
};

export function normalizeSkill(skill: string): string {
  const value = skill.trim().toLowerCase();
  for (const [canonical, values] of Object.entries(aliases)) {
    if (values.some((alias) => value.includes(alias))) return canonical;
  }
  return value;
}

export function skillOverlap(profileSkills: string[], jobSkills: string[]): string[] {
  const profile = new Set(profileSkills.map(normalizeSkill));
  return [...new Set(jobSkills.map(normalizeSkill))].filter((skill) => profile.has(skill));
}

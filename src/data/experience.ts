export interface Experience {
  date?: string; // Only ongoing roles show a date, e.g. "2026 – Present". Past roles leave it out.
  title: string;
  company: string;
  description?: string;
  advisor?: string;
  advisorUrl?: string;
  manager?: string;
  companyUrl?: string;
}

// Roles and titles as listed on the CV (Oct 2026).
export const experienceData: Experience[] = [
  {
    date: "2026 – Present",
    title: "Co-Lead",
    company: "University of Maryland Tech Policy Hub",
    companyUrl: "https://techpolicyhub.org/",
  },
  {
    date: "2025 – Present",
    title: "Founder and Executive Director",
    company: "Phronesis Institute",
    companyUrl: "https://phronesisresearch.org",
  },
  {
    date: "2022 – Present",
    title: "Research Engineer, Causal AI and ML",
    company: "SAS Institute",
    companyUrl: "https://www.sas.com",
  },
  {
    title: "Regulatory Analyst Intern, AI and Data Policy",
    company: "Federal Reserve Board",
    companyUrl: "https://www.federalreserve.gov",
  },
  {
    title: "Princeton CITP Siegel Public Interest Technology Fellow",
    company: "Consumer Financial Protection Bureau",
    companyUrl: "https://www.consumerfinance.gov",
  },
  {
    title: "Research Assistant, Computational Social Science",
    company: "MIT Sloan School of Management",
    companyUrl: "https://mitsloan.mit.edu",
  },
  {
    title: "Software Engineer, AI/ML",
    company: "U.S. Hunger",
    companyUrl: "https://ushunger.org",
  },
];

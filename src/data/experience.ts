export interface Experience {
  date: string;
  title: string;
  company: string;
  description?: string;
  advisor?: string;
  advisorUrl?: string; // Add this field for hyperlinking advisors
  manager?: string;
  companyUrl?: string;
}

export const experienceData: Experience[] = [
  {
    date: "2022–Present",
    title: "Research Engineer, Causal Inference & Machine Learning",
    company: "SAS Institute",
    description:
      "I design and deploy algorithms that bridge statistical theory and machine learning practice. My work focuses on translating cutting-edge methods in econometrics, causal inference, and AI/ML into scalable, production-ready software that accelerates scientific discovery and decision-making.",
    //advisor: "N/A",
    //manager: "N/A",
    companyUrl: "https://www.sas.com",
  },
  {
    date: "2024–2025",
    title: "Research Assistant",
    company: "Massachusetts Institute of Technology (MIT) - Sloan",
    description:
      "Researched Expected Parrot Domain-Specific Language (EDSL) and agent-based modeling for urban and social dynamics. Designed simulations using Mesa, SimPy, and EDSL to analyze segregation patterns and broader urban phenomena. Developed a capstone project and interactive assignments to illustrate these concepts in real-world applications.",
    advisor: "Dr. Ray Reagans",
    advisorUrl: "https://mitsloan.mit.edu/faculty/directory/ray-reagans",
    //manager: "N/A",
    companyUrl: "https://mitsloan.mit.edu",
  },
  {
    date: "2021–2024",
    title: "JuniorSoftware Engineer, AI/ML",
    company: "U.S. Hunger",
    description:
      "Led automation, software development, and AI research to enhance operations. Developed Python solutions for internal processes, automated software testing, and optimized database management. Built custom API solutions, researched ML/AI applications for business needs, and streamlined workflows, from onboarding to Azure server management.",
    //advisor: "N/A",
    //manager: "N/A",
    companyUrl: "https://ushunger.org",
  },
];


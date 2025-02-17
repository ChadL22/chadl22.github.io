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
    date: "2024–Present",
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
    date: "2022–Present",
    title: "Undergraduate Research Intern",
    company: "SAS Institute",
    description:
      "Advanced research in reinforcement learning, quantum computing, IoB, digital twins, and system design at SAS. Developed RL frameworks in game engines for adaptive AI and cost-efficient training. Explored IoB for behavior interventions and digital twins for simulating social dynamics and medical responses. Assessed quantum computing’s business scalability and led feasibility analysis of a sports performance technology for broader applications.",
    //advisor: "N/A",
    //manager: "N/A",
    companyUrl: "https://www.sas.com",
  },
  {
    date: "2021–2024",
    title: "Technical Support Specialist (AI/ML Developer)",
    company: "U.S. Hunger",
    description:
      "Led automation, software development, and AI research to enhance operations. Developed Python solutions for internal processes, automated software testing, and optimized database management. Built custom API solutions, researched ML/AI applications for business needs, and streamlined workflows, from onboarding to Azure server management.",
    //advisor: "N/A",
    //manager: "N/A",
    companyUrl: "https://ushunger.org",
  },
];


export interface AboutMe {
  name: string;
  title: string;
  institution: string;
  description: string;
  email: string;
  imageUrl?: string;
  blogUrl?: string;
  cvUrl?: string;
  googleScholarUrl?: string;
  twitterUsername?: string;
  githubUsername?: string;
  linkedinUsername?: string;
  funDescription?: string; // Gets placed in the left sidebar
  secretDescription?: string; // Gets placed in the bottom
  altName?: string;
  institutionUrl?: string;
}

export const aboutMe: AboutMe = {
  name: "Sipho C. Langa",
  title: "Research Software Engineer",
  institution: "SAS Institute",
  // Note that links work in the description
  description: `
    <p>Professionally, I am a Research Software Engineer whose work centers on Causal AI, an area of AI research that aims to equip machines with the ability to discern causal relations, reason over counterfactual alternatives, and produce predictions that remain robust to changing conditions. In parallel with my technical work, I engage in policy and governance analysis related to technology through independent and volunteer-based efforts. While separate from my formal role, this work informs how I approach the design and evaluation of systems operating within institutional constraints.</p>
    <p>This perspective carries into my research on the design and governance of institutions and sociotechnical systems. I draw primarily on microeconomic theory and public policy, with mechanism design guiding my analysis of incentives, rules, and information structures, while borrowing methods from ethics, law, mathematics, and computer science.</p>
  `,
  email: "sclanga [at] proton [dot] me",
  imageUrl:
    "my-photo.png",
  //googleScholarUrl: "https://scholar.google.com/citations?user=bWtMl_MAAAAJ",
  githubUsername: "ChadL22",
  twitterUsername: "sc_langa",
  blogUrl: "https://",
  //cvUrl: "https://",
  institutionUrl: "https://www.sas.com/",
  // altName: "",
  // secretDescription: "I like dogs.",
};

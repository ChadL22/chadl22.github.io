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
    <p>I study the design and governance of institutions and sociotechnical systems using microeconomic theory and public policy as primary lenses, with supporting methods from ethics, law, mathematics, and computer science.</p>
    <p>Professionally, I am a Research Software Engineer working on causal inference and causal machine learning, with an emphasis on modeling causal relationships, evaluating counterfactual scenarios, and producing predictions that remain robust under changing conditions. In parallel with my technical work, I engage in policy and governance analysis related to technology through independent and volunteer-based efforts. While separate from my formal role, this work informs how I think about system design, deployment, and institutional constraints.</p>
    <p>Taken together, my technical work and independent research reflect a consistent interest in how formal methods—economic, computational, and legal—can be used to design and evaluate mechanisms that operate within real institutional settings.</p>
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

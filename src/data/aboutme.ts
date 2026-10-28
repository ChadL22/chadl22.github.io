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
  additionalRoles?: { title: string; institution: string; institutionUrl?: string }[];
}

export const aboutMe: AboutMe = {
  name: "Sipho C. Langa",
  title: "Research Software Engineer",
  institution: "SAS Institute",
  // Note that links work in the description
  description: `
    <p>Professionally, I am a Research Software Engineer working in Causal AI, an area of artificial intelligence concerned with modeling cause-and-effect relationships to support reasoning and inference beyond statistical correlation. Alongside my engineering work, I serve as Co-Lead of the <a href="https://techpolicyhub.org/" target="_blank" rel="noopener noreferrer">University of Maryland Tech Policy Hub</a>, where I contribute to research and policy analysis on technology governance.</p>
    <p>More specifically, my research interests sit at the intersection of technology, policy, and law. Drawing on mechanism design, I examine the relationships between emerging technologies, consumer welfare, market competition, and individual rights. I am particularly interested in how existing legal and institutional frameworks apply to emerging technologies, where they fall short, and how they might evolve.</p>
  `,
  email: "sclanga [at] proton [dot] me",
  imageUrl:
    "my-photo.png",
  //googleScholarUrl: "https://scholar.google.com/citations?user=bWtMl_MAAAAJ",
  twitterUsername: "sc_langa",
  //cvUrl: "https://",
  institutionUrl: "https://www.sas.com/",
  additionalRoles: [
    {
      title: "Co-Lead",
      institution: "University of Maryland Tech Policy Hub",
      institutionUrl: "https://techpolicyhub.org/",
    },
    {
      title: "Founder",
      institution: "Phronesis, The Tech Policy Library",
      institutionUrl: "https://phronesisresearch.org",
    },
  ],
  // altName: "",
  // secretDescription: "I like dogs.",
};

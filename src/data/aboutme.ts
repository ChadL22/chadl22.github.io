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
  description:
    "I study the design and governance of institutions and sociotechnical systems using microeconomic theory and public policy as primary lenses, with supporting methods from ethics, law, mathematics, and computer science.",
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

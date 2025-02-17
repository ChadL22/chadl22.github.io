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
  title: "Undergraduate Researcher",
  institution: "University of Central Florida",
  // Note that links work in the description
  description:
    "I spend a lot of time thinking about how we design systems—whether it’s technology, policy, or markets—to better serve people. My work falls under the umbrella of mechanism design for social good, and I pull from cognitive science, artificial intelligence, economics, and even fields like robotics or art, depending on the challenge at hand. At my core, I like to experiment. Ever used a toothbrush to clean your headphones and thought, “this is kinda gross, but it works”? That’s lateral thinking—something I lean into often. Not every idea sticks, but each attempt brings new insights. In the end, I just want to make the world a marginally better place, one well-designed system at a time.",
  email: "sipho [dot] langa [at] ucf [dot] edu",
  imageUrl:
    "my-photo.png",
  //googleScholarUrl: "https://scholar.google.com/citations?user=bWtMl_MAAAAJ",
  githubUsername: "ChadL22",
  twitterUsername: "sc_langa",
  //blogUrl: "https://",
  //cvUrl: "https://",
  institutionUrl: "https://www.ucf.edu/",
  // altName: "",
  // secretDescription: "I like dogs.",
};

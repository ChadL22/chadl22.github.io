import file from "../../content/about.json";
import { tidy } from "./content";

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

// Edit in Pages CMS or content/about.json. The description is HTML, so links work.
export const aboutMe: AboutMe = tidy(file) as AboutMe;

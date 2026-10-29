import file from "../../content/education.json";
import { publishedItems } from "./content";

export interface Education {
  year: string;
  institution: string;
  degree: string;
  minor?: string;
  advisor?: string;
  thesis?: string;
  thesisUrl?: string;
}

// Edit in Pages CMS or content/education.json. Only published items appear on the site.
export const educationData: Education[] = publishedItems<Education>(file);

import file from "../../content/experience.json";
import { publishedItems } from "./content";

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

// Edit in Pages CMS or content/experience.json. Only published items appear on the site.
export const experienceData: Experience[] = publishedItems<Experience>(file);

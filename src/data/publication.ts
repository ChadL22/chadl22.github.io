import file from "../../content/publications.json";
import { publishedItems } from "./content";

export interface Publication {
  year: string;
  conference: string;
  title: string;
  authors: string;
  paperUrl?: string;
  codeUrl?: string;
  bibtex?: string;
  tldr?: string;
  imageUrl?: string;
  award?: string;
}

// Edit in Pages CMS or content/publications.json. Only published items appear on the site.
export const publicationData: Publication[] = publishedItems<Publication>(file);

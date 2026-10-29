import file from "../../content/portfolio.json";
import { publishedItems } from "./content";

export interface Portfolio {
  title: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
  writtenUrl?: string; // Link to written version (paper, article, etc.)
  projectUrl?: string; // Link to live implementation/demo
  codeUrl?: string; // Link to code/notebook
}

// Edit in Pages CMS or content/portfolio.json. Only published items appear on the site.
export const portfolioData: Portfolio[] = publishedItems<Portfolio>(file);

import file from "../../content/news.json";
import { publishedItems } from "./content";

export interface News {
  date: string;
  title: string;
  description: string;
  link?: string;
}

// Edit in Pages CMS or content/news.json. Only published items appear on the site.
export const newsData: News[] = publishedItems<News>(file);

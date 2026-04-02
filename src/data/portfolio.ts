export interface Portfolio {
  title: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
  writtenUrl?: string; // Link to written version (paper, article, etc.)
  projectUrl?: string; // Link to live implementation/demo
  codeUrl?: string; // Link to code/notebook
}

export const portfolioData: Portfolio[] = [
  {
    title: "Misinformation, Philosophy, and Classification on X (Formerly Twitter)",
    description:
      "An interactive notebook exploring the societal problem of misinformation through the lenses of philosophy, mathematics, and societal systems. This project proposes interdisciplinary approaches to improve online communities using classification techniques.",
    technologies: ["Python", "Colab", "Classification Theory"],
    writtenUrl: "https://docs.google.com/document/d/1_WIlHyZYe5LQ7pLxFgsb5EO4yNJXlxFb/edit?usp=sharing&ouid=113622749755892142878&rtpof=true&sd=true",
    codeUrl: "https://colab.research.google.com/drive/1kyAcuL7FNCDhKT3SIKDiXYrnuKTe650v?usp=sharing",
    //imageUrl: "/images/misinformation.jpg",
  },
  {
    title: "Breaking Patterns: Exploring Diversity in Music Recommendations",
    description:
      "A Google Colab notebook proposing an algorithmic framework inspired by Szemerédi's Theorem to break repetitive patterns in music recommendations. This project aims to enhance diversity and serendipity while maintaining user satisfaction on Digital Streaming Platforms. This work is now being contributed to Parachord as a plugin.",
    technologies: ["Python", "Colab", "Szemerédi's Theorem"],
    writtenUrl: "https://docs.google.com/document/d/1JYxX8S7rYhQdkiPSjmJgTpt8XGWvG4JPoeDBlgCPREU/edit?usp=sharing",
    projectUrl: "https://parachord.com/",
    codeUrl: "https://colab.research.google.com/drive/1RjVy8d1PUhN25oEpLf3F4rjkP7cWFZBX?usp=sharing",
    //imageUrl: "/images/music_recommendations.jpg",
  },
];

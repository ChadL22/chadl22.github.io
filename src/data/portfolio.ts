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
    title: "A New Fairness Doctrine or Something Else?",
    description:
      "A policy essay tracing debates over the public's access to information from the FCC's Fairness Doctrine to today's algorithmically curated platforms and AI systems. It weighs paths forward, from a modernized fairness obligation to public-interest duties around recommender design and amplification, and argues the country must decide how it governs access to information in an algorithmic age.",
    technologies: ["First Amendment", "Platform Governance", "Information Policy"],
    writtenUrl: "/papers/fairness-doctrine.pdf",
  },
  {
    title: "Location Technology and the U.S. Fourth Amendment",
    description:
      "A research poster asking how the Supreme Court's reasoning in Chatrie v. United States, which found that obtaining Google Location History through a geofence warrant crossed a constitutional line, extends to other mobile services. It codes the majority, concurrences, and dissents, classifies location data by source, precision, retention, and user involvement, and assesses whether data from ride-sharing apps, social media, streaming platforms, and LLM chats is covered, excluded, or unresolved.",
    technologies: ["Fourth Amendment", "Location Data", "Privacy Law"],
    writtenUrl: "/papers/location-tech-fourth-amendment.pdf",
  },
];

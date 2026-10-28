import { Experience } from "@/data/experience";

export function ExperienceEntry({ experience }: { experience: Experience }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-base text-zinc-900 leading-snug">
          {experience.title}
        </h3>
        {experience.date && (
          <span className="text-xs text-zinc-500 whitespace-nowrap">{experience.date}</span>
        )}
      </div>
      <p className="text-sm text-zinc-600 mt-0.5">
        {experience.companyUrl ? (
          <a
            href={experience.companyUrl}
            className="hover:text-zinc-900 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {experience.company}
          </a>
        ) : (
          experience.company
        )}
      </p>
      {experience.advisor && (
        <p className="text-sm text-zinc-500 italic mt-1">
          Advisor:{" "}
          {experience.advisorUrl ? (
            <a
              href={experience.advisorUrl}
              className="hover:text-zinc-900 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {experience.advisor}
            </a>
          ) : (
            experience.advisor
          )}
        </p>
      )}
      {experience.manager && (
        <p className="text-sm text-zinc-500 italic mt-1">Manager: {experience.manager}</p>
      )}
      {experience.description && (
        <p className="text-sm text-zinc-600 leading-relaxed mt-2">{experience.description}</p>
      )}
    </div>
  );
}

import { Education } from "@/data/education";

export function EducationEntry({ education }: { education: Education }) {
  return (
    <div className="px-5 py-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4">
        <h3 className="font-serif text-base text-zinc-900 leading-snug">
          {education.institution}
        </h3>
        {education.year && (
          <span className="text-xs text-zinc-500 whitespace-nowrap">{education.year}</span>
        )}
      </div>
      <p className="text-sm text-zinc-600 mt-0.5">{education.degree}</p>
      {education.minor && (
        <p className="text-sm text-zinc-600 whitespace-nowrap">{education.minor}</p>
      )}
      {education.advisor && (
        <p className="text-sm text-zinc-500 italic mt-1">Advisor: {education.advisor}</p>
      )}
      {education.thesis && (
        <p className="text-sm text-zinc-500 italic mt-1">
          Thesis:{" "}
          {education.thesisUrl ? (
            <a
              href={education.thesisUrl}
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {education.thesis}
            </a>
          ) : (
            education.thesis
          )}
        </p>
      )}
    </div>
  );
}

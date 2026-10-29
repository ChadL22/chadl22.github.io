import Image from "next/image";
import { Github, Linkedin, Twitter, ArrowUpRight, GraduationCap, Newspaper } from "lucide-react";
import { AboutMe } from "@/data/aboutme";
import { EmailIconLink } from "@/components/email-icon-link";

interface ProfileSectionProps {
  aboutMe: AboutMe;
}

const iconLink =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white/60 text-zinc-600 hover:text-zinc-900 hover:border-amber-600 transition-colors duration-300";

// Same circle styling, stretched into a pill with a word so it can't be mistaken for another icon
const labeledLink =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-white/60 pl-3 pr-3.5 text-xs font-medium tracking-wide text-zinc-600 hover:text-zinc-900 hover:border-amber-600 transition-colors duration-300";

export function ProfileSection({ aboutMe }: ProfileSectionProps) {
  if (!aboutMe) {
    return null;
  }

  const roles = [
    { title: aboutMe.title, institution: aboutMe.institution, institutionUrl: aboutMe.institutionUrl },
    ...(aboutMe.additionalRoles ?? []),
  ];

  const contactIcons = (
    <>
      <EmailIconLink obfuscated={aboutMe.email} className={iconLink} />
      {aboutMe.twitterUsername && (
        <a
          href={`https://twitter.com/${aboutMe.twitterUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Twitter: @${aboutMe.twitterUsername}`}
          title={`@${aboutMe.twitterUsername}`}
          className={iconLink}
        >
          <Twitter size={18} />
        </a>
      )}
      {aboutMe.googleScholarUrl && (
        <a
          href={aboutMe.googleScholarUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Google Scholar"
          title="Google Scholar"
          className={iconLink}
        >
          <GraduationCap size={18} />
        </a>
      )}
      {aboutMe.githubUsername && (
        <a
          href={`https://github.com/${aboutMe.githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className={iconLink}
        >
          <Github size={18} />
        </a>
      )}
      {aboutMe.linkedinUsername && (
        <a
          href={`https://www.linkedin.com/in/${aboutMe.linkedinUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
          className={iconLink}
        >
          <Linkedin size={18} />
        </a>
      )}
      {aboutMe.newsletterUrl && (
        <a
          href={aboutMe.newsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Subscribe to the monthly newsletter"
          className={labeledLink}
        >
          <Newspaper size={16} aria-hidden="true" />
          Newsletter
        </a>
      )}
    </>
  );

  return (
    // Phones: headshot + icons on the left, name + roles on the right.
    // Desktop: headshot, name, roles, then icons, stacked in the left column.
    <div className="md:sticky top-12 flex flex-row md:flex-col gap-5 md:gap-8">
      <div className="w-[38%] max-w-[11rem] md:max-w-none md:w-full flex-shrink-0">
        {aboutMe.imageUrl && (
          <div className="relative w-full max-h-[45vh] md:w-[65%] aspect-[3/4]">
            <Image
              src={aboutMe.imageUrl}
              alt={aboutMe.name}
              fill
              priority
              className="object-cover rounded-xl"
            />
          </div>
        )}

        {/* Phones: contact icons sit under the headshot */}
        <div className="flex flex-wrap gap-2 mt-3 md:hidden">{contactIcons}</div>
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-wide leading-tight mb-3">
          {aboutMe.name}
        </h1>
        {aboutMe.altName && (
          <p className="text-zinc-600 text-md leading-relaxed tracking-wide mb-6">
            {aboutMe.altName}
          </p>
        )}
        <ul className="space-y-3 md:space-y-4" aria-label="Current roles">
          {roles.map((role, index) => (
            <li
              key={index}
              className="border-l-2 border-amber-600 pl-3 text-[13px] sm:text-sm leading-snug"
            >
              <p className="text-zinc-900 font-medium">{role.title}</p>
              <p className="text-zinc-600">
                {role.institutionUrl ? (
                  <a
                    href={role.institutionUrl}
                    className="hover:text-zinc-900 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {role.institution}
                  </a>
                ) : (
                  role.institution
                )}
              </p>
            </li>
          ))}
        </ul>
        {/* Desktop: contact icons sit under the roles */}
        <div className="hidden md:flex flex-wrap gap-2 mt-6">{contactIcons}</div>
        {aboutMe.cvUrl && (
          <a
            href={aboutMe.cvUrl}
            className="group mt-6 inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowUpRight
              size={12}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
            />
            <span className="tracking-wider uppercase">CV</span>
          </a>
        )}
      </div>
    </div>
  );
}

import { EducationEntry } from "@/components/education-entry";
import { educationData } from "@/data/education";
import { PublicationEntry } from "@/components/publication-entry";
import { publicationData } from "@/data/publication";
import { ProfileSection } from "@/components/profile-section";
import { aboutMe } from "@/data/aboutme";
import { NewsList } from "@/components/news-list";
import { newsData } from "@/data/news";
import { ExperienceEntry } from "@/components/experience-entry";
import { experienceData } from "@/data/experience";
import { PortfolioEntry } from "@/components/portfolio-entry";
import { portfolioData } from "@/data/portfolio";
import { SectionCard } from "@/components/section-card";
import { PagedCard } from "@/components/paged-card";
import { sectionOrder, Section } from "@/data/section-order";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFCF8]">
      <div className="max-w-screen-lg mx-auto px-5 sm:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Left Column - Fixed Info */}
          <div className="col-span-12 md:col-span-4 space-y-12 mb-8 md:mb-0">
            <div className="md:sticky top-12 space-y-8">
              <ProfileSection aboutMe={aboutMe} />
            </div>
          </div>

          {/* Right Column - Scrolling Content: every section shares one heading style and card */}
          <div className="col-span-12 md:col-span-7 md:col-start-6 space-y-14">
            {aboutMe.description && (
              <SectionCard id="about" title="About Me" boxed={false}>
                <div
                  className="font-serif text-sm leading-relaxed text-zinc-700 space-y-4 [&_a]:underline [&_a]:text-zinc-900 [&_a:hover]:text-zinc-600"
                  dangerouslySetInnerHTML={{ __html: aboutMe.description }}
                />
              </SectionCard>
            )}

            {sectionOrder.map((sectionName) => {
              switch (sectionName) {
                case Section.News:
                  return (
                    newsData.length > 0 && (
                      <SectionCard key={sectionName} id="news" title="News" boxed={false}>
                        <NewsList items={newsData} />
                      </SectionCard>
                    )
                  );
                case Section.Education:
                  return (
                    educationData.length > 0 && (
                      <SectionCard key={sectionName} id="education" title="Education">
                        {educationData.map((education, index) => (
                          <EducationEntry key={index} education={education} />
                        ))}
                      </SectionCard>
                    )
                  );
                case Section.Publication:
                  return (
                    publicationData.length > 0 && (
                      <SectionCard key={sectionName} id="publications" title="Publications">
                        {publicationData.map((publication, index) => (
                          <PublicationEntry key={index} publication={publication} />
                        ))}
                      </SectionCard>
                    )
                  );
                case Section.Experience:
                  return (
                    experienceData.length > 0 && (
                      <SectionCard key={sectionName} id="experience" title="Experience" boxed={false}>
                        {/* Three roles per page, current roles first */}
                        <PagedCard
                          ariaLabel="Experience"
                          bodyHeight="auto"
                          pages={Array.from(
                            { length: Math.ceil(experienceData.length / 3) },
                            (_, p) => experienceData.slice(p * 3, p * 3 + 3)
                          ).map((list) => ({
                            label: list.every((e) => e.date) ? "Current" : "Previous",
                            content: (
                              <div className="[&>*]:border-b [&>*]:border-zinc-200">
                                {list.map((experience, index) => (
                                  <ExperienceEntry key={index} experience={experience} />
                                ))}
                              </div>
                            ),
                          }))}
                        />
                      </SectionCard>
                    )
                  );
                case Section.Portfolio:
                  return (
                    portfolioData.length > 0 && (
                      <SectionCard key={sectionName} id="research-projects" title="Research Projects" boxed={false}>
                        {/* Sized to the longest project so there's no empty band under the text */}
                        <PagedCard
                          ariaLabel="Research projects"
                          bodyHeight="auto"
                          pages={portfolioData.map((portfolio, index) => ({
                            label: `${index + 1} of ${portfolioData.length}`,
                            content: (
                              <div className="border-b border-zinc-200">
                                <PortfolioEntry portfolio={portfolio} />
                              </div>
                            ),
                          }))}
                        />
                      </SectionCard>
                    )
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

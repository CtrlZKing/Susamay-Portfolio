import { useMemo } from 'react';
import { Box, Sparkles, Monitor, Layers } from 'lucide-react';
import { Skill } from '../../types/portfolio.ts';

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  // Group skills by category if present
  const categorizedSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    skills.forEach((skill) => {
      const cat = skill.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    return groups;
  }, [skills]);

  return (
    <section id="skills" className="py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-zinc-200/80">
      <div className="space-y-2 mb-12">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
          Technical Expertise
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
          Software &amp; Creative Skills
        </h2>
        <p className="text-sm text-zinc-500 max-w-xl">
          An overview of core 3D workflows, digital sculpting techniques, and rendering pipelines honed across commercial and independent projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((skill, index) => (
          <div
            key={skill.id || index}
            className="p-6 bg-zinc-50/50 border border-zinc-200/80 rounded-xs space-y-3 hover:border-zinc-400 hover:bg-white transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>{skill.category}</span>
                <span className="text-zinc-700 font-medium">
                  {skill.proficiency_label}
                </span>
              </div>

              <h3 className="font-display text-base font-semibold text-zinc-900">
                {skill.name}
              </h3>

              <p className="text-xs text-zinc-600 leading-relaxed">
                {skill.description}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-200/50 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span>Production Tested</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

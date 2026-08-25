import { Section, Container, Badge, GlassCard } from '../design-system/primitives';
import FounderCard from './cards/FounderCard';
import { CLOUDINARY_IMAGES } from '../cloudinaryImages';
import './About.css';

const FOUNDERS = [
  { img: CLOUDINARY_IMAGES.founder1, name: 'Narendra Singh', role: 'CEO & Founder', exp: '11 Years', tag: 'Business execution', bio: 'Leads overall strategy and operations. Previously managed projects at a top HVAC contractor, overseeing installations for major commercial clients across India.', links: { linkedin: 'https://linkedin.com', email: 'narendrasin87@gmail.com' }, badges: ['Networking', 'Management', 'Global'] },
  { img: CLOUDINARY_IMAGES.founder2, name: 'Ashish Rawat', role: 'COO', exp: '4 Years', tag: 'AI & HVAC Systems', bio: 'Built the simulation engine and AI-powered BTU calculator at the core of our platform. Strategic business thinker with strong technical background in HVAC system design.', links: { linkedin: 'https://www.linkedin.com/in/ashish-rawat-88087a354/', email: 'business.ashish00@gmail.com' }, badges: ['Designer', 'Project Management', 'Agentic AI Expert'] },
  { img: CLOUDINARY_IMAGES.founder3, name: 'Taniya Tiwari', role: 'CFO', exp: '3 Years', tag: 'Finance & Operations', bio: 'Manages all financial planning, budgeting, and project management. Skilled in optimizing project timelines and budgets while ensuring high-quality installations.', links: { linkedin: 'https://www.linkedin.com/in/taniya-tiwari-5a6a2737b/', email: 'taniyatiwari003@gmail.com' }, badges: ['Finance', 'Accounting', 'Media'] },
];

const QUICK_STATS = [{ val: '2025', label: 'Founded' }, { val: '3', label: 'Cities Active' }, { val: '₹10Cr+', label: 'Systems Installed' }];

const VALUES = [
  { icon: '🎯', title: 'Precision First', desc: 'Every recommendation is calculated, not guessed.' },
  { icon: '🔓', title: 'Transparency', desc: 'Free tool, honest advice. We earn trust before we earn your business.' },
  { icon: '🌏', title: 'Made for India', desc: 'Designed around Indian tariff rates, climate zones, and room layouts.' },
];

/**
 * About — Phase 6. Same content/copy/founders/stats/values as the
 * original AboutSection. Structure moved to primitives (Section,
 * Container, Badge) + tokenized CSS; the quick-stats pills and
 * mission panel are now GlassCard instances instead of hand-styled
 * divs. FounderCard (extracted separately) joins the Phase 5 glass +
 * 3D-tilt card family.
 */
export default function About() {
  return (
    <Section id="about" className="cw-about">
      <Container>
        <div className="cw-about__header">
          <div>
            <Badge>ABOUT US</Badge>
            <h2 className="section-title">We built,<br />Because you<br />needed it.</h2>
            <p className="section-sub cw-about__intro">
              Climewave was founded because we see people spend lakhs installing systems the wrong way — because nobody calculated it right upfront.
            </p>
          </div>
          <div className="cw-about__quick-stats">
            {QUICK_STATS.map((s) => (
              <GlassCard key={s.label} className="cw-about__quick-stat">
                <div className="cw-about__quick-stat-val">{s.val}</div>
                <div className="cw-about__quick-stat-label">{s.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="cw-about__leadership">
          <div className="cw-about__leadership-spotlight" aria-hidden="true" />
          <div className="cw-about__founder-slot">
            <FounderCard founder={FOUNDERS[0]} index={0} variant="founder" />
          </div>
          <div className="cw-about__executives">
            <FounderCard founder={FOUNDERS[1]} index={1} variant="executive" />
            <FounderCard founder={FOUNDERS[2]} index={2} variant="executive" />
          </div>
        </div>

        <GlassCard className="cw-about__mission" strong>
          <div>
            <Badge>OUR MISSION</Badge>
            <h3 className="cw-about__mission-title">No one should buy the wrong AC because they didn't have the right information.</h3>
            <p className="cw-about__mission-desc">We're making professional-grade HVAC analysis accessible to every homeowner, architect, and contractor in India.</p>
          </div>
          <div className="cw-about__values">
            {VALUES.map((v) => (
              <div key={v.title} className="cw-about__value">
                <div className="cw-about__value-icon">{v.icon}</div>
                <div>
                  <div className="cw-about__value-title">{v.title}</div>
                  <div className="cw-about__value-desc">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </Container>
    </Section>
  );
}

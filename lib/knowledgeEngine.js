import profile from '@/data/profile.json';

const PROJECT_SLIDES = profile.projects.length;
const HAS_RESEARCH   = profile.research && profile.research.length > 0;
const ABOUT_SLIDES   = 1;

const INTENT_MAP = {
  about: 2,
  projects: 3 + ABOUT_SLIDES,
  experience: 3 + ABOUT_SLIDES + PROJECT_SLIDES,
  achievements: 4 + ABOUT_SLIDES + PROJECT_SLIDES,
  research: HAS_RESEARCH ? (5 + ABOUT_SLIDES + PROJECT_SLIDES) : null,
  certifications: 5 + ABOUT_SLIDES + (HAS_RESEARCH ? 1 : 0) + PROJECT_SLIDES,
  contact: 7 + ABOUT_SLIDES + (HAS_RESEARCH ? 1 : 0) + PROJECT_SLIDES,
};

/* ─── Intent definitions ─────────────────────────────────── */

const intents = [
  /* ── Greeting ── */
  {
    id: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good', 'morning', 'evening', 'afternoon', 'sup', 'yo'],
    build() {
      return {
        text: `Hey there! 👋 I'm ${profile.name.full}'s AI assistant. I can tell you about cybersecurity projects, achievements, certifications, work experience, skills, CTF rankings, and more. What would you like to know?`,
        actions: [
          { type: 'chip', label: '🛡️ Projects', query: 'Show cybersecurity projects' },
          { type: 'chip', label: '🏆 Achievements', query: 'What are Raj\'s achievements?' },
          { type: 'chip', label: '📜 Certifications', query: 'What certifications does Raja Mourya have?' },
        ],
      };
    },
  },

  /* ── About ── */
  {
    id: 'about',
    keywords: ['about', 'who', 'tell', 'introduce', 'raja', 'mourya', 'yourself', 'background', 'profile', 'bio', 'summary'],
    build() {
      const loc = profile.location;
      return {
        text: `**${profile.name.full}** — ${profile.roles.detailed}\n\n${profile.bio}\n\n📍 Based in ${loc.based} · Available ${loc.availability}\n📧 ${profile.email}`,
        actions: [
          { type: 'link', label: '📄 View Resume', href: '/assets/Raja_Mourya_Cybersecurity_Resume.pdf' },
          { type: 'link', label: '💼 LinkedIn', href: getSocial('LinkedIn') },
          { type: 'navigate', label: '👤 About Section', section: 2 },
        ],
      };
    },
  },

  /* ── Skills / Tools ── */
  {
    id: 'skills',
    keywords: ['skills', 'tools', 'technologies', 'tech', 'stack', 'expertise', 'proficient', 'know', 'capable', 'kali', 'burp', 'python', 'linux', 'owasp', 'reconnaissance', 'malware', 'active', 'directory'],
    build() {
      const skillList = profile.skills.map(s => `• ${s}`).join('\n');
      return {
        text: `**Core Cybersecurity Skills:**\n\n${skillList}\n\n${profile.name.first} specialises in VAPT, DFIR, and AI-driven security — with hands-on expertise in Kali Linux, Burp Suite, and Python/FastAPI.`,
        actions: [
          { type: 'navigate', label: '👤 About Section', section: 2 },
          { type: 'chip', label: '💼 Experience', query: 'Tell me about work experience' },
        ],
      };
    },
  },

  /* ── Projects ── */
  {
    id: 'projects',
    keywords: ['projects', 'project', 'work', 'built', 'created', 'portfolio', 'showcase', 'app', 'application'],
    build() {
      const projText = profile.projects.map(p =>
        `**${p.title}** — ${p.type}\n${p.desc}\nTech: ${p.tech.join(', ')}`
      ).join('\n\n');
      return {
        text: `**Featured Projects:**\n\n${projText}`,
        actions: [
          { type: 'navigate', label: '🚀 View Projects', section: 3 },
          ...profile.projects.filter(p => p.link).map(p => ({
            type: 'link', label: `🔗 ${p.title}`, href: p.link,
          })),
        ],
      };
    },
  },

  /* ── KAVACH AI ── */
  {
    id: 'kavach',
    keywords: ['kavach', 'kavach ai', 'ai security', 'ai cybersecurity', 'ai tool'],
    build() {
      const kavach = profile.projects.find(p => p.title.toLowerCase().includes('kavach'));
      if (!kavach) return fallbackResponse();
      return {
        text: `**${kavach.title}** — ${kavach.subtitle}\n\n${kavach.desc}\n\n**Tech Stack:** ${kavach.tech.join(', ')}`,
        actions: [
          kavach.link ? { type: 'link', label: '🔗 View Project', href: kavach.link } : null,
          { type: 'navigate', label: '🚀 Projects Section', section: 3 },
        ].filter(Boolean),
      };
    },
  },

  /* ── Certifications (stored as "publications" in profile.json) ── */
  {
    id: 'certifications',
    keywords: ['certifications', 'certification', 'certified', 'certs', 'cert', 'credential', 'credentials', 'ceh', 'ethical', 'hacker', 'bja', 'cnsp', 'dfe', 'forensics'],
    build() {
      const certText = profile.publications.map(c =>
        `• **${c.title}** — ${c.platform} (${c.year})`
      ).join('\n');
      return {
        text: `**Professional Certifications:**\n\n${certText}`,
        actions: [
          { type: 'navigate', label: '📜 Certifications Section', section: 5 + (HAS_RESEARCH ? 1 : 0) + PROJECT_SLIDES },
          { type: 'link', label: '💼 LinkedIn', href: getSocial('LinkedIn') },
        ],
      };
    },
  },

  /* ── Achievements ── */
  {
    id: 'achievements',
    keywords: ['achievements', 'achievement', 'awards', 'award', 'accomplish', 'accomplishments', 'positions', 'finalist', 'winner', 'hackathon', 'compete', 'competition'],
    build() {
      const achText = profile.achievements.map(a =>
        `• **${a.title}** — ${a.platform} (${a.year})\n  ${a.desc}`
      ).join('\n');
      return {
        text: `**Key Achievements:**\n\n${achText}`,
        actions: [
          { type: 'navigate', label: '🏆 Achievements Section', section: 4 + PROJECT_SLIDES },
        ],
      };
    },
  },

  /* ── CTF Rankings ── */
  {
    id: 'ctf',
    keywords: ['ctf', 'capture', 'flag', 'tryhackme', 'hackthebox', 'htb', 'thm', 'ranking', 'rank', 'leaderboard', 'top'],
    build() {
      const stats = profile.stats.map(s => `• **${s.value}** — ${s.label}`).join('\n');
      const ctfAchievements = profile.achievements
        .filter(a => a.platform.toLowerCase().includes('ctf'))
        .map(a => `• **${a.title}** — ${a.platform} (${a.year})`)
        .join('\n');
      return {
        text: `**CTF & Platform Rankings:**\n\n${stats}${ctfAchievements ? `\n\n**CTF Competitions:**\n${ctfAchievements}` : ''}`,
        actions: [
          { type: 'link', label: '🔗 TryHackMe', href: getSocial('TryHackMe') },
          { type: 'link', label: '🔗 HackTheBox', href: getSocial('HackTheBox') },
        ],
      };
    },
  },

  /* ── Experience ── */
  {
    id: 'experience',
    keywords: ['experience', 'work', 'job', 'career', 'employment', 'intern', 'internship', 'freelance', 'consultant', 'cyber cell', 'parul', 'police'],
    build() {
      const expText = profile.experience.map(e =>
        `**${e.role}** @ ${e.company}\n${e.type} · ${e.location} · ${e.period}${e.periodEnd ? ' – ' + e.periodEnd : ''}\n${e.desc}`
      ).join('\n\n');
      return {
        text: `**Professional Experience:**\n\n${expText}`,
        actions: [
          { type: 'navigate', label: '💼 Experience Section', section: 3 + PROJECT_SLIDES },
          { type: 'link', label: '📄 View Resume', href: '/assets/Raja_Mourya_Cybersecurity_Resume.pdf' },
        ],
      };
    },
  },

  /* ── Research ── */
  {
    id: 'research',
    keywords: ['research', 'paper', 'publication', 'journal', 'academic', 'bluetooth', 'wearable', 'ijsrem'],
    build() {
      const resText = profile.research.map(r =>
        `**${r.title}**\n${r.platform} (${r.year})\n${r.desc}`
      ).join('\n\n');
      return {
        text: `**Research Publications:**\n\n${resText}`,
        actions: [
          ...(HAS_RESEARCH ? [{ type: 'navigate', label: '📄 Research Section', section: 5 + PROJECT_SLIDES }] : []),
          ...profile.research.filter(r => r.link).map(r => ({
            type: 'link', label: `🔗 Read Paper`, href: r.link,
          }))
        ].filter(Boolean),
      };
    },
  },

  /* ── Contact ── */
  {
    id: 'contact',
    keywords: ['contact', 'reach', 'email', 'mail', 'connect', 'hire', 'hiring', 'message', 'get in touch', 'collaborate'],
    build() {
      const socialLinks = profile.socials.map(s => `• [${s.label}](${s.href})`).join('\n');
      return {
        text: `**Get in Touch:**\n\n📧 **Email:** ${profile.email}\n📍 **Location:** ${profile.location.based}\n🌍 **Availability:** ${profile.location.availability}\n\n**Social Profiles:**\n${socialLinks}\n\n${profile.available ? '✅ Currently **available** for VAPT engagements & full-time roles.' : ''}`,
        actions: [
          { type: 'link', label: '📧 Send Email', href: `mailto:${profile.email}` },
          { type: 'link', label: '💼 LinkedIn', href: getSocial('LinkedIn') },
          { type: 'link', label: '🐙 GitHub', href: getSocial('GitHub') },
          { type: 'navigate', label: '📬 Contact Section', section: 7 + (HAS_RESEARCH ? 1 : 0) + PROJECT_SLIDES },
        ],
      };
    },
  },

  /* ── Resume ── */
  {
    id: 'resume',
    keywords: ['resume', 'cv', 'curriculum', 'vitae', 'download', 'pdf'],
    build() {
      return {
        text: `You can view or download **${profile.name.full}'s** cybersecurity resume below. It covers professional experience, certifications, skills, and achievements.`,
        actions: [
          { type: 'link', label: '📄 View Resume', href: '/assets/Raja_Mourya_Cybersecurity_Resume.pdf' },
          { type: 'link', label: '💼 LinkedIn', href: getSocial('LinkedIn') },
        ],
      };
    },
  },

  /* ── Socials ── */
  {
    id: 'socials',
    keywords: ['social', 'socials', 'github', 'linkedin', 'links', 'profiles', 'online'],
    build() {
      return {
        text: `**Connect with ${profile.name.full}:**\n\n${profile.socials.map(s => `• **${s.label}:** ${s.href}`).join('\n')}`,
        actions: profile.socials.map(s => ({
          type: 'link', label: `🔗 ${s.label}`, href: s.href,
        })),
      };
    },
  },

  /* ── Availability ── */
  {
    id: 'availability',
    keywords: ['available', 'availability', 'open', 'freelance', 'full-time', 'part-time', 'remote', 'hire'],
    build() {
      return {
        text: profile.available
          ? `✅ ${profile.name.full} is **currently available** for:\n\n• Freelance VAPT consulting engagements\n• Full-time cybersecurity roles\n• Security research collaborations\n\n📍 Based in ${profile.location.based}, available ${profile.location.availability}.`
          : `${profile.name.full} is not currently available for new engagements. Feel free to connect on LinkedIn for future opportunities.`,
        actions: [
          { type: 'link', label: '📧 Send Email', href: `mailto:${profile.email}` },
          { type: 'link', label: '💼 LinkedIn', href: getSocial('LinkedIn') },
        ],
      };
    },
  },
];

/* ─── Helpers ─────────────────────────────────────────────── */

function getSocial(label) {
  const s = profile.socials.find(s => s.label.toLowerCase() === label.toLowerCase());
  return s ? s.href : '#';
}

function fallbackResponse() {
  return {
    text: `I'm not sure I understand that question. Here are some things I can help with:\n\n• Tell me about Raja Mourya\n• Show cybersecurity projects\n• What certifications does Raj have?\n• What are Raj's achievements?\n• Show CTF rankings\n• How can I contact Raja Mourya?\n• Show resume`,
    actions: [
      { type: 'chip', label: '👤 About Raj', query: 'Tell me about Raja Mourya' },
      { type: 'chip', label: '🛡️ Projects', query: 'Show cybersecurity projects' },
      { type: 'chip', label: '📧 Contact', query: 'How can I contact Raja Mourya?' },
    ],
  };
}

/* ─── Intent matcher ──────────────────────────────────────── */

export function matchIntent(userMessage) {
  const input = userMessage.toLowerCase().trim();
  const tokens = input.split(/\s+/);

  let bestScore = 0;
  let bestIntent = null;

  for (const intent of intents) {
    let score = 0;
    for (const keyword of intent.keywords) {
      /* Support multi-word keywords (e.g. "kavach ai") */
      if (keyword.includes(' ')) {
        if (input.includes(keyword)) score += 3;
      } else {
        for (const token of tokens) {
          if (token === keyword) { score += 2; break; }
          if (token.includes(keyword) || keyword.includes(token)) { score += 1; break; }
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestScore >= 1 && bestIntent) {
    return bestIntent.build();
  }
  return fallbackResponse();
}

/* ─── Suggested questions (exported for the UI) ──────────── */

export const suggestedQuestions = [
  'Tell me about Raja Mourya',
  'Show cybersecurity projects',
  'What certifications does Raja Mourya have?',
  "What are Raj's achievements?",
  'Show CTF rankings',
  'Explain KAVACH AI',
  'What cybersecurity tools does Raj use?',
  'How can I contact Raja Mourya?',
  'Show resume',
];

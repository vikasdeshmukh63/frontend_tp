import type { JobPostDraft } from "@/types/job-post-draft";

/** Prefilled values simulating AI extraction from a JD (replace with API later). */
export function getMockExtractedJobPost(): JobPostDraft {
  return {
    jobTitle: "MERN Stack Developer",
    role: "Full-stack Developer",
    seniority: "Mid-level",
    experienceMin: "3",
    experienceMax: "6",
    employmentType: "Full-time",
    salaryCurrency: "INR",
    salaryMin: "1200000",
    salaryMax: "2200000",
    salaryFrequency: "Yearly",
    workArrangement: "hybrid",
    hybridPolicy: "3 days/week WFH",
    locations: ["Mumbai, Maharashtra"],
    jobSummary:
      "Join a growing engineering team to build scalable, high-performance web applications using the MERN stack. You will work across the stack with modern tooling, code reviews, and a strong focus on quality.",
    responsibilities: `• Design, develop, and maintain full-stack web applications using the MERN stack
• Build reusable, efficient, and well-documented React components
• Implement secure REST APIs with Node.js and Express
• Collaborate with product and design on features end-to-end`,
    perks: `• Competitive salary
• Hybrid work (3 days office, 2 days remote)
• Flexible work
• Learning budget (₹50,000/year for courses & certifications)
• Health insurance (comprehensive coverage for self + family)
• Clear career path to Tech Lead / Architect roles
• Hackathons, offsites, and knowledge-sharing sessions`,
    skills: [
      { id: "1", name: "MongoDB", mandatory: true },
      { id: "2", name: "Express.js", mandatory: true },
      { id: "3", name: "ReactJS", mandatory: true },
      { id: "4", name: "NodeJS", mandatory: true },
      { id: "5", name: "JavaScript", mandatory: true },
      { id: "6", name: "Microservices", mandatory: false },
      { id: "7", name: "RabbitMQ", mandatory: false },
      { id: "8", name: "React Native", mandatory: false },
    ],
    minEducation: "",
    courseSpecialization: "Bachelor of Science in Computer Science",
    additionalRequirements: `• 3–6 years of experience (as advertised)
• Immediate / 30 days joining
• Include GitHub/portfolio link with application (strong GitHub profile or open-source contributions preferred)`,
    status: "Published",
    applicationDeadline: "",
    employmentStartDate: "",
    keyCallout: "Do not contact us via LinkedIn or email. Just apply here",
    mapsUrl: "https://maps.google.com/...",
  };
}

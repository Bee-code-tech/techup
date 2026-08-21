export const site = {
  name: "TechUp Academy",
  shortName: "TechUp",
  tagline:
    "Empowering Nigeria's Tech Talent with skills that matter in the global digital economy.",
  description:
    "TechUp Academy is a Nigerian ed-tech platform offering free bootcamps, scholarships, and career-ready courses in web development, design, data analytics, and more.",
  email: "techupacademy22@gmail.com",
  scholarshipFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSd8r6SQAiOhoISAZBF4bIfQ7y7VIVnHbt8CxUQ2_VjnoEgVdg/viewform",
  whatsappGroupUrl: "https://chat.whatsapp.com/LgXHouemXT4AxFV0F6TcO5",
  whatsappChatUrl: "https://wa.link/nh1rt9",
  adminEmail: "techupacademy22@gmail.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://techupacademyng.com",
  locale: "en_NG",
} as const;

export const socialLinks = [
  {
    name: "X",
    href: "https://x.com/techupacademyng",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/techupacademyinnovations",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1E1g8bLajo/",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/techup-academy-innovations/",
  },
] as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/bootcamp", label: "Bootcamp" },
  { href: "/scholarship", label: "Scholarship" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const pageSeo = {
  home: {
    title: "TechUp Academy | Free Tech Bootcamp & Digital Skills Training",
    description:
      "Master practical tech skills with TechUp Academy — free bootcamps, scholarships, and industry-focused courses designed for beginners and career switchers in Nigeria.",
    path: "/",
  },
  bootcamp: {
    title: "Free Bootcamp",
    description:
      "Join TechUp Academy’s free intensive tech bootcamp. Build real projects, learn with mentors, and start your tech career with zero tuition.",
    path: "/bootcamp",
  },
  scholarship: {
    title: "Scholarship",
    description:
      "Apply for TechUp Academy scholarships that fund digital skills training for motivated learners across Nigeria.",
    path: "/scholarship",
  },
  courses: {
    title: "Courses",
    description:
      "Explore TechUp Academy courses in web development, UI/UX design, data analytics, and more — built for career-ready outcomes.",
    path: "/courses",
  },
  about: {
    title: "About",
    description:
      "Learn about TechUp Academy’s mission to empower Nigeria’s next generation of tech talent through training, mentorship, and TiNLab innovation.",
    path: "/about",
  },
  contact: {
    title: "Contact",
    description:
      "Get in touch with TechUp Academy for bootcamp enrollment, scholarship questions, partnerships, and support.",
    path: "/contact",
  },
} as const;

export const disciplines = [
  "Web Development",
  "Data Analytics",
  "Graphic Design",
  "Cybersecurity",
  "UI/UX Design",
  "Video Editing",
] as const;

export const courses = [
  {
    title: "Web Development",
    category: "FULL-STACK",
    description:
      "Build modern web applications from frontend to backend with real client-ready projects.",
    duration: "12 Weeks",
    originalPrice: "₦150,000",
    price: "₦30,000",
    image: "/course-web.jpg",
  },
  {
    title: "UI/UX Design",
    category: "CREATIVE ARTS",
    description:
      "Design intuitive digital products with research-driven UX and polished UI systems.",
    duration: "12 Weeks",
    originalPrice: "₦150,000",
    price: "₦30,000",
    image: "/course-ux.jpg",
  },
  {
    title: "Data Analytics",
    category: "BUSINESS INTELLIGENCE",
    description:
      "Transform raw data into actionable business insights using industry-standard tools.",
    duration: "12 Weeks",
    originalPrice: "₦150,000",
    price: "₦30,000",
    image: "/course-data.jpg",
  },
  {
    title: "Graphic Design",
    category: "CREATIVE ARTS",
    description:
      "Unlock creative communication through brand systems, layout, and visual storytelling.",
    duration: "12 Weeks",
    originalPrice: "₦150,000",
    price: "₦30,000",
    image: "/course-graphic.jpg",
  },
] as const;

export const comingSoonCourses = [
  {
    title: "Digital Marketing",
    topics: "Content Strategy • SEO • Social Media",
    image: "/soon-marketing.jpg",
  },
  {
    title: "Video Editing",
    topics: "Motion Graphics • Premiere Pro • VFX",
    image: "/soon-video.jpg",
  },
  {
    title: "Cybersecurity",
    topics: "Threat Defense • Networks • Ethical Hacking",
    image: "/soon-cyber.jpg",
  },
  {
    title: "Product Management",
    topics: "Roadmaps • Discovery • Delivery",
    image: "/soon-product.jpg",
  },
  {
    title: "DevOps Engineering",
    topics: "CI/CD • Cloud • Automation",
    image: "/soon-devops.jpg",
  },
  {
    title: "AI & Machine Learning",
    topics: "Python • Models • Applied AI",
    image: "/soon-ai.jpg",
  },
  {
    title: "Cloud Computing",
    topics: "AWS • Azure • Infrastructure",
    image: "/soon-cloud.jpg",
  },
  {
    title: "Mobile App Development",
    topics: "Flutter • React Native • UX",
    image: "/soon-mobile.jpg",
  },
  {
    title: "Data Engineering",
    topics: "Pipelines • SQL • Warehousing",
    image: "/soon-dataeng.jpg",
  },
] as const;

export const coursesFaqs = [
  {
    q: "How long do the courses run?",
    a: "Most programs run for 12 weeks with live sessions, projects, and mentor reviews built into the schedule.",
  },
  {
    q: "Do I need prior experience?",
    a: "Beginner-friendly tracks are available. Career switchers are welcome as long as you can commit to the workload.",
  },
  {
    q: "What payment options are available?",
    a: "You can pay in full, split into installments, or apply for scholarship support where eligible.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes. Graduates receive a certificate of completion after finishing projects and assessments.",
  },
] as const;

export const homeFaqs = [
  {
    q: "Who can join TechUp Academy?",
    a: "Beginners and career switchers across Nigeria who want practical, industry-focused tech skills.",
  },
  {
    q: "Do I need a laptop?",
    a: "Yes. A personal laptop is required for projects, labs, and portfolio work throughout the program.",
  },
  {
    q: "How are scholarships awarded?",
    a: "Scholarships are merit-based and consider passion, potential, and commitment to completing training.",
  },
  {
    q: "Is the program fully online?",
    a: "Programs include live sessions, mentorship, and project reviews designed for remote and hybrid learning.",
  },
] as const;

export const aboutFaqs = [
  {
    q: "Do I need prior experience for the bootcamp?",
    a: "No. The free bootcamp is designed for beginners and career switchers — bring curiosity and commitment, and we will guide the rest.",
  },
  {
    q: "How are scholarships awarded?",
    a: "Scholarships are merit-based and consider passion, potential, and commitment to completing training.",
  },
  {
    q: "Is the program fully online?",
    a: "Programs include live sessions, mentorship, and project reviews designed for remote and hybrid learning.",
  },
] as const;

export const experts = [
  {
    name: "Fawwas Olajide",
    role: "Lead Web Developer",
    bio: "Builds production-ready full-stack applications and mentors portfolio-driven learners.",
    image: "/tutor4.png",
    linkedin: "https://www.linkedin.com/in/emblemprograms",
  },
  {
    name: "Udeme Victor",
    role: "Lead Graphic Designer/Illustrator",
    bio: "Focuses on branding, visual systems, and communication design for digital products.",
    image: "/tutor2.png",
    linkedin: "https://www.linkedin.com/in/udeme-victor-b47235303",
  },
  {
    name: "Olumide David",
    role: "Lead Data Analytics Instructor",
    bio: "Specializes in Excel, SQL, Python, and Power BI for business decision systems.",
    image: "/tutor3.png",
    linkedin: "https://www.linkedin.com/in/olumide-david-79b17726a",
  },
] as const;

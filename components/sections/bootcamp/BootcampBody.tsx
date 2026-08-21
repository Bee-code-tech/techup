import Image from "next/image";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

function StudentGraduateIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="32" fill="#00206F" fillOpacity="0.05" />
      <path
        d="M32 45.5L21.5 39.8V30.8L15.5 27.5L32 18.5L48.5 27.5V39.5H45.5V29.15L42.5 30.8V39.8L32 45.5ZM32 33.05L42.275 27.5L32 21.95L21.725 27.5L32 33.05ZM32 42.0875L39.5 38.0375V32.375L32 36.5L24.5 32.375V38.0375L32 42.0875Z"
        fill="#00206F"
      />
    </svg>
  );
}

function CareerSwitcherIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="32" fill="#FB7800" fillOpacity="0.05" />
      <path
        d="M24.5 44L17 36.5L24.5 29L26.6 31.1375L22.7375 35H33.5V38H22.7375L26.6 41.8625L24.5 44ZM39.5 35L37.4 32.8625L41.2625 29H30.5V26H41.2625L37.4 22.1375L39.5 20L47 27.5L39.5 35Z"
        fill="#FB7800"
      />
    </svg>
  );
}

function BeginnerIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="32" fill="#00464F" fillOpacity="0.05" />
      <path
        d="M42.5 27.5L40.625 23.375L36.5 21.5L40.625 19.625L42.5 15.5L44.375 19.625L48.5 21.5L44.375 23.375L42.5 27.5ZM42.5 48.5L40.625 44.375L36.5 42.5L40.625 40.625L42.5 36.5L44.375 40.625L48.5 42.5L44.375 44.375L42.5 48.5ZM27.5 44L23.75 35.75L15.5 32L23.75 28.25L27.5 20L31.25 28.25L39.5 32L31.25 35.75L27.5 44ZM27.5 36.725L29 33.5L32.225 32L29 30.5L27.5 27.275L26 30.5L22.775 32L26 33.5L27.5 36.725Z"
        fill="#00464F"
      />
    </svg>
  );
}

function BuiltForAfricaIcon() {
  return (
    <svg
      width="34"
      height="41"
      viewBox="0 0 34 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="34" height="41" rx="8" fill="#FB7800" />
      <path
        d="M8 27V13H14V11L17 8L20 11V17H26V27H8ZM10 25H12V23H10V25ZM10 21H12V19H10V21ZM10 17H12V15H10V17ZM16 25H18V23H16V25ZM16 21H18V19H16V21ZM16 17H18V15H16V17ZM16 13H18V11H16V13ZM22 25H24V23H22V25ZM22 21H24V19H22V21Z"
        fill="white"
      />
    </svg>
  );
}

const audienceIcons = {
  student: <StudentGraduateIcon />,
  graduate: <StudentGraduateIcon />,
  switcher: <CareerSwitcherIcon />,
  beginner: <BeginnerIcon />,
} as const;

const audienceCards = [
  {
    title: "Students",
    description: "Build a skill alongside your degree.",
    icon: "student" as const,
  },
  {
    title: "Fresh Graduates",
    description:
      "Bridge the gap between academic theory and industry reality to land your first role.",
    icon: "graduate" as const,
  },
  {
    title: "Career Switchers",
    description:
      "Transition into high-paying tech roles from any background with our structured support.",
    icon: "switcher" as const,
  },
  {
    title: "Absolute Beginners",
    description: "No prior experience needed at all.",
    icon: "beginner" as const,
  },
];

function WhyJoinProjectsIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.1" />
      <path
        d="M22.6 29.05L29.65 22L28.25 20.6L22.6 26.25L19.75 23.4L18.35 24.8L22.6 29.05ZM17 34C16.45 34 15.9792 33.8042 15.5875 33.4125C15.1958 33.0208 15 32.55 15 32V18C15 17.45 15.1958 16.9792 15.5875 16.5875C15.9792 16.1958 16.45 16 17 16H21.2C21.4167 15.4 21.7792 14.9167 22.2875 14.55C22.7958 14.1833 23.3667 14 24 14C24.6333 14 25.2042 14.1833 25.7125 14.55C26.2208 14.9167 26.5833 15.4 26.8 16H31C31.55 16 32.0208 16.1958 32.4125 16.5875C32.8042 16.9792 33 17.45 33 18V32C33 32.55 32.8042 33.0208 32.4125 33.4125C32.0208 33.8042 31.55 34 31 34H17ZM17 32H31V18H17V32ZM24 17.25C24.2167 17.25 24.3958 17.1792 24.5375 17.0375C24.6792 16.8958 24.75 16.7167 24.75 16.5C24.75 16.2833 24.6792 16.1042 24.5375 15.9625C24.3958 15.8208 24.2167 15.75 24 15.75C23.7833 15.75 23.6042 15.8208 23.4625 15.9625C23.3208 16.1042 23.25 16.2833 23.25 16.5C23.25 16.7167 23.3208 16.8958 23.4625 17.0375C23.6042 17.1792 23.7833 17.25 24 17.25ZM17 32V18V32Z"
        fill="#FFDBC8"
      />
    </svg>
  );
}

function WhyJoinMentorshipIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.1" />
      <path
        d="M17.4941 34V29.7C16.5441 28.8333 15.8066 27.8208 15.2816 26.6625C14.7566 25.5042 14.4941 24.2833 14.4941 23C14.4941 20.5 15.3691 18.375 17.1191 16.625C18.8691 14.875 20.9941 14 23.4941 14C25.5775 14 27.4233 14.6125 29.0316 15.8375C30.64 17.0625 31.6858 18.6583 32.1691 20.625L33.4691 25.75C33.5525 26.0667 33.4941 26.3542 33.2941 26.6125C33.0941 26.8708 32.8275 27 32.4941 27H30.4941V30C30.4941 30.55 30.2983 31.0208 29.9066 31.4125C29.515 31.8042 29.0441 32 28.4941 32H26.4941V34H24.4941V30H28.4941V25H31.1941L30.2441 21.125C29.8608 19.6083 29.0441 18.375 27.7941 17.425C26.5441 16.475 25.1108 16 23.4941 16C21.5608 16 19.9108 16.675 18.5441 18.025C17.1775 19.375 16.4941 21.0167 16.4941 22.95C16.4941 23.95 16.6983 24.9 17.1066 25.8C17.515 26.7 18.0941 27.5 18.8441 28.2L19.4941 28.8V34H17.4941ZM22.4941 27H24.4941L24.6441 25.75C24.7775 25.7 24.8983 25.6417 25.0066 25.575C25.115 25.5083 25.2108 25.4333 25.2941 25.35L26.4441 25.85L27.4441 24.15L26.4441 23.4C26.4775 23.2667 26.4941 23.1333 26.4941 23C26.4941 22.8667 26.4775 22.7333 26.4441 22.6L27.4441 21.85L26.4441 20.15L25.2941 20.65C25.2108 20.5667 25.115 20.4917 25.0066 20.425C24.8983 20.3583 24.7775 20.3 24.6441 20.25L24.4941 19H22.4941L22.3441 20.25C22.2108 20.3 22.09 20.3583 21.9816 20.425C21.8733 20.4917 21.7775 20.5667 21.6941 20.65L20.5441 20.15L19.5441 21.85L20.5441 22.6C20.5108 22.7333 20.4941 22.8667 20.4941 23C20.4941 23.1333 20.5108 23.2667 20.5441 23.4L19.5441 24.15L20.5441 25.85L21.6941 25.35C21.7775 25.4333 21.8733 25.5083 21.9816 25.575C22.09 25.6417 22.2108 25.7 22.3441 25.75L22.4941 27ZM23.4941 24.5C23.0775 24.5 22.7233 24.3542 22.4316 24.0625C22.14 23.7708 21.9941 23.4167 21.9941 23C21.9941 22.5833 22.14 22.2292 22.4316 21.9375C22.7233 21.6458 23.0775 21.5 23.4941 21.5C23.9108 21.5 24.265 21.6458 24.5566 21.9375C24.8483 22.2292 24.9941 22.5833 24.9941 23C24.9941 23.4167 24.8483 23.7708 24.5566 24.0625C24.265 24.3542 23.9108 24.5 23.4941 24.5Z"
        fill="#FFDBC8"
      />
    </svg>
  );
}

function WhyJoinCertificateIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.1" />
      <path
        d="M21.675 25.2L22.55 22.35L20.25 20.5H23.1L24 17.7L24.9 20.5H27.75L25.425 22.35L26.3 25.2L24 23.425L21.675 25.2ZM18 34.5V26.775C17.3667 26.075 16.875 25.275 16.525 24.375C16.175 23.475 16 22.5167 16 21.5C16 19.2667 16.775 17.375 18.325 15.825C19.875 14.275 21.7667 13.5 24 13.5C26.2333 13.5 28.125 14.275 29.675 15.825C31.225 17.375 32 19.2667 32 21.5C32 22.5167 31.825 23.475 31.475 24.375C31.125 25.275 30.6333 26.075 30 26.775V34.5L24 32.5L18 34.5ZM24 27.5C25.6667 27.5 27.0833 26.9167 28.25 25.75C29.4167 24.5833 30 23.1667 30 21.5C30 19.8333 29.4167 18.4167 28.25 17.25C27.0833 16.0833 25.6667 15.5 24 15.5C22.3333 15.5 20.9167 16.0833 19.75 17.25C18.5833 18.4167 18 19.8333 18 21.5C18 23.1667 18.5833 24.5833 19.75 25.75C20.9167 26.9167 22.3333 27.5 24 27.5ZM20 31.525L24 30.5L28 31.525V28.425C27.4167 28.7583 26.7875 29.0208 26.1125 29.2125C25.4375 29.4042 24.7333 29.5 24 29.5C23.2667 29.5 22.5625 29.4042 21.8875 29.2125C21.2125 29.0208 20.5833 28.7583 20 28.425V31.525Z"
        fill="#FFDBC8"
      />
    </svg>
  );
}

const whyJoinItems = [
  {
    title: "Practical Projects",
    body: "Build a portfolio of real-world applications that recruiters actually want to see.",
    icon: <WhyJoinProjectsIcon />,
  },
  {
    title: "Expert Mentorship",
    body: "Weekly sessions with practising industry mentors, not pre-recorded videos.",
    icon: <WhyJoinMentorshipIcon />,
  },
  {
    title: "Global Certificate",
    body: "Receive a verified certificate of completion recognized by our hiring partners.",
    icon: <WhyJoinCertificateIcon />,
  },
] as const;

function AchieveTechnicalIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#0133A0" fillOpacity="0.1" />
      <path
        d="M19.5 25.75V23.25C19.5 22.5625 19.7448 21.974 20.2344 21.4844C20.724 20.9948 21.3125 20.75 22 20.75H42C42.6875 20.75 43.276 20.9948 43.7656 21.4844C44.2552 21.974 44.5 22.5625 44.5 23.25V25.75H42V23.25H22V25.75H19.5ZM27 43.25V40.75H22C21.3125 40.75 20.724 40.5052 20.2344 40.0156C19.7448 39.526 19.5 38.9375 19.5 38.25V35.75H22V38.25H42V35.75H44.5V38.25C44.5 38.9375 44.2552 39.526 43.7656 40.0156C43.276 40.5052 42.6875 40.75 42 40.75H37V43.25H27ZM23 30.75L26.25 27.5L24.5 25.75L19.5 30.75L24.5 35.75L26.25 34L23 30.75ZM41 30.75L37.75 34L39.5 35.75L44.5 30.75L39.5 25.75L37.75 27.5L41 30.75Z"
        fill="#00206F"
      />
    </svg>
  );
}

function AchieveProjectsIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#FB7800" fillOpacity="0.1" />
      <path
        d="M22.625 42H38.875V36.25L40.2812 35.5625C40.6146 35.3958 40.8802 35.1667 41.0781 34.875C41.276 34.5833 41.375 34.25 41.375 33.875C41.375 33.5208 41.276 33.1927 41.0781 32.8906C40.8802 32.5885 40.6146 32.3542 40.2812 32.1875L38.875 31.5312V25.75H32.875L32.5625 23.625C32.5 23.1667 32.2969 22.7812 31.9531 22.4688C31.6094 22.1562 31.2083 22 30.75 22C30.2708 22 29.8594 22.1562 29.5156 22.4688C29.1719 22.7812 28.9688 23.1667 28.9062 23.625L28.5938 25.75H22.625V28.4375C23.7917 28.875 24.7083 29.5833 25.375 30.5625C26.0417 31.5417 26.375 32.6458 26.375 33.875C26.375 35.125 26.0417 36.2396 25.375 37.2188C24.7083 38.1979 23.7917 38.9062 22.625 39.3438V42ZM22.625 44.5C21.9167 44.5 21.3229 44.2604 20.8438 43.7812C20.3646 43.3021 20.125 42.7083 20.125 42V37.25C21.125 37.25 22 36.9323 22.75 36.2969C23.5 35.6615 23.875 34.8542 23.875 33.875C23.875 32.9167 23.5 32.125 22.75 31.5C22 30.875 21.125 30.5417 20.125 30.5V25.75C20.125 25.0625 20.3698 24.474 20.8594 23.9844C21.349 23.4948 21.9375 23.25 22.625 23.25H26.4375C26.5833 22.1875 27.0625 21.2969 27.875 20.5781C28.6875 19.8594 29.6458 19.5 30.75 19.5C31.8333 19.5 32.7812 19.8594 33.5938 20.5781C34.4062 21.2969 34.8958 22.1875 35.0625 23.25H38.875C39.5625 23.25 40.151 23.4948 40.6406 23.9844C41.1302 24.474 41.375 25.0625 41.375 25.75V29.9375C42.125 30.3125 42.7292 30.8542 43.1875 31.5625C43.6458 32.2708 43.875 33.0417 43.875 33.875C43.875 34.7292 43.6458 35.5104 43.1875 36.2188C42.7292 36.9271 42.125 37.4583 41.375 37.8125V42C41.375 42.7083 41.1302 43.3021 40.6406 43.7812C40.151 44.2604 39.5625 44.5 38.875 44.5H22.625Z"
        fill="#FB7800"
      />
    </svg>
  );
}

function AchieveProfessionalIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#00DAF3" fillOpacity="0.1" />
      <path
        d="M23.8672 44.5V39.125C22.6797 38.0417 21.7578 36.776 21.1016 35.3281C20.4453 33.8802 20.1172 32.3542 20.1172 30.75C20.1172 27.625 21.2109 24.9688 23.3984 22.7812C25.5859 20.5938 28.2422 19.5 31.3672 19.5C33.9714 19.5 36.2786 20.2656 38.2891 21.7969C40.2995 23.3281 41.6068 25.3229 42.2109 27.7812L43.8359 34.1875C43.9401 34.5833 43.8672 34.9427 43.6172 35.2656C43.3672 35.5885 43.0339 35.75 42.6172 35.75H40.1172V39.5C40.1172 40.1875 39.8724 40.776 39.3828 41.2656C38.8932 41.7552 38.3047 42 37.6172 42H35.1172V44.5H32.6172V39.5H37.6172V33.25H40.9922L39.8047 28.4062C39.3255 26.5104 38.3047 24.9688 36.7422 23.7812C35.1797 22.5938 33.388 22 31.3672 22C28.9505 22 26.888 22.8438 25.1797 24.5312C23.4714 26.2188 22.6172 28.2708 22.6172 30.6875C22.6172 31.9375 22.8724 33.125 23.3828 34.25C23.8932 35.375 24.6172 36.375 25.5547 37.25L26.3672 38V44.5H23.8672ZM31.3672 37C31.7214 37 32.0182 36.8802 32.2578 36.6406C32.4974 36.401 32.6172 36.1042 32.6172 35.75C32.6172 35.3958 32.4974 35.099 32.2578 34.8594C32.0182 34.6198 31.7214 34.5 31.3672 34.5C31.013 34.5 30.7161 34.6198 30.4766 34.8594C30.237 35.099 30.1172 35.3958 30.1172 35.75C30.1172 36.1042 30.237 36.401 30.4766 36.6406C30.7161 36.8802 31.013 37 31.3672 37ZM30.4297 33H32.3359C32.3359 32.4792 32.4036 32.0573 32.5391 31.7344C32.6745 31.4115 32.9505 31.0208 33.3672 30.5625C33.7422 30.1458 34.1068 29.724 34.4609 29.2969C34.8151 28.8698 34.9922 28.3125 34.9922 27.625C34.9922 26.75 34.6536 26.0104 33.9766 25.4062C33.2995 24.8021 32.4609 24.5 31.4609 24.5C30.6276 24.5 29.8724 24.7396 29.1953 25.2188C28.5182 25.6979 28.0443 26.3229 27.7734 27.0938L29.4922 27.8125C29.638 27.3542 29.8932 26.9844 30.2578 26.7031C30.6224 26.4219 31.0234 26.2812 31.4609 26.2812C31.9193 26.2812 32.2995 26.4062 32.6016 26.6562C32.9036 26.9062 33.0547 27.2292 33.0547 27.625C33.0547 28.0625 32.9245 28.4531 32.6641 28.7969C32.4036 29.1406 32.0964 29.4896 31.7422 29.8438C31.3255 30.2812 31.0026 30.7188 30.7734 31.1562C30.5443 31.5938 30.4297 32.2083 30.4297 33Z"
        fill="#00464F"
      />
    </svg>
  );
}

function AchieveCertificateIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#FFDAD6" fillOpacity="0.1" />
      <path
        d="M24.5 40.8281L26.9688 39.8281C26.7604 39.224 26.5677 38.6094 26.3906 37.9844C26.2135 37.3594 26.0729 36.7344 25.9688 36.1094L24.5 37.1094V40.8281ZM29.5 39.5156H34.5C34.875 38.6823 35.1771 37.6667 35.4062 36.4688C35.6354 35.2708 35.75 34.0469 35.75 32.7969C35.75 30.7344 35.4062 28.7812 34.7188 26.9375C34.0312 25.0938 33.125 23.6719 32 22.6719C30.875 23.6719 29.9688 25.0938 29.2812 26.9375C28.5938 28.7812 28.25 30.7344 28.25 32.7969C28.25 34.0469 28.3646 35.2708 28.5938 36.4688C28.8229 37.6667 29.125 38.6823 29.5 39.5156ZM32 33.2656C31.3125 33.2656 30.724 33.0208 30.2344 32.5312C29.7448 32.0417 29.5 31.4531 29.5 30.7656C29.5 30.0781 29.7448 29.4896 30.2344 29C30.724 28.5104 31.3125 28.2656 32 28.2656C32.6875 28.2656 33.276 28.5104 33.7656 29C34.2552 29.4896 34.5 30.0781 34.5 30.7656C34.5 31.4531 34.2552 32.0417 33.7656 32.5312C33.276 33.0208 32.6875 33.2656 32 33.2656ZM39.5 40.8281V37.1094L38.0312 36.1094C37.9271 36.7344 37.7865 37.3594 37.6094 37.9844C37.4323 38.6094 37.2396 39.224 37.0312 39.8281L39.5 40.8281ZM32 19.4844C34.0625 20.9844 35.6198 22.8906 36.6719 25.2031C37.724 27.5156 38.25 30.2031 38.25 33.2656L40.875 35.0156C41.2292 35.2448 41.5052 35.5469 41.7031 35.9219C41.901 36.2969 42 36.6927 42 37.1094V44.5156L35.7812 42.0156H28.2188L22 44.5156V37.1094C22 36.6927 22.099 36.2969 22.2969 35.9219C22.4948 35.5469 22.7708 35.2448 23.125 35.0156L25.75 33.2656C25.75 30.2031 26.276 27.5156 27.3281 25.2031C28.3802 22.8906 29.9375 20.9844 32 19.4844Z"
        fill="#BA1A1A"
      />
    </svg>
  );
}

const achievementCards = [
  {
    title: "Technical Skills",
    body: "Build core digital skills with guided hands-on practice.",
    icon: <AchieveTechnicalIcon />,
  },
  {
    title: "Hands-on Projects",
    body: "Work on real tasks that strengthen your portfolio.",
    icon: <AchieveProjectsIcon />,
  },
  {
    title: "Professional Skills",
    body: "Improve teamwork, confidence, and communication.",
    icon: <AchieveProfessionalIcon />,
  },
  {
    title: "Confidence & Direction",
    body: "Leave with clarity on what to learn and build next.",
    icon: <AchieveCertificateIcon />,
  },
] as const;

const roadmapItems = [
  {
    step: 1,
    tag: "DAYS 1-4",
    title: "Getting Started",
    body: "Build a strong foundation by understanding the tech ecosystem, setting up essential tools, and learning the core concepts required for your chosen career path.",
    side: "left" as const,
    tagClass: "bg-navy text-white",
    dotClass: "bg-navy",
  },
  {
    step: 2,
    tag: "DAYS 5-8",
    title: "Skill Development",
    body: "Dive into hands-on learning, practical exercises, and guided sessions that help you develop the technical and professional skills needed in your track.",
    side: "right" as const,
    tagClass: "bg-orange text-white",
    dotClass: "bg-orange",
  },
  {
    step: 3,
    tag: "DAYS 9-11",
    title: "Hands on Projects",
    body: "Apply what you've learned by working on real-world projects, collaborating with peers, and receiving feedback from mentors to strengthen your practical experience.",
    side: "left" as const,
    tagClass: "bg-teal-700 text-white",
    dotClass: "bg-teal-700",
  },
  {
    step: 4,
    tag: "DAYS 12-14",
    title: "Career Readiness",
    body: "Complete your capstone project, build a job-ready portfolio, prepare for interviews, and gain the confidence to begin your tech career.",
    side: "right" as const,
    tagClass: "bg-cyan-500 text-white",
    dotClass: "bg-cyan-500",
  },
] as const;

const bootcampFaqs = [
  {
    q: "Do I need prior experience to join the bootcamp?",
    a: "No. The bootcamp is beginner-friendly and open to anyone who is interested in learning technology.",
  },
  {
    q: "What will I learn during the bootcamp?",
    a: "You’ll get practical exposure to technology, explore different career paths, and experience what learning with TechUp is like.",
  },
  {
    q: "How long does the bootcamp run for?",
    a: (
      <>
        The bootcamp runs for <strong>2 weeks</strong> of practical learning,
        activities, and engagement.
      </>
    ),
  },
  {
    q: "What happens after the bootcamp?",
    a: (
      <>
        Participants who want to continue their learning can apply to join the{" "}
        <strong>TechUp Academy Main Cohort</strong>, where they can receive
        structured training and a certificate upon completion.
      </>
    ),
  },
] as const;

function CommunityIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="16" fill="#FFDBC8" />
      <path
        d="M16 25.525L18.525 23L16 20.475L13.475 23L16 25.525ZM29.5 25L32 21L34.5 25H29.5ZM24 24C23.1667 24 22.4583 23.7083 21.875 23.125C21.2917 22.5417 21 21.8333 21 21C21 20.15 21.2917 19.4375 21.875 18.8625C22.4583 18.2875 23.1667 18 24 18C24.85 18 25.5625 18.2875 26.1375 18.8625C26.7125 19.4375 27 20.15 27 21C27 21.8333 26.7125 22.5417 26.1375 23.125C25.5625 23.7083 24.85 24 24 24ZM24 20C23.7167 20 23.4792 20.0958 23.2875 20.2875C23.0958 20.4792 23 20.7167 23 21C23 21.2833 23.0958 21.5208 23.2875 21.7125C23.4792 21.9042 23.7167 22 24 22C24.2833 22 24.5208 21.9042 24.7125 21.7125C24.9042 21.5208 25 21.2833 25 21C25 20.7167 24.9042 20.4792 24.7125 20.2875C24.5208 20.0958 24.2833 20 24 20ZM12 30V28.425C12 27.6917 12.3708 27.1042 13.1125 26.6625C13.8542 26.2208 14.8167 26 16 26C16.2167 26 16.425 26.0042 16.625 26.0125C16.825 26.0208 17.0167 26.0417 17.2 26.075C16.9667 26.4083 16.7917 26.7667 16.675 27.15C16.5583 27.5333 16.5 27.9417 16.5 28.375V30H12ZM18 30V28.375C18 27.2917 18.5542 26.4167 19.6625 25.75C20.7708 25.0833 22.2167 24.75 24 24.75C25.8 24.75 27.25 25.0833 28.35 25.75C29.45 26.4167 30 27.2917 30 28.375V30H18ZM32 26C33.2 26 34.1667 26.2208 34.9 26.6625C35.6333 27.1042 36 27.6917 36 28.425V30H31.5V28.375C31.5 27.9417 31.4458 27.5333 31.3375 27.15C31.2292 26.7667 31.0667 26.4083 30.85 26.075C31.0333 26.0417 31.2208 26.0208 31.4125 26.0125C31.6042 26.0042 31.8 26 32 26ZM24 26.75C23.05 26.75 22.2 26.875 21.45 27.125C20.7 27.375 20.2583 27.6667 20.125 28H27.9C27.75 27.6667 27.3042 27.375 26.5625 27.125C25.8208 26.875 24.9667 26.75 24 26.75Z"
        fill="#994700"
      />
    </svg>
  );
}

function MissionIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="16" fill="#FFDBC8" />
      <path
        d="M17.5766 21.9604L19.5266 22.7854C19.7599 22.3187 20.0016 21.8687 20.2516 21.4354C20.5016 21.0021 20.7766 20.5687 21.0766 20.1354L19.6766 19.8604L17.5766 21.9604ZM21.1266 24.0354L23.9766 26.8604C24.6766 26.5937 25.4266 26.1854 26.2266 25.6354C27.0266 25.0854 27.7766 24.4604 28.4766 23.7604C29.6432 22.5937 30.5557 21.2979 31.2141 19.8729C31.8724 18.4479 32.1599 17.1354 32.0766 15.9354C30.8766 15.8521 29.5599 16.1396 28.1266 16.7979C26.6932 17.4562 25.3932 18.3687 24.2266 19.5354C23.5266 20.2354 22.9016 20.9854 22.3516 21.7854C21.8016 22.5854 21.3932 23.3354 21.1266 24.0354ZM25.5766 22.4104C25.1932 22.0271 25.0016 21.5562 25.0016 20.9979C25.0016 20.4396 25.1932 19.9687 25.5766 19.5854C25.9599 19.2021 26.4349 19.0104 27.0016 19.0104C27.5682 19.0104 28.0432 19.2021 28.4266 19.5854C28.8099 19.9687 29.0016 20.4396 29.0016 20.9979C29.0016 21.5562 28.8099 22.0271 28.4266 22.4104C28.0432 22.7937 27.5682 22.9854 27.0016 22.9854C26.4349 22.9854 25.9599 22.7937 25.5766 22.4104ZM26.0516 30.4354L28.1516 28.3354L27.8766 26.9354C27.4432 27.2354 27.0099 27.5062 26.5766 27.7479C26.1432 27.9896 25.6932 28.2271 25.2266 28.4604L26.0516 30.4354ZM33.8766 14.1104C34.1932 16.1271 33.9974 18.0896 33.2891 19.9979C32.5807 21.9062 31.3599 23.7271 29.6266 25.4604L30.1266 27.9354C30.1932 28.2687 30.1766 28.5937 30.0766 28.9104C29.9766 29.2271 29.8099 29.5021 29.5766 29.7354L25.3766 33.9354L23.2766 29.0104L19.0016 24.7354L14.0766 22.6354L18.2516 18.4354C18.4849 18.2021 18.7641 18.0354 19.0891 17.9354C19.4141 17.8354 19.7432 17.8187 20.0766 17.8854L22.5516 18.3854C24.2849 16.6521 26.1016 15.4271 28.0016 14.7104C29.9016 13.9937 31.8599 13.7937 33.8766 14.1104ZM15.8516 27.9104C16.4349 27.3271 17.1474 27.0312 17.9891 27.0229C18.8307 27.0146 19.5432 27.3021 20.1266 27.8854C20.7099 28.4687 20.9974 29.1812 20.9891 30.0229C20.9807 30.8646 20.6849 31.5771 20.1016 32.1604C19.6849 32.5771 18.9891 32.9354 18.0141 33.2354C17.0391 33.5354 15.6932 33.8021 13.9766 34.0354C14.2099 32.3187 14.4766 30.9729 14.7766 29.9979C15.0766 29.0229 15.4349 28.3271 15.8516 27.9104ZM17.2766 29.3104C17.1099 29.4771 16.9432 29.7812 16.7766 30.2229C16.6099 30.6646 16.4932 31.1104 16.4266 31.5604C16.8766 31.4937 17.3224 31.3812 17.7641 31.2229C18.2057 31.0646 18.5099 30.9021 18.6766 30.7354C18.8766 30.5354 18.9849 30.2937 19.0016 30.0104C19.0182 29.7271 18.9266 29.4854 18.7266 29.2854C18.5266 29.0854 18.2849 28.9896 18.0016 28.9979C17.7182 29.0062 17.4766 29.1104 17.2766 29.3104Z"
        fill="#994700"
      />
    </svg>
  );
}

function RealProjectsCodeIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="80" height="80" rx="40" fill="#FB7800" fillOpacity="0.1" />
      <path
        d="M37 44.5L38.75 42.7188L36.0312 40L38.75 37.2812L37 35.5L32.5 40L37 44.5ZM43 44.5L47.5 40L43 35.5L41.25 37.2812L43.9688 40L41.25 42.7188L43 44.5ZM31.25 51.25C30.5625 51.25 29.974 51.0052 29.4844 50.5156C28.9948 50.026 28.75 49.4375 28.75 48.75V31.25C28.75 30.5625 28.9948 29.974 29.4844 29.4844C29.974 28.9948 30.5625 28.75 31.25 28.75H48.75C49.4375 28.75 50.026 28.9948 50.5156 29.4844C51.0052 29.974 51.25 30.5625 51.25 31.25V48.75C51.25 49.4375 51.0052 50.026 50.5156 50.5156C50.026 51.0052 49.4375 51.25 48.75 51.25H31.25ZM31.25 48.75H48.75V31.25H31.25V48.75ZM31.25 31.25V48.75V31.25Z"
        fill="#FB7800"
      />
    </svg>
  );
}

function RealProjectsTerminalIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="80" height="80" rx="40" fill="#00206F" fillOpacity="0.1" />
      <path
        d="M30 50C29.3125 50 28.724 49.7552 28.2344 49.2656C27.7448 48.776 27.5 48.1875 27.5 47.5V32.5C27.5 31.8125 27.7448 31.224 28.2344 30.7344C28.724 30.2448 29.3125 30 30 30H50C50.6875 30 51.276 30.2448 51.7656 30.7344C52.2552 31.224 52.5 31.8125 52.5 32.5V47.5C52.5 48.1875 52.2552 48.776 51.7656 49.2656C51.276 49.7552 50.6875 50 50 50H30ZM30 47.5H50V35H30V47.5ZM34.375 46.25L32.625 44.5L35.8438 41.25L32.5938 38L34.375 36.25L39.375 41.25L34.375 46.25ZM40 46.25V43.75H47.5V46.25H40Z"
        fill="#00206F"
      />
    </svg>
  );
}

export function BootcampBody() {
  return (
    <>
      <Section className="bg-surface-blue">
        <SectionHeading
          title="More Than a Bootcamp"
          subtitle="TechUp Academy is more than a coding school. We help you build practical skills, real-world projects, professional confidence, and a portfolio that prepares you for opportunities in today's tech industry"
        />
        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[1.8fr_1fr]">
          <Reveal className="h-full min-h-80 overflow-hidden rounded-4xl lg:min-h-125">
            <div className="relative h-full min-h-80 overflow-hidden rounded-4xl lg:min-h-125">
              <Image
                src="/bootcamp.png"
                alt="TechUp Academy bootcamp students"
                width={1478}
                height={1008}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-bootcamp-overlay" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <div className="mb-4">
                  <BuiltForAfricaIcon />
                </div>
                <h3 className="font-display text-3xl font-bold">
                  Built for Africa, Ready for the World
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                  Our curriculum is specifically tailored to bridge the gap
                  between local talent and global market standards.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid h-full grid-rows-2 gap-6">
            <Reveal
              delay={0.08}
              className="flex h-full flex-col justify-center rounded-4xl border border-border bg-white p-7"
            >
              <CommunityIcon />
              <h3 className="mt-6 font-display text-2xl font-bold leading-tight text-navy">
                Community Driven
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                Join 120+ alumni working in startups across Lagos, and Africa.
              </p>
            </Reveal>
            <Reveal
              delay={0.16}
              className="flex h-full flex-col justify-center rounded-4xl bg-navy p-7 text-white"
            >
              <MissionIcon />
              <h3 className="mt-6 font-display text-2xl font-bold leading-tight">
                Our Mission
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Empowering 10,000 Nigerians with world-class digital skills by
                2030.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-8 rounded-4xl bg-orange-peach px-6 py-10 sm:px-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                Real Projects. Real Experience.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                Move beyond &quot;Hello World&quot;. Build banking apps and
                e-commerce platforms used by thousands of users.
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <RealProjectsCodeIcon />
              <RealProjectsTerminalIcon />
            </div>
          </div>
        </Reveal>

        <div className="mt-14 sm:mt-16">
          <SectionHeading
            title="Who Is This For?"
            subtitle="Everything you need to launch your tech career with confidence"
          />
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {audienceCards.map((item) => (
              <article
                key={item.title}
                data-reveal
                className="rounded-4xl border border-border bg-white p-6 text-center"
              >
                <div className="mx-auto flex justify-center">
                  {audienceIcons[item.icon]}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-navy">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section className="bg-navy text-white">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">
              Why Join
            </h2>
            <p className="mt-2 text-sm text-white/75 sm:text-base">
              Everything you need to start strong
            </p>
            <ul className="mt-4 space-y-5">
              {whyJoinItems.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="shrink-0">{item.icon}</div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-7 text-white/75">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="relative lg:pb-6">
            <Image
              src="/team.png"
              alt="TechUp Academy team"
              width={588}
              height={523}
              className="w-full rounded-4xl object-cover"
            />
            <div className="absolute -bottom-2 -left-2 rounded-2xl bg-white px-5 py-4 shadow-card sm:-bottom-4 sm:-left-4">
              <p className="font-display text-3xl font-bold leading-none text-orange">
                94%
              </p>
              <p className="mt-2 text-2xs font-semibold tracking-wide text-navy uppercase">
                Employment Rate
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-surface-blue">
        <SectionHeading
          title="What You'll Achieve"
          subtitle="This bootcamp will transform you from a complete beginner to a confident tech learner"
        />
        <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {achievementCards.map((item) => (
            <article
              key={item.title}
              data-reveal
              className="rounded-4xl border border-border bg-white p-6 text-center"
            >
              <div className="mx-auto flex justify-center">{item.icon}</div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
            </article>
          ))}
        </Stagger>
      </Section>

      <Section className="bg-surface-blue-soft">
        <SectionHeading
          title="2-Week Bootcamp Roadmap"
          subtitle="A structured journey from beginner to professional engineer."
        />
        <div className="mx-auto mt-10 max-w-5xl">
          {roadmapItems.map((item, index) => {
            const renderCard = () => (
              <Reveal className="w-full max-w-md rounded-3xl border border-border bg-white p-5 shadow-card md:max-w-lg">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div
                    className={`inline-flex rounded-md px-2.5 py-1 text-2xs font-semibold tracking-wide ${item.tagClass}`}
                  >
                    {item.tag}
                  </div>
                  <h3 className="font-display text-base font-bold text-navy sm:text-lg">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-sm leading-6 text-muted">{item.body}</p>
              </Reveal>
            );

            const rail = (
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-1 flex-1 ${item.dotClass} ${
                    index === 0 ? "min-h-3 rounded-t-full" : ""
                  }`}
                />
                <span
                  className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-[5px] border-white text-sm font-bold text-white shadow-roadmap-dot ${item.dotClass}`}
                >
                  {item.step}
                </span>
                <div
                  className={`w-1 flex-1 ${item.dotClass} ${
                    index === roadmapItems.length - 1
                      ? "min-h-3 rounded-b-full"
                      : ""
                  }`}
                />
              </div>
            );

            return (
              <div
                key={item.step}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-stretch md:grid-cols-[minmax(0,1fr)_2.75rem_minmax(0,1fr)]"
              >
                <div className="hidden items-center justify-end py-2.5 pr-5 md:flex">
                  {item.side === "left" ? renderCard() : null}
                </div>

                {rail}

                <div className="flex items-center py-2.5 pl-3 md:pl-5">
                  {item.side === "right" ? (
                    renderCard()
                  ) : (
                    <div className="w-full md:hidden">{renderCard()}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="bg-white">
        <div className="grid gap-8 lg:grid-cols-content lg:gap-10">
          <div>
            <SectionHeading
              align="left"
              className="text-left"
              title="Frequently Asked Questions"
              subtitle="Everything you need to know before joining the TechUp Free Bootcamp."
            />
            <div className="mt-8 space-y-3">
              {bootcampFaqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-border bg-white px-5 py-4 shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="shrink-0 text-muted transition group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <Reveal y={40} className="flex items-center">
            <div className="w-full rounded-4xl bg-navy p-8 text-center text-white shadow-card md:p-10">
              <p className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                Ready to start your
                <br />
                tech skills
              </p>
              <p className="mt-4 text-sm text-white/75">
                Join the next free bootcamp cohort and begin building practical
                digital skills.
              </p>
              <Button
                href="#reserve"
                variant="orange"
                size="lg"
                className="mt-8 w-full sm:w-auto"
              >
                Join Free Bootcamp
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

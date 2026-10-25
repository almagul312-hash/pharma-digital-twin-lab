import { labEn } from "@/i18n/labCopy";
import type { Dictionary } from "@/i18n/types";

export const en: Dictionary = {
  meta: {
    siteTitle: "Virtual Laboratory for Pharmaceutical Process Modeling",
    titleSuffix: "Virtual Laboratory",
    description:
      "An educational demonstration platform for developing digital twins of pharmaceutical manufacturing processes.",
  },
  brand: {
    line1: "Virtual laboratory",
    line2: "for pharmaceutical process modeling",
    footer: "Virtual Laboratory for Pharmaceutical Process Modeling",
  },
  language: {
    label: "Language",
    ru: "RU",
    kk: "ҚАЗ",
    en: "EN",
  },
  nav: {
    main: "Main navigation",
    mobile: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Home",
    about: "About the lab",
    digitalTwins: "Digital twins",
    materials: "Learning materials",
    login: "Sign in",
  },
  common: {
    comingSoon: "Will be added in the next stage",
  },
  home: {
    eyebrow: "Digital technologies in pharmacy",
    title: "Virtual Laboratory for Pharmaceutical Process Modeling",
    lead: "Interactive study of pharmaceutical manufacturing processes using digital twins.",
    cta: "Go to projects",
    capabilitiesTitle: "Virtual modeling capabilities",
    capabilities: {
      processes: {
        title: "Manufacturing processes",
        description:
          "Step-by-step study of the main stages of pharmaceutical production.",
      },
      parameters: {
        title: "Parameter changes",
        description:
          "Adjust temperature, time, speed, mass, and other process conditions.",
      },
      results: {
        title: "Result calculations",
        description:
          "Determine material balance, product yield, and quality indicators.",
      },
      experiment: {
        title: "Virtual experiment",
        description:
          "Compare process options and analyze how parameters affect the outcome.",
      },
    },
    projectsTitle: "Digital twin projects",
    projectDetails: "Learn more",
    tabletsTitle: "Production of tablet dosage forms",
    tabletsLead:
      "A teaching tableting laboratory: from material receipt to compression, quality tests and a series report.",
    tabletsPoints: [
      "Direct compression and wet granulation",
      "A floor plan and ordinary control forms",
      "Weighing, mixing and a mass balance",
      "A press, teaching tests and a series report",
    ],
    tabletsStatus: "Teaching module",
    capsulesTitle: "Capsule filling of dosage forms",
  },
  about: {
    title: "About the lab",
    description:
      "Purpose of the educational virtual laboratory and contents of the demonstration site.",
    lead: "The laboratory is intended for educational development of digital twins of pharmaceutical manufacturing processes.",
    purposeTitle: "Purpose",
    purposeText:
      "The platform helps describe a manufacturing process step by step and prepare the structure of a future digital twin. The current site is a public demonstration: without a database, user registration, or digital calculations.",
    availableTitle: "What is available now",
    available: [
      "Pages about the laboratory and digital twins",
      "Cards for two projects in development",
      "A list of future process sections",
      "A learning materials section",
      "A placeholder sign-in page",
    ],
    nextTitle: "Next stage",
    nextText:
      "Section content, learning materials, and system sign-in will be added later.",
  },
  digitalTwins: {
    title: "Digital twins",
    description:
      "Digital twins of pharmaceutical manufacturing processes currently in development.",
    lead: "The laboratory is developing digital twins of individual pharmaceutical processes. At this stage, each project has a page with a list of future sections.",
  },
  projects: {
    status: "In development",
    open: "Open project page",
    back: "Back to digital twins",
    structureTitle: "Structure of the future digital twin",
    structureText:
      "The sections below are planned for the next stage. Formulas, calculation coefficients, and regulatory values are not provided here.",
    stagesTitle: "Future sections",
    tablets: {
      title: "Digital twin of tablet dosage form manufacturing",
      description:
        "Modeling of the main tablet production stages, process parameters, material balance, and quality indicators.",
      stages: [
        "Dosing",
        "Mixing",
        "Granulation",
        "Drying",
        "Granule sizing",
        "Lubrication",
        "Compression",
        "Quality control",
      ],
    },
    capsules: {
      title: "Digital twin of capsule filling for dosage forms",
      description:
        "Modeling of blend preparation, capsule size selection, dosing, filling, throughput, and capsule quality control.",
      stages: [
        "Raw material preparation",
        "Dosing",
        "Mixing",
        "Blend characterization",
        "Capsule size selection",
        "Capsule filling",
        "Capsule closing",
        "Quality control",
      ],
    },
  },
  materials: {
    title: "Learning materials",
    description: "A section for future learning materials of the virtual laboratory.",
    lead: "Learning materials for the laboratory will be published here. The demonstration version only shows the sections that still need to be filled in.",
    items: [
      "Overview of process stages",
      "Description of projects in development",
      "How to use the demonstration version",
    ],
  },
  login: {
    title: "Sign in",
    description:
      "Placeholder sign-in page. Authorization is not connected in the demonstration version.",
    text: "User registration and authorization are not included in the demonstration version.",
  },
  notFound: {
    title: "Page not found",
    text: "This page does not exist on the demonstration site.",
    action: "Back to home",
  },
  lab: labEn,
};

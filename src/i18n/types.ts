export type ProjectCopy = {
  title: string;
  description: string;
  stages: string[];
};

export type Dictionary = {
  meta: {
    siteTitle: string;
    titleSuffix: string;
    description: string;
  };
  brand: {
    line1: string;
    line2: string;
    footer: string;
  };
  language: {
    label: string;
    ru: string;
    kk: string;
  };
  nav: {
    main: string;
    mobile: string;
    openMenu: string;
    closeMenu: string;
    home: string;
    about: string;
    digitalTwins: string;
    materials: string;
    login: string;
  };
  common: {
    comingSoon: string;
  };
  home: {
    eyebrow: string;
    title: string;
    lead: string;
    cta: string;
    capabilitiesTitle: string;
    capabilities: {
      processes: { title: string; description: string };
      parameters: { title: string; description: string };
      results: { title: string; description: string };
      experiment: { title: string; description: string };
    };
    projectsTitle: string;
    projectDetails: string;
    tabletsTitle: string;
    capsulesTitle: string;
  };
  about: {
    title: string;
    description: string;
    lead: string;
    purposeTitle: string;
    purposeText: string;
    availableTitle: string;
    available: string[];
    nextTitle: string;
    nextText: string;
  };
  digitalTwins: {
    title: string;
    description: string;
    lead: string;
  };
  projects: {
    status: string;
    open: string;
    back: string;
    structureTitle: string;
    structureText: string;
    stagesTitle: string;
    tablets: ProjectCopy;
    capsules: ProjectCopy;
  };
  materials: {
    title: string;
    description: string;
    lead: string;
    items: string[];
  };
  login: {
    title: string;
    description: string;
    text: string;
  };
  notFound: {
    title: string;
    text: string;
    action: string;
  };
};

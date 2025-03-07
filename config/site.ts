export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "PReviewer",
  description: "Automate Pull Request Reviews with AI-powered insights.",
  navItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Config",
      href: "/config",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Config",
      href: "/config",
    }
  ],
  links: {
    github: "https://github.com/bprabin811",
    twitter: "https://twitter.com/",
  },
};

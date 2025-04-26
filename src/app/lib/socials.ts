// ~/app/lib/socials.ts

// Define the SocialLink type that's used in the Footer component
export interface SocialLink {
    name: string;
    url: string;
    icon: string; // Path to icon image
  }
  
  // Export the social links array that's imported in the Footer
  export const socialLinks: SocialLink[] = [
    {
      name: "Twitter",
      url: "https://twitter.com/yourusername",
      icon: "/icons/twitter.svg"
    },
    {
      name: "GitHub",
      url: "https://github.com/yourusername",
      icon: "/icons/github.svg"
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/yourusername",
      icon: "/icons/linkedin.svg"
    },
    {
      name: "Instagram",
      url: "https://instagram.com/yourusername",
      icon: "/icons/instagram.svg"
    },
    // Add more social platforms as needed
  ];
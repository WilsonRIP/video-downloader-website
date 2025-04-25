"use client";

import { Mulish } from "next/font/google";
import { useState, useEffect } from "react";
import { socialLinks, SocialLink } from "../data/socials";
import { WEBSITE_NAME } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const mulish = Mulish({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

interface FooterProps {
  backgroundImage?: string;
  backgroundOverlay?: string;
}

// Useful links for the footer
const footerLinks = [
  {
    title: "Navigation",
    links: [
      { name: "Home", url: "/" },
      { name: "Projects", url: "/projects" },
      { name: "About", url: "/about" },
      { name: "Contact", url: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", url: "#" },
      { name: "Portfolio", url: "/projects" },
      { name: "Resume", url: "/resume" },
    ],
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Footer({
  backgroundImage = "/blank-sand.jpg",
  backgroundOverlay = "bg-white/90",
}: FooterProps) {
  const [imageLoaded, setImageLoaded] = useState(!backgroundImage);
  const [currentYear] = useState(new Date().getFullYear());

  // Preload via the DOM Image constructor
  useEffect(() => {
    if (!backgroundImage) return;
    const img = new globalThis.Image();
    img.src = backgroundImage;
    img.onload = () => setImageLoaded(true);
  }, [backgroundImage]);

  return (
    <footer
      className={`${mulish.className} relative text-gray-800 dark:text-white py-12 mt-16`}
    >
      {/* Background */}
      {backgroundImage && (
        <div
          className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-500 bg-cover bg-center bg-no-repeat ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url("${backgroundImage}")`,
          }}
        />
      )}
      {backgroundImage && (
        <div
          className={`absolute inset-0 w-full h-full z-1 ${backgroundOverlay} dark:bg-gray-900/90`}
        />
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 z-0" />
      )}

      {/* Content */}
      <motion.div
        className="container mx-auto relative z-10 px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gray-300 dark:border-gray-700">
          {/* About Section */}
          <motion.div variants={fadeIn} className="col-span-1 lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              {WEBSITE_NAME}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              A passionate developer focused on creating intuitive and engaging
              digital experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social: SocialLink) => (
                <a
                  key={social.name}
                  href={social.url}
                  aria-label={social.name}
                  className="relative group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.div
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-all duration-300 overflow-hidden relative"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={social.icon}
                      alt={social.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </motion.div>

                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <motion.div
              key={section.title}
              variants={fadeIn}
              className="col-span-1"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.url}
                      className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors duration-300 inline-block py-1"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter/Coming Soon */}
          <motion.div variants={fadeIn} className="col-span-1 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Stay Updated
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Newsletter functionality is coming soon! Check back later for
              updates on projects and articles.
            </p>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          variants={fadeIn}
          className="flex flex-col md:flex-row justify-between items-center pt-6 mt-4"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {currentYear} {WEBSITE_NAME}. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacy"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookie-policy"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}

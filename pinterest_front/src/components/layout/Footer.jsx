import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Pinterest, YouTube } from "@mui/icons-material";

const Footer = () => {

    const footerLinks = [
        { name: "About", path: "/about" },
        { name: "Blog", path: "/blog" },
        { name: "Creators", path: "/creators" },
        { name: "Careers", path: "/careers" },
        { name: "Help Center", path: "/help" },
    ];

    const policyLinks = [
        { name: "Terms of Service", path: "/terms" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Cookie Settings", path: "/cookies" },
        { name: "Accessibility", path: "/accessibility" },
    ];

    const socialLinks = [
        { icon: <Instagram />, path: "https://instagram.com" },
        { icon: <Facebook />, path: "https://facebook.com" },
        { icon: <Twitter />, path: "https://twitter.com" },
        { icon: <Pinterest className="text-red-600" />, path: "https://pinterest.com" },
        { icon: <YouTube />, path: "https://youtube.com" },
    ];

    return (
        <footer className="bg-white pt-12 pb-6 mt-12 border-t border-gray-200">
            <div className="container mx-auto px-4">

                <div className="flex flex-wrap justify-center mb-8">
                    {footerLinks.map((link, index) => (
                        <div key={index} className="px-4 mb-4">
                            <Link to={link.path} className="text-gray-600 hover:text-red-600 text-sm font-medium">
                                {link.name}
                            </Link>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center space-x-4 mb-8">
                    {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100"
                        >
                            {link.icon}
                        </a>
                    ))}
                </div>
                
                <div className="text-center border-t border-gray-100 pt-6">
                    <div className="flex flex-wrap justify-center mb-4">
                        {policyLinks.map((link, index) => (
                            <div key={index} className="px-3 mb-2">
                                <Link to={link.path} className="text-gray-500 hover:text-red-600 text-xs">
                                    {link.name}
                                </Link>
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-500 text-xs">
                        © 2025 Clone Pinterest. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
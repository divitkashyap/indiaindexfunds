import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/logo.svg';

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: ['Screener', 'Analytics', 'Portfolio Tracker', 'Market Data']
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Blog']
    },
    {
      title: 'Contact',
      links: ['Support', 'Help Center', 'Community', 'Feedback']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer']
    }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border-t border-border mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 -mt-4">
              <img 
                src={logo} 
                alt="India Index Funds Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover and compare the best index funds and ETFs in India. Make informed investment decisions with our comprehensive screening platform.
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} India Index Funds. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-muted-foreground">
              Market data provided by leading exchanges
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
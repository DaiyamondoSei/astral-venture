
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-quantum-900 text-quantum-100 py-6 border-t border-quantum-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Quanex</h3>
            <p className="text-sm text-quantum-300">
              Explore the depths of consciousness and elevate your spiritual journey
              through our integrated practices and visualizations.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-quantum-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/practice" className="text-sm text-quantum-300 hover:text-white transition-colors">
                  Practice
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-sm text-quantum-300 hover:text-white transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-quantum-300 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-quantum-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-quantum-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-quantum-800 text-center text-sm text-quantum-400">
          <p>© {currentYear} Quanex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

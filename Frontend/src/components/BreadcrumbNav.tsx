import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNav = () => {
  const location = useLocation();
  
  const getBreadcrumbItems = () => {
    const pathname = location.pathname;
    const items = [];
    
    // Always add home
    items.push({ name: 'Home', path: '/', current: pathname === '/' });
    
    // Add other pages
    if (pathname === '/reading') {
      items.push({ name: 'Your Reading', path: '/reading', current: true });
    } else if (pathname === '/natal-chart') {
      items.push({ name: 'Natal Chart', path: '/natal-chart', current: true });
    } else if (pathname === '/privacy') {
      items.push({ name: 'Privacy Policy', path: '/privacy', current: true });
    }
    
    return items;
  };

  const items = getBreadcrumbItems();
  
  // Don't show breadcrumb on home page
  if (items.length === 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-300 mb-6 px-4">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.current ? (
            <span className="text-white font-medium">{item.name}</span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-white transition-colors flex items-center"
            >
              {item.path === '/' && <Home className="h-4 w-4 mr-1" />}
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;

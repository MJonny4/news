import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  NewspaperIcon, 
  HomeIcon, 
  CogIcon, 
  DocumentMagnifyingGlassIcon,
  PlayCircleIcon 
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Articles', href: '/articles', icon: NewspaperIcon },
  { name: 'Search', href: '/search', icon: DocumentMagnifyingGlassIcon },
  { name: 'Fetch Jobs', href: '/fetch', icon: PlayCircleIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 shrink-0 items-center px-6">
          <div className="flex items-center">
            <NewspaperIcon className="h-8 w-8 text-primary-600" />
            <h1 className="ml-3 text-xl font-bold text-gray-900">News Hub</h1>
          </div>
        </div>
        
        <nav className="mt-8">
          <ul role="list" className="flex flex-1 flex-col gap-y-7 px-6">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};
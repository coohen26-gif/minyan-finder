import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X, Synagogue } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'he', label: 'HE', flag: '🇮🇱' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/synagogues', label: t('nav.synagogues') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <Synagogue className="h-6 w-6" />
            <span className="font-bold">{t('app.title')}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'transition-colors hover:text-foreground/80',
                isActive(item.path) ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Language Switcher */}
        <div className="hidden md:flex items-center space-x-2 mr-4">
          <Globe className="h-4 w-4 text-muted-foreground" />
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                'px-2 py-1 rounded text-sm font-medium transition-colors',
                i18n.language === lang.code
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'block py-2 text-sm font-medium',
                  isActive(item.path) ? 'text-foreground' : 'text-foreground/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Globe className="h-4 w-4 text-muted-foreground" />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'px-2 py-1 rounded text-sm font-medium transition-colors',
                    i18n.language === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

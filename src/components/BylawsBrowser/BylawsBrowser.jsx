import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../../context/LanguageContext';
import { getSectionText, searchBylaws } from '../../utils/bylaw-helpers';
import bylawsData from '../../data/bylaws-content.json';

export default function BylawsBrowser() {
  const { language } = useLanguage();
  const location = useLocation();
  const [expandedArticles, setExpandedArticles] = useState(
    bylawsData.articles.map((a) => a.number)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    if (location.state?.section) {
      scrollToSection(location.state.section);
    }
  }, [location.state]);

  const searchResults = searchBylaws(searchQuery, bylawsData, language);

  const toggleArticle = (num) => {
    setExpandedArticles((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const scrollToSection = (sectionNumber) => {
    const el = sectionRefs.current[sectionNumber];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionNumber);
    }
    setSidebarOpen(false);
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300/40 dark:bg-yellow-400/30 text-inherit px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-branson-blue text-white p-3 rounded-full shadow-lg cursor-pointer"
      >
        <Search size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          'w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 overflow-hidden',
          'lg:translate-x-0 lg:relative',
          sidebarOpen
            ? 'translate-x-0 fixed inset-y-16 left-0 z-30'
            : '-translate-x-full fixed lg:relative'
        )}
      >
        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search bylaws..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-branson-blue"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-1.5">
              {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found
            </p>
          )}
        </div>

        {/* Article tree */}
        <nav className="flex-1 overflow-y-auto p-2 text-sm">
          {bylawsData.articles.map((article) => {
            const isExpanded = expandedArticles.includes(article.number);
            const hasMatch = searchQuery && searchResults.some((r) => r.articleNumber === article.number);

            return (
              <div key={article.number} className="mb-1">
                <button
                  onClick={() => toggleArticle(article.number)}
                  className={clsx(
                    'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer',
                    hasMatch
                      ? 'text-branson-blue font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{article.number}.</span>
                  <span className="truncate">{article.title}</span>
                </button>

                {isExpanded && (
                  <div className="ml-5 border-l border-slate-200 dark:border-slate-800 pl-2 space-y-0.5">
                    {article.sections.map((section) => {
                      const sectionMatch = searchQuery && searchResults.some((r) => r.sectionNumber === section.number);
                      return (
                        <button
                          key={section.number}
                          onClick={() => scrollToSection(section.number)}
                          className={clsx(
                            'w-full text-left px-2 py-1 rounded text-xs transition-colors cursor-pointer',
                            activeSection === section.number
                              ? 'bg-branson-blue/10 dark:bg-branson-blue/20 text-branson-blue font-medium'
                              : sectionMatch
                              ? 'text-branson-blue'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                          )}
                        >
                          <span className="font-mono">{section.number}</span>{' '}
                          <span className="truncate">{section.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {bylawsData.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{bylawsData.subtitle}</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Effective: {bylawsData.effectiveDate}</p>
          </div>

          {bylawsData.articles.map((article) => (
            <article key={article.number} className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                Article {article.number}. {article.title}
              </h2>

              {article.sections.map((section) => (
                <section
                  key={section.number}
                  ref={(el) => (sectionRefs.current[section.number] = el)}
                  id={`section-${section.number}`}
                  className={clsx(
                    'mb-8 p-5 rounded-lg border transition-colors',
                    activeSection === section.number
                      ? 'border-branson-blue/50 bg-branson-blue/5'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      <span className="font-mono text-branson-blue text-sm mr-2">
                        {section.number}
                      </span>
                      {section.title}
                    </h3>
                    {section.source && (
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {section.source}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                    {highlightText(getSectionText(section, language), searchQuery)}
                  </div>
                </section>
              ))}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { formulas, formulaCategories } from '../data/formulas';
import { useBookmarkStore } from '../store';
import { BlockKaTeX } from '../components/KaTeX';
import { PageWrapper } from '../components/AppShell';

function FormulaCard({ formula }) {
  const [expanded, setExpanded] = useState(false);
  const { toggleFormulaBookmark, isFormulaBookmarked } = useBookmarkStore();
  const bookmarked = isFormulaBookmarked(formula.id);

  return (
    <motion.div layout className="card overflow-hidden card-glow-gold">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{formula.title}</h3>
              <span className="badge text-xs px-2 py-0.5"
                style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(245,158,11,0.2)' }}>
                {formula.category}
              </span>
            </div>
          </div>
          <button onClick={() => toggleFormulaBookmark(formula.id)}
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ color: bookmarked ? 'var(--accent-gold)' : 'var(--text-muted)', background: bookmarked ? 'rgba(245,158,11,0.1)' : 'transparent' }}>
            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        {/* LaTeX Formula */}
        <div className="rounded-xl p-4 mb-3 overflow-x-auto"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <BlockKaTeX latex={formula.latex} />
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{formula.explanation}</p>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mt-3">
          {formula.tags.slice(0, 3).map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
              <Tag size={9} />{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Expand / Collapse */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}>
        {expanded ? <><ChevronUp size={14} /> Hide Details</> : <><ChevronDown size={14} /> Show Derivation & Variables</>}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}>
            <div className="p-4 space-y-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              {formula.derivation && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--accent-gold)' }}>Derivation</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{formula.derivation}</p>
                </div>
              )}
              {formula.variables?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-gold)' }}>Variables</p>
                  <div className="space-y-1.5">
                    {formula.variables.map(v => (
                      <div key={v.sym} className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-gold)', minWidth: 60 }}>
                          {v.sym.replace(/\\/g, '')}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FormulaSheet() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { bookmarkedFormulas } = useBookmarkStore();
  const [showBookmarked, setShowBookmarked] = useState(false);

  const filtered = formulas.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.title.toLowerCase().includes(q) || f.tags.some(t => t.includes(q)) || f.category.toLowerCase().includes(q);
    const matchCat = activeCategory === 'All' || f.category === activeCategory;
    const matchBookmark = !showBookmarked || bookmarkedFormulas.includes(f.id);
    return matchSearch && matchCat && matchBookmark;
  });

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Formula Sheet</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {formulas.length} formulas with LaTeX rendering, derivations, and bookmarks
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-field pl-9"
              placeholder="Search formulas, tags, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowBookmarked(!showBookmarked)}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            style={showBookmarked ? { borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)', background: 'rgba(245,158,11,0.1)' } : {}}>
            <Bookmark size={15} />
            {showBookmarked ? 'All' : 'Bookmarked'} ({bookmarkedFormulas.length})
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          {['All', ...formulaCategories].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="badge px-3 py-1.5 cursor-pointer transition-all text-xs"
              style={{
                background: activeCategory === cat ? 'rgba(245,158,11,0.2)' : 'var(--bg-card)',
                color: activeCategory === cat ? 'var(--accent-gold)' : 'var(--text-muted)',
                border: `1px solid ${activeCategory === cat ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Showing {filtered.length} of {formulas.length} formulas</p>

        {/* Formulas Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map(f => (
              <motion.div key={f.id} layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}>
                <FormulaCard formula={f} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
            <p>No formulas match your search.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

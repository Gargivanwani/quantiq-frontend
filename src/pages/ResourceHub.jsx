import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Bookmark, BookmarkCheck, Search, Star, Download } from 'lucide-react';
import { resources } from '../data/resources';
import { useBookmarkStore } from '../store';
import { PageWrapper } from '../components/AppShell';

function ResourceItem({ item, category }) {
  const { toggleResourceBookmark, isResourceBookmarked } = useBookmarkStore();
  const id = `${category}-${item.title}`;
  const bookmarked = isResourceBookmarked(id);

  return (
    <div className="card p-4 flex gap-3 group card-glow-blue">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1 flex-wrap">
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="font-semibold text-sm hover:underline flex items-center gap-1.5 group-hover:text-blue-400 transition-colors"
            style={{ color: 'var(--text-primary)' }}>
            {item.title}
            <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </a>
          {item.free && (
            <span className="badge text-xs px-1.5 py-0.5 flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              Free
            </span>
          )}
        </div>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>by {item.author}</p>
        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
        {item.pdfUrl && (
          <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
            style={{ color: 'var(--accent-gold)' }}>
            <Download size={12} /> View/Download Free PDF
          </a>
        )}
      </div>
      <button onClick={() => toggleResourceBookmark(id)}
        className="p-1.5 rounded-lg h-fit flex-shrink-0 transition-colors"
        style={{ color: bookmarked ? 'var(--accent-gold)' : 'var(--text-muted)', background: bookmarked ? 'rgba(245,158,11,0.1)' : 'transparent' }}>
        {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>
    </div>
  );
}

export default function ResourceHub() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { bookmarkedResources } = useBookmarkStore();
  const [showBookmarked, setShowBookmarked] = useState(false);

  const categories = ['All', ...resources.map(r => r.category)];

  const filteredResources = resources
    .filter(section => activeCategory === 'All' || section.category === activeCategory)
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        const q = search.toLowerCase();
        const id = `${section.category}-${item.title}`;
        const matchSearch = !q || item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
        const matchBookmark = !showBookmarked || bookmarkedResources.includes(id);
        return matchSearch && matchBookmark;
      }),
    }))
    .filter(section => section.items.length > 0);

  const totalItems = resources.reduce((s, r) => s + r.items.length, 0);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Resource Hub</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {totalItems} curated resources across textbooks, videos, courses, papers, and tools
          </p>
        </div>

        {/* Search + Bookmark filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowBookmarked(!showBookmarked)}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            style={showBookmarked ? { borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)', background: 'rgba(245,158,11,0.1)' } : {}}>
            <Star size={15} />
            Saved ({bookmarkedResources.length})
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => {
            const section = resources.find(r => r.category === cat);
            const active = activeCategory === cat;
            const color = section?.color || 'var(--accent-gold)';
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border"
                style={{
                  background: active ? `${color}20` : 'var(--bg-card)',
                  color: active ? color : 'var(--text-muted)',
                  borderColor: active ? `${color}40` : 'var(--border)',
                }}>
                {section?.icon} {cat}
              </button>
            );
          })}
        </div>

        {/* Resource Sections */}
        {filteredResources.map((section, si) => (
          <motion.div key={section.category}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.06 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{section.category}</h2>
              <span className="badge text-xs px-2" style={{ background: `${section.color}20`, color: section.color }}>
                {section.items.length}
              </span>
            </div>
            <div className="space-y-2">
              {section.items.map(item => (
                <ResourceItem key={item.title} item={item} category={section.category} />
              ))}
            </div>
          </motion.div>
        ))}

        {filteredResources.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p>No resources match your search.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

import { useState, useEffect } from 'react';
import katex from 'katex';

export function KaTeX({ latex, block = false, className = '' }) {
  const [rendered, setRendered] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const html = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: block,
        trust: true,
      });
      setRendered(html);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [latex, block]);

  if (error) return <code className="text-rose-400 text-sm">{latex}</code>;

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}

export function BlockKaTeX({ latex, className = '' }) {
  return (
    <div className={`overflow-x-auto py-2 ${className}`}>
      <KaTeX latex={latex} block={true} />
    </div>
  );
}

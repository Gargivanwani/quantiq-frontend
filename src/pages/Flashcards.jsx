import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Zap, CheckCircle, ChevronRight } from 'lucide-react';
import { flashcardDecks } from '../data/flashcards';
import { useFlashcardStore, useProgressStore } from '../store';
import { PageWrapper } from '../components/AppShell';

// ── Deck List ──────────────────────────────────────────────────
export default function FlashcardHub() {
  const { getDueCount } = useFlashcardStore();

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Flashcards</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Spaced repetition (SM-2 algorithm). Review due cards to maximise retention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {flashcardDecks.map((deck, i) => {
            const due = getDueCount(deck.id);
            return (
              <motion.div key={deck.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link to={`/flashcards/${deck.id}`}
                  className="card p-5 block group cursor-pointer card-glow-blue"
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 24px ${deck.color}30`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg"
                      style={{ background: `${deck.color}20`, border: `1px solid ${deck.color}40`, color: deck.color }}>
                      {deck.cards.length}
                    </div>
                    {due > 0 && (
                      <span className="badge px-2 py-1 text-xs font-bold animate-pulse-soft"
                        style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--accent-gold)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        {due} due
                      </span>
                    )}
                    {due === 0 && (
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    )}
                  </div>
                  <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{deck.title}</h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{deck.topic} · {deck.cards.length} cards</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {deck.cards.slice(0, 3).map((_, j) => (
                        <div key={j} className="w-5 h-5 rounded-full border-2"
                          style={{ background: `${deck.color}30`, borderColor: 'var(--bg-card)' }} />
                      ))}
                    </div>
                    <span className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                      style={{ color: deck.color }}>
                      {due > 0 ? 'Review Now' : 'Practice'} <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}

// ── Review Session ─────────────────────────────────────────────
export function ReviewSession() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const deck = flashcardDecks.find(d => d.id === deckId);
  const { sessionQueue, sessionIndex, startSession, rateCard, nextCard, resetSession } = useFlashcardStore();
  const { recordStudy } = useProgressStore();

  const [started, setStarted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);

  if (!deck) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Deck not found</div>;

  const handleStart = () => {
    startSession(deckId);
    setStarted(true);
    setFlipped(false);
    setSelectedRating(null);
  };

  const handleRate = (rating) => {
    const card = sessionQueue[sessionIndex];
    rateCard(card.id, rating);
    recordStudy();
    if (autoAdvance) {
      nextCard();
      setFlipped(false);
      setSelectedRating(null);
    } else {
      setSelectedRating(rating);
    }
  };

  const handleNext = () => {
    nextCard();
    setFlipped(false);
    setSelectedRating(null);
  };

  const handleSkip = () => {
    nextCard();
    setFlipped(false);
    setSelectedRating(null);
  };

  const done = started && sessionIndex >= sessionQueue.length;

  if (!started) {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto">
          <Link to="/flashcards" className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={16} /> Back to Decks
          </Link>
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: `${deck.color}20`, border: `1px solid ${deck.color}40` }}>
              🃏
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{deck.title}</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{deck.cards.length} cards · SM-2 spaced repetition</p>
            <button onClick={handleStart} className="btn-primary w-full flex items-center justify-center gap-2">
              <Zap size={16} /> Start Review Session
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (done) {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto text-center">
          <div className="card p-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 gradient-text">Session Complete!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              You reviewed {sessionQueue.length} cards. Keep up the streak!
            </p>
            <div className="flex gap-3">
              <button onClick={() => { resetSession(); setStarted(false); }}
                className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <RotateCcw size={15} /> Restart
              </button>
              <Link to="/flashcards" className="btn-primary flex-1 flex items-center justify-center gap-2">
                Back to Decks
              </Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const card = sessionQueue[sessionIndex];
  const progress = (sessionIndex / sessionQueue.length) * 100;

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/flashcards" className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>{deck.title}</span>
              <span>{sessionIndex + 1} / {sessionQueue.length}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full" style={{ background: deck.color }}
                animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        </div>

        {/* Quick controls bar */}
        <div className="flex justify-between items-center text-xs mb-4 px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={e => setAutoAdvance(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            Auto-advance on rating
          </label>
          <button
            onClick={handleSkip}
            className="hover:underline flex items-center gap-0.5 font-semibold transition-colors"
            style={{ color: 'var(--accent-gold)' }}
          >
            Skip Card <ChevronRight size={12} />
          </button>
        </div>

        {/* Flip Card */}
        <div className="flip-card" style={{ height: 280 }} onClick={() => setFlipped(!flipped)}>
          <AnimatePresence mode="wait">
            <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="flip-card-front p-8 flex flex-col items-center justify-center cursor-pointer"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <span className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: deck.color }}>Question</span>
                <p className="text-base font-semibold text-center leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {card.front}
                </p>
                <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>Tap to reveal answer</p>
              </div>
              {/* Back */}
              <div className="flip-card-back p-6 flex flex-col items-start justify-center cursor-pointer overflow-y-auto"
                style={{ background: `linear-gradient(135deg, ${deck.color}18, var(--bg-card))`, border: `1px solid ${deck.color}30` }}>
                <span className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: deck.color }}>Answer</span>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                  {card.back}
                </p>
              </div>
            </div>
          </AnimatePresence>
        </div>

        {/* Confidence & Action Buttons */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Again', emoji: '😕', rating: 0, color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
                  { label: 'Good', emoji: '🙂', rating: 1, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                  { label: 'Easy', emoji: '😄', rating: 2, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                ].map(btn => {
                  const isSelected = selectedRating === btn.rating;
                  return (
                    <button key={btn.label} onClick={() => handleRate(btn.rating)}
                      className="py-3 rounded-xl font-semibold text-sm flex flex-col items-center gap-1 transition-all"
                      style={{
                        background: isSelected ? btn.color : btn.bg,
                        color: isSelected ? 'var(--bg-primary)' : btn.color,
                        border: `1px solid ${btn.color}40`,
                        transform: isSelected ? 'scale(1.05)' : ''
                      }}
                      onMouseEnter={e => !isSelected && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => !isSelected && (e.currentTarget.style.transform = '')}>
                      <span className="text-xl">{btn.emoji}</span>
                      <span className={isSelected ? 'font-bold' : ''}>{btn.label}</span>
                    </button>
                  );
                })}
              </div>

              {!autoAdvance && selectedRating !== null && (
                <button
                  onClick={handleNext}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-lg"
                  style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}
                >
                  Next Card <ChevronRight size={16} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

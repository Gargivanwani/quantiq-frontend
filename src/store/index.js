import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { flashcardDecks } from '../data/flashcards';

// SM-2 Algorithm
function sm2(card, rating) {
  // rating: 0=Again, 1=Good, 2=Easy
  let { interval = 1, repetitions = 0, easeFactor = 2.5 } = card;

  if (rating === 0) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    const q = rating === 1 ? 3 : 5; // Good=3, Easy=5
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    repetitions += 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { interval, repetitions, easeFactor, nextReview: nextReview.toISOString() };
}

// Initialize card states from flashcard decks
function initCardStates() {
  const states = {};
  flashcardDecks.forEach(deck => {
    deck.cards.forEach(card => {
      states[card.id] = {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
      };
    });
  });
  return states;
}

export const useFlashcardStore = create(
  persist(
    (set, get) => ({
      cardStates: initCardStates(),
      sessionQueue: [],
      sessionIndex: 0,
      reviewedToday: 0,

      startSession: (deckId) => {
        const deck = flashcardDecks.find(d => d.id === deckId);
        if (!deck) return;
        const now = new Date();
        const due = deck.cards.filter(c => {
          const state = get().cardStates[c.id];
          return !state || new Date(state.nextReview) <= now;
        });
        // If no due cards, show all cards
        const queue = due.length > 0 ? due : deck.cards;
        set({ sessionQueue: queue, sessionIndex: 0 });
      },

      rateCard: (cardId, rating) => {
        const state = get().cardStates[cardId] || {};
        const updated = sm2(state, rating);
        set(s => ({
          cardStates: { ...s.cardStates, [cardId]: updated },
          reviewedToday: s.reviewedToday + 1,
        }));
      },

      nextCard: () => set(s => ({
        sessionIndex: s.sessionIndex + 1
      })),

      getDueCount: (deckId) => {
        const deck = flashcardDecks.find(d => d.id === deckId);
        if (!deck) return 0;
        const now = new Date();
        return deck.cards.filter(c => {
          const state = get().cardStates[c.id];
          return !state || new Date(state.nextReview) <= now;
        }).length;
      },

      getTotalDueCount: () => {
        const now = new Date();
        return flashcardDecks.reduce((sum, deck) => {
          return sum + deck.cards.filter(c => {
            const state = get().cardStates[c.id];
            return !state || new Date(state.nextReview) <= now;
          }).length;
        }, 0);
      },

      resetSession: () => set({ sessionQueue: [], sessionIndex: 0 }),
    }),
    { name: 'quantiq-flashcards' }
  )
);

export const useAppStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      activeSection: 'dashboard',

      toggleTheme: () => set(s => {
        const newTheme = s.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('light', newTheme === 'light');
        return { theme: newTheme };
      }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveSection: (section) => set({ activeSection: section }),

      initTheme: () => {
        const stored = JSON.parse(localStorage.getItem('quantiq-app') || '{}');
        const theme = stored?.state?.theme || 'dark';
        document.documentElement.classList.toggle('light', theme === 'light');
      },
    }),
    { name: 'quantiq-app' }
  )
);

export const useProgressStore = create(
  persist(
    (set, get) => ({
      streak: 3,
      lastStudyDate: new Date().toISOString().split('T')[0],
      dailyGoals: {
        flashcards: { target: 20, done: 7 },
        problems: { target: 2, done: 1 },
        reading: { target: 30, done: 20 }, // minutes
      },
      topicProgress: {},
      heatmapData: generateHeatmap(),
      weeklyStats: { cardsReviewed: 45, problemsSolved: 8, studyMinutes: 180 },

      completeSubtopic: (topicId, subtopic) => set(s => {
        const prev = s.topicProgress[topicId] || { completed: [] };
        const isCompleted = prev.completed.includes(subtopic);
        const nextCompleted = isCompleted
          ? prev.completed.filter(sub => sub !== subtopic)
          : [...prev.completed, subtopic];
        return {
          topicProgress: {
            ...s.topicProgress,
            [topicId]: { completed: nextCompleted },
          },
        };
      }),

      getTopicCompletion: (topicId, totalSubtopics) => {
        const prog = get().topicProgress[topicId];
        if (!prog || totalSubtopics === 0) return 0;
        return Math.round((prog.completed.length / totalSubtopics) * 100);
      },

      updateDailyGoal: (key, delta) => set(s => ({
        dailyGoals: {
          ...s.dailyGoals,
          [key]: { ...s.dailyGoals[key], done: Math.min(s.dailyGoals[key].target, s.dailyGoals[key].done + delta) },
        },
      })),

      recordStudy: () => {
        const today = new Date().toISOString().split('T')[0];
        set(s => {
          const newData = { ...s.heatmapData, [today]: (s.heatmapData[today] || 0) + 1 };
          const isNewDay = s.lastStudyDate !== today;
          return {
            heatmapData: newData,
            lastStudyDate: today,
            streak: isNewDay ? s.streak + 1 : s.streak,
          };
        });
      },
    }),
    { name: 'quantiq-progress' }
  )
);

function generateHeatmap() {
  const data = {};
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    // Simulate random study activity
    if (Math.random() > 0.45) {
      data[key] = Math.floor(Math.random() * 8) + 1;
    }
  }
  return data;
}

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: {},
      uploadedNotes: {}, // topicId -> array of { id, name, type, size, date, dataUrl }

      setNote: (topicId, content) => set(s => ({
        notes: { ...s.notes, [topicId]: { ...s.notes[topicId], content, updatedAt: new Date().toISOString() } },
      })),

      getNote: (topicId) => get().notes[topicId]?.content || '',

      addUploadedNote: (topicId, note) => set(s => {
        const prev = s.uploadedNotes[topicId] || [];
        return {
          uploadedNotes: {
            ...s.uploadedNotes,
            [topicId]: [...prev, note],
          },
        };
      }),

      deleteUploadedNote: (topicId, noteId) => set(s => {
        const prev = s.uploadedNotes[topicId] || [];
        return {
          uploadedNotes: {
            ...s.uploadedNotes,
            [topicId]: prev.filter(n => n.id !== noteId),
          },
        };
      }),

      getUploadedNotes: (topicId) => get().uploadedNotes[topicId] || [],
    }),
    { name: 'quantiq-notes' }
  )
);

export const useBookmarkStore = create(
  persist(
    (set, get) => ({
      bookmarkedFormulas: [],
      bookmarkedResources: [],

      toggleFormulaBookmark: (id) => set(s => ({
        bookmarkedFormulas: s.bookmarkedFormulas.includes(id)
          ? s.bookmarkedFormulas.filter(f => f !== id)
          : [...s.bookmarkedFormulas, id],
      })),

      toggleResourceBookmark: (id) => set(s => ({
        bookmarkedResources: s.bookmarkedResources.includes(id)
          ? s.bookmarkedResources.filter(r => r !== id)
          : [...s.bookmarkedResources, id],
      })),

      isFormulaBookmarked: (id) => get().bookmarkedFormulas.includes(id),
      isResourceBookmarked: (id) => get().bookmarkedResources.includes(id),
    }),
    { name: 'quantiq-bookmarks' }
  )
);

export const useProblemStore = create(
  persist(
    (set, get) => ({
      solved: [],
      attempted: [],

      markSolved: (id) => set(s => ({
        solved: s.solved.includes(id) ? s.solved : [...s.solved, id],
        attempted: s.attempted.includes(id) ? s.attempted : [...s.attempted, id],
      })),

      markAttempted: (id) => set(s => ({
        attempted: s.attempted.includes(id) ? s.attempted : [...s.attempted, id],
      })),

      isSolved: (id) => get().solved.includes(id),
      isAttempted: (id) => get().attempted.includes(id),
    }),
    { name: 'quantiq-problems' }
  )
);

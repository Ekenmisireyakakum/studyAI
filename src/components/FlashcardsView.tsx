import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsViewProps {
  cards: Flashcard[];
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ cards: initialCards }) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [filterUnmastered, setFilterUnmastered] = useState(false);

  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [initialCards]);

  const displayedCards = filterUnmastered
    ? cards.filter((_, idx) => !masteredIds.has(idx))
    : cards;

  const currentCard = displayedCards[currentIndex] || displayedCards[0];
  const realIndex = cards.indexOf(currentCard);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < displayedCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, displayedCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(displayedCards.length - 1);
    }
  }, [currentIndex, displayedCards.length]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleToggleMastered = () => {
    if (realIndex === -1) return;
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(realIndex)) {
        next.delete(realIndex);
      } else {
        next.add(realIndex);
      }
      return next;
    });
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleResetProgress = () => {
    setMasteredIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFlip, handleNext, handlePrev]);

  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-slate-500">
        <Layers className="w-10 h-10 mx-auto mb-3 text-sky-400 opacity-60" />
        <p>No flashcards generated yet. Summarize your notes to build flashcards!</p>
      </div>
    );
  }

  const isCurrentMastered = masteredIds.has(realIndex);
  const masteredCount = masteredIds.size;
  const progressPct = Math.round((masteredCount / cards.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header controls & stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-sky-100 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Recall Flashcards</h3>
            <p className="text-xs text-slate-500">
              {masteredCount} of {cards.length} mastered ({progressPct}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnmastered(!filterUnmastered)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterUnmastered
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterUnmastered ? 'Showing: Unmastered Only' : 'Showing: All Cards'}
          </button>

          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="p-2 rounded-lg bg-white hover:bg-sky-50 text-slate-600 border border-slate-200 transition-colors shadow-xs"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetProgress}
            title="Reset Mastery Progress"
            className="p-2 rounded-lg bg-white hover:bg-sky-50 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-sky-100 h-2.5 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-sky-400 to-blue-500 h-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Flashcard Component */}
      {displayedCards.length > 0 && currentCard ? (
        <div className="space-y-4">
          <div
            onClick={toggleFlip}
            className="group relative cursor-pointer select-none perspective-1000 min-h-[320px] sm:min-h-[360px]"
          >
            <div
              className={`w-full h-full min-h-[320px] sm:min-h-[360px] rounded-2xl border transition-all duration-500 transform-style-3d p-6 sm:p-8 flex flex-col justify-between shadow-lg shadow-sky-100/60 ${
                isFlipped
                  ? 'bg-gradient-to-br from-sky-50/90 via-white to-blue-50/50 border-2 border-sky-300'
                  : 'bg-white border-2 border-sky-200 hover:border-sky-300'
              }`}
            >
              {/* Card Top: Category & Status */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  {currentCard.category || 'Core Concept'}
                </span>

                <div className="flex items-center gap-2">
                  {isCurrentMastered && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Mastered
                    </span>
                  )}
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {currentIndex + 1} / {displayedCards.length}
                  </span>
                </div>
              </div>

              {/* Card Center: Front vs Back Content */}
              <div className="my-auto py-6 text-center">
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-[11px] uppercase tracking-wider text-sky-600 font-bold block">
                      Prompt / Question
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-relaxed max-w-xl mx-auto">
                      {currentCard.front}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[11px] uppercase tracking-wider text-sky-700 font-bold block">
                      Answer / Explanation
                    </span>
                    <p className="text-sm sm:text-lg text-slate-900 leading-relaxed max-w-xl mx-auto whitespace-pre-line font-medium">
                      {currentCard.back}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Bottom: Flip hint */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-sky-100">
                <span className="hidden sm:inline">Press [Space] or click to flip</span>
                <span className="sm:hidden">Tap card to flip</span>
                <span className="flex items-center gap-1 text-sky-600 group-hover:text-sky-700 font-medium transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation & Mastery Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-sky-50 text-slate-700 transition-colors shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleToggleMastered}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                isCurrentMastered
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${isCurrentMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isCurrentMastered ? 'Marked as Mastered' : 'Mark as Mastered'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-sky-50 text-slate-700 transition-colors shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-sky-100 text-slate-700 shadow-sm">
          <Sparkles className="w-8 h-8 text-sky-500 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-900">All Cards Mastered!</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            You have mastered every card in this set. Ready to test yourself on the practice exam?
          </p>
          <button
            onClick={() => setFilterUnmastered(false)}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
          >
            Review All Cards Again
          </button>
        </div>
      )}
    </div>
  );
};

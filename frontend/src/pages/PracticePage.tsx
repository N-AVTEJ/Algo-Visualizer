import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Award,
  BookOpen,
} from 'lucide-react';
import { QUIZ_QUESTIONS, type QuizQuestion } from '../data/quizzes';

export const PracticePage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<number | 'all'>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  const filteredQuestions =
    selectedModule === 'all'
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter((q) => q.moduleId === selectedModule);

  const answeredCount = Object.keys(userAnswers).filter((id) =>
    filteredQuestions.some((q) => q.id === id)
  ).length;

  const correctCount = Object.entries(userAnswers).filter(([id, ans]) => {
    const q = filteredQuestions.find((item) => item.id === id);
    return q && q.correctIndex === ans;
  }).length;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (userAnswers[questionId] !== undefined) return; // Prevent changing after answer
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-200 inline-flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Modules</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Practice Arena</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-slate-950/40">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Curriculum Practice Quizzes &bull; 10 DAA Modules</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Algorithm Concept & Complexity Arena</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Test your knowledge on Big-O bounds, recursion trees, dynamic programming recurrences,
            graph invariants, and NP-completeness proofs.
          </p>
        </div>

        {/* Score Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-4 min-w-[220px]">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Current Score</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-mono font-bold text-white">
                {correctCount}/{filteredQuestions.length}
              </span>
              <span className="text-xs text-slate-500">
                ({filteredQuestions.length > 0 ? Math.round((correctCount / filteredQuestions.length) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Filter Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Filter By Module</span>
          </span>
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleResetQuiz}
              className="text-xs text-slate-400 hover:text-rose-400 inline-flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Answers</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedModule('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              selectedModule === 'all'
                ? 'bg-violet-600 text-white border-violet-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Modules ({QUIZ_QUESTIONS.length})
          </button>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((modNum) => {
            const count = QUIZ_QUESTIONS.filter((q) => q.moduleId === modNum).length;
            const isSelected = selectedModule === modNum;
            return (
              <button
                key={modNum}
                type="button"
                onClick={() => setSelectedModule(modNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Module {modNum} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((q: QuizQuestion, index: number) => {
          const userAnswer = userAnswers[q.id];
          const hasAnswered = userAnswer !== undefined;
          const isCorrect = hasAnswered && userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl bg-slate-900/60 border transition-all space-y-4 ${
                hasAnswered
                  ? isCorrect
                    ? 'border-emerald-800/60 bg-emerald-950/10'
                    : 'border-rose-800/60 bg-rose-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Q{index + 1}
                  </span>
                  <span className="text-xs font-medium text-violet-400">
                    Module {q.moduleId}: {q.moduleName}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                    q.difficulty === 'Beginner'
                      ? 'border-emerald-800/60 text-emerald-400 bg-emerald-950/40'
                      : q.difficulty === 'Intermediate'
                        ? 'border-amber-800/60 text-amber-400 bg-amber-950/40'
                        : 'border-purple-800/60 text-purple-400 bg-purple-950/40'
                  }`}
                >
                  {q.difficulty}
                </span>
              </div>

              {/* Question Prompt */}
              <h3 className="text-base font-semibold text-white leading-relaxed">{q.question}</h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isOptionCorrect = q.correctIndex === optIdx;

                  let buttonStyles =
                    'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white';

                  if (hasAnswered) {
                    if (isOptionCorrect) {
                      buttonStyles = 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-semibold';
                    } else if (isSelected && !isOptionCorrect) {
                      buttonStyles = 'bg-rose-950/60 border-rose-600 text-rose-200 font-semibold';
                    } else {
                      buttonStyles = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start space-x-3 focus:outline-none ${buttonStyles}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {hasAnswered && isOptionCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isOptionCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {hasAnswered && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                    isCorrect
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold">
                    <HelpCircle className="w-4 h-4" />
                    <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                  </div>
                  <p className="text-slate-300">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PracticePage;

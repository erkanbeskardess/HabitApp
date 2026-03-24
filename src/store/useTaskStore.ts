import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';

import type {
  Task,
  Completion,
  Quote,
  AppSettings,
  TaskStore,
  StreakInfo,
  DailySummary,
} from '../types';
import { zustandMMKVStorage } from './storage';
import { generateId, completionKey, getTodayDate } from '../utils/helpers';
import { DEFAULT_QUOTES } from '../constants/quotes';

// ─── Varsayılan Ayarlar ──────────────────────────
const defaultSettings: AppSettings = {
  themeMode: 'dark',
  isPrivateUnlocked: false,
  showQuotes: true,
};

// ─── Varsayılan Sözler ──────────────────────────
const initialQuotes: Quote[] = DEFAULT_QUOTES.map((q) => ({
  id: generateId(),
  text: q.text,
  author: q.author,
  isFavorite: false,
}));

// ─── Store ───────────────────────────────────────
export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // ━━━ State ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      tasks: [],
      completions: {},
      quotes: initialQuotes,
      settings: defaultSettings,

      // ━━━ Görev İşlemleri ━━━━━━━━━━━━━━━━━━━━━━

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isActive: true,
          sortOrder: get().tasks.length,
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => {
          // Görevi sil
          const tasks = state.tasks.filter((t) => t.id !== id);
          // İlişkili completion kayıtlarını da sil
          const completions = { ...state.completions };
          Object.keys(completions).forEach((key) => {
            if (key.startsWith(`${id}_`)) {
              delete completions[key];
            }
          });
          return { tasks, completions };
        });
      },

      reorderTasks: (taskIds) => {
        set((state) => ({
          tasks: state.tasks.map((t) => ({
            ...t,
            sortOrder: taskIds.indexOf(t.id),
          })),
        }));
      },

      // ━━━ Tamamlama İşlemleri ━━━━━━━━━━━━━━━━━

      toggleCompletion: (taskId, date) => {
        const key = completionKey(taskId, date);
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        set((state) => {
          const existing = state.completions[key];

          if (existing) {
            // Zaten varsa kaldır (toggle off)
            const { [key]: _, ...rest } = state.completions;
            return { completions: rest };
          }

          // Yoksa ekle (toggle on)
          const newCompletion: Completion = {
            taskId,
            date,
            progress: task.type === 'boolean' ? 1 : 0,
            isCompleted: task.type === 'boolean',
          };
          return {
            completions: { ...state.completions, [key]: newCompletion },
          };
        });
      },

      incrementProgress: (taskId, date, amount = 1) => {
        const key = completionKey(taskId, date);
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || task.type !== 'numeric' || !task.target) return;

        set((state) => {
          const existing = state.completions[key];
          const currentProgress = existing?.progress ?? 0;
          const newProgress = Math.min(currentProgress + amount, task.target!);
          const isCompleted = newProgress >= task.target!;

          const updated: Completion = {
            taskId,
            date,
            progress: newProgress,
            isCompleted,
          };

          return {
            completions: { ...state.completions, [key]: updated },
          };
        });
      },

      decrementProgress: (taskId, date, amount = 1) => {
        const key = completionKey(taskId, date);
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || task.type !== 'numeric') return;

        set((state) => {
          const existing = state.completions[key];
          const currentProgress = existing?.progress ?? 0;
          const newProgress = Math.max(currentProgress - amount, 0);

          // Eğer 0'a düştüyse kaydı sil
          if (newProgress === 0) {
            const { [key]: _, ...rest } = state.completions;
            return { completions: rest };
          }

          const updated: Completion = {
            taskId,
            date,
            progress: newProgress,
            isCompleted: false,
          };

          return {
            completions: { ...state.completions, [key]: updated },
          };
        });
      },

      setProgress: (taskId, date, progress) => {
        const key = completionKey(taskId, date);
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        const target = task.target ?? 1;
        const clampedProgress = Math.max(0, Math.min(progress, target));

        set((state) => {
          if (clampedProgress === 0) {
            const { [key]: _, ...rest } = state.completions;
            return { completions: rest };
          }

          const updated: Completion = {
            taskId,
            date,
            progress: clampedProgress,
            isCompleted: clampedProgress >= target,
          };

          return {
            completions: { ...state.completions, [key]: updated },
          };
        });
      },

      // ━━━ Sorgular (Selectors) ━━━━━━━━━━━━━━━━

      getTasksForDate: (date) => {
        const { tasks } = get();
        return tasks
          .filter((t) => {
            if (!t.isActive) return false;
            // Görev oluşturulma tarihinden öncesi gösterilmez
            const createdDate = dayjs(t.createdAt).format('YYYY-MM-DD');
            return date >= createdDate;
          })
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getCompletion: (taskId, date) => {
        const key = completionKey(taskId, date);
        return get().completions[key];
      },

      getStreak: (taskId) => {
        const { completions } = get();
        const today = getTodayDate();

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastCompletedDate: string | undefined;

        // Son 365 günü kontrol et (geriye doğru)
        for (let i = 0; i < 365; i++) {
          const date = dayjs(today).subtract(i, 'day').format('YYYY-MM-DD');
          const key = completionKey(taskId, date);
          const completion = completions[key];

          if (completion?.isCompleted) {
            tempStreak++;
            if (!lastCompletedDate) {
              lastCompletedDate = date;
            }
            // İlk günden itibaren sayıyorsak currentStreak güncelle
            if (i === currentStreak) {
              currentStreak = tempStreak;
            }
          } else {
            // Zincir kırıldı
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 0;

            // Eğer bugün tamamlanmadıysa ama dün tamamlandıysa,
            // currentStreak'i dünden başlat
            if (i === 0) {
              // Bugün henüz tamamlanmamış, sorun değil — devam et
              continue;
            }

            // İlk boşluk bulunduktan sonra currentStreak artık değişmez
            // ama longestStreak için taramaya devam
          }
        }

        // Son kontrol
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }

        return {
          taskId,
          currentStreak,
          longestStreak,
          lastCompletedDate,
        };
      },

      getDailySummary: (date) => {
        const tasks = get().getTasksForDate(date);
        const visibleTasks = tasks.filter((t) => t.isActive);
        const totalTasks = visibleTasks.length;

        let completedTasks = 0;
        visibleTasks.forEach((task) => {
          const key = completionKey(task.id, date);
          const completion = get().completions[key];
          if (completion?.isCompleted) {
            completedTasks++;
          }
        });

        return {
          date,
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
        };
      },

      getCompletionRateForRange: (startDate, endDate) => {
        let totalPossible = 0;
        let totalCompleted = 0;

        let current = dayjs(startDate);
        const end = dayjs(endDate);

        while (current.isBefore(end) || current.isSame(end, 'day')) {
          const date = current.format('YYYY-MM-DD');
          const summary = get().getDailySummary(date);
          totalPossible += summary.totalTasks;
          totalCompleted += summary.completedTasks;
          current = current.add(1, 'day');
        }

        return totalPossible > 0 ? totalCompleted / totalPossible : 0;
      },

      // ━━━ Motivasyon Sözleri ━━━━━━━━━━━━━━━━━━

      addQuote: (quoteData) => {
        const newQuote: Quote = {
          ...quoteData,
          id: generateId(),
        };
        set((state) => ({
          quotes: [...state.quotes, newQuote],
        }));
      },

      toggleFavoriteQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
          ),
        }));
      },

      removeQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        }));
      },

      // ━━━ Ayarlar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      unlockPrivate: () => {
        set((state) => ({
          settings: { ...state.settings, isPrivateUnlocked: true },
        }));
      },

      lockPrivate: () => {
        set((state) => ({
          settings: { ...state.settings, isPrivateUnlocked: false },
        }));
      },
    }),
    {
      name: 'habit-app-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
      // isPrivateUnlocked her oturumda false olmalı — persist etme
      partialize: (state) => ({
        tasks: state.tasks,
        completions: state.completions,
        quotes: state.quotes,
        settings: {
          ...state.settings,
          isPrivateUnlocked: false, // Her uygulama açılışında kilitli başlar
        },
      }),
    }
  )
);

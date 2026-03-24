// ============================================
// HabitApp - Veri Modelleri (Data Models)
// ============================================

/**
 * Görev tipi: basit (checkbox) veya ölçülü (sayısal ilerleme)
 */
export type TaskType = 'boolean' | 'numeric';

/**
 * Görev tekrarlama sıklığı
 */
export type RepeatFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

/**
 * Görev şablonu — kullanıcının oluşturduğu alışkanlık tanımı.
 * MMKV'de `tasks` anahtarında saklanır.
 */
export interface Task {
  /** Benzersiz kimlik (uuid) */
  id: string;

  /** Görev başlığı — ör: "3 Litre Su İç" */
  title: string;

  /** Görev tipi */
  type: TaskType;

  /**
   * Hedef miktar (sadece numeric görevler için).
   * Örn: su içme görevi → target: 3
   */
  target?: number;

  /**
   * Birim (sadece numeric görevler için).
   * Örn: "Litre", "Sayfa", "Dakika"
   */
  unit?: string;

  /** Gizli görev mi? (Biyometrik ile kilidi açılır) */
  isPrivate: boolean;

  /** Geçmişe dönük işaretlemeye izin var mı? */
  isFlexible: boolean;

  /** Görevin rengi / ikonu (opsiyonel, UI kişiselleştirme) */
  color?: string;
  icon?: string;

  /** Görev oluşturulma tarihi (ISO string) */
  createdAt: string;

  /** Görev aktif mi? (Silinmeden devre dışı bırakılabilir) */
  isActive: boolean;

  /** Sıralama önceliği */
  sortOrder: number;
}

/**
 * Günlük tamamlama kaydı.
 * MMKV'de `completions` anahtarında saklanır.
 * Anahtar formatı: `${taskId}_${date}` (ör: "abc123_2026-03-24")
 */
export interface Completion {
  /** Hangi göreve ait */
  taskId: string;

  /** Hangi gün (YYYY-MM-DD formatında) */
  date: string;

  /**
   * O anki ilerleme (numeric görevler için).
   * Boolean görevlerde: 0 veya 1.
   */
  progress: number;

  /** Görev tamamlandı mı? (numeric: progress >= target, boolean: true/false) */
  isCompleted: boolean;
}

/**
 * Motivasyon sözü
 */
export interface Quote {
  id: string;
  text: string;
  author?: string;
  isFavorite: boolean;
}

/**
 * Streak (zincir) bilgisi — store'da hesaplanır, persist edilmez
 */
export interface StreakInfo {
  taskId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

/**
 * Günlük özet istatistikleri
 */
export interface DailySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

/**
 * Uygulama ayarları
 */
export interface AppSettings {
  /** Karanlık mod tercihi */
  themeMode: 'light' | 'dark' | 'system';

  /** Gizli görevler kilidi açık mı? (Geçici, oturum bazlı) */
  isPrivateUnlocked: boolean;

  /** Favori motivasyon sözleri gösterilsin mi? */
  showQuotes: boolean;
}

/**
 * Zustand store'un tam tipi
 */
export interface TaskStore {
  // ─── State ─────────────────────────────────
  tasks: Task[];
  completions: Record<string, Completion>; // key: `${taskId}_${date}`
  quotes: Quote[];
  settings: AppSettings;

  // ─── Görev İşlemleri (Task Actions) ────────
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'sortOrder' | 'isActive'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (taskIds: string[]) => void;

  // ─── Tamamlama İşlemleri (Completion Actions) ──
  toggleCompletion: (taskId: string, date: string) => void;
  incrementProgress: (taskId: string, date: string, amount?: number) => void;
  decrementProgress: (taskId: string, date: string, amount?: number) => void;
  setProgress: (taskId: string, date: string, progress: number) => void;

  // ─── Sorgular (Selectors / Getters) ────────
  getTasksForDate: (date: string) => Task[];
  getCompletion: (taskId: string, date: string) => Completion | undefined;
  getStreak: (taskId: string) => StreakInfo;
  getDailySummary: (date: string) => DailySummary;
  getCompletionRateForRange: (startDate: string, endDate: string) => number;

  // ─── Motivasyon Sözleri ────────────────────
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  toggleFavoriteQuote: (id: string) => void;
  removeQuote: (id: string) => void;

  // ─── Ayarlar ───────────────────────────────
  updateSettings: (updates: Partial<AppSettings>) => void;
  unlockPrivate: () => void;
  lockPrivate: () => void;
}

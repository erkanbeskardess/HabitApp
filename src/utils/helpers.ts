import dayjs from 'dayjs';

/**
 * Benzersiz ID üretir (uuid-lite)
 */
export function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndürür
 */
export function getTodayDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Tarih formatlayıcı: "24 Mart 2026, Salı"
 */
export function formatDateLong(date: string): string {
  return dayjs(date).locale('tr').format('DD MMMM YYYY, dddd');
}

/**
 * Completion kaydı için bileşik anahtar oluşturur
 */
export function completionKey(taskId: string, date: string): string {
  return `${taskId}_${date}`;
}

/**
 * İki tarih arasındaki tüm günleri YYYY-MM-DD olarak döndürür
 */
export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = dayjs(start);
  const endDate = dayjs(end);

  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    dates.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return dates;
}

/**
 * Son N günü YYYY-MM-DD formatında döndürür (bugün dahil)
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
}

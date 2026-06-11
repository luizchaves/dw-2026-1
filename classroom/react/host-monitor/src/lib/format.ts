const relativeTime = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
}

export function formatUptime(uptime: number | string | null) {
  if (typeof uptime === 'number') {
    return `${uptime.toFixed(2)}%`;
  }

  if (!uptime) {
    return '0.00%';
  }

  const createdAt = new Date(uptime);
  if (Number.isNaN(createdAt.getTime())) {
    return uptime;
  }

  let duration = Math.floor((createdAt.getTime() - Date.now()) / 1000);
  if (Math.abs(duration) < 60) {
    return 'menos de 1 minuto';
  }

  duration /= 60;
  const divisions: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 30, unit: 'day' },
    { amount: 12, unit: 'month' },
    { amount: Infinity, unit: 'year' },
  ];

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return relativeTime.format(Math.trunc(duration), division.unit);
    }

    duration /= division.amount;
  }

  return uptime;
}

export function availabilityValue(uptime: number | string | null) {
  return typeof uptime === 'number' ? Math.max(0, Math.min(100, uptime)) : 0;
}

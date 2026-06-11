export function formatDate(value?: string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('pt-BR')
}

export function formatPercent(value?: number | null) {
  return `${Number(value ?? 0).toFixed(2)}%`
}

export function statusLabelClass(status: string) {
  if (status === 'Online') {
    return 'status status-online'
  }

  if (status === 'Offline') {
    return 'status status-offline'
  }

  return 'status status-unknown'
}

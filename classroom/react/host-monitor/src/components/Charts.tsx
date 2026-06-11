import { formatDate } from '../lib/format';
import type { PingHistoryEntry } from '../types';

type ChartProps = {
  history: PingHistoryEntry[];
};

export function LatencyChart({ history }: ChartProps) {
  const width = 800;
  const height = 260;
  const padding = 28;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const plotted = history
    .slice()
    .reverse()
    .map((entry) => ({ ...entry, latency: entry.avgMs === null ? 0 : Number(entry.avgMs) }));
  const maxLatency = Math.max(...plotted.map((entry) => entry.latency), 1);
  const slotWidth = plotted.length ? chartWidth / plotted.length : chartWidth;
  const barWidth = Math.max(Math.min(slotWidth * 0.6, 32), 8);

  return (
    <svg className="chart latency-chart" viewBox="0 0 800 260" role="img" aria-label="Grafico de latencia">
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
      {plotted.length === 0 ? (
        <text x={width / 2} y={height / 2} textAnchor="middle">
          Sem dados para exibir
        </text>
      ) : (
        <>
          {plotted.map((entry, index) => {
            const barHeight = (entry.latency / maxLatency) * chartHeight;
            const x = padding + index * slotWidth + (slotWidth - barWidth) / 2;
            const y = height - padding - barHeight;

            return (
              <rect
                fill={entry.reachable ? '#059669' : '#dc2626'}
                height={Math.max(barHeight, 4)}
                key={`${entry.checkedAt}-${index}`}
                rx="3"
                width={barWidth}
                x={x}
                y={y}
              >
                <title>
                  {formatDate(entry.checkedAt)} - {entry.reachable ? 'Online' : 'Offline'} -{' '}
                  {entry.latency.toFixed(3)}ms
                </title>
              </rect>
            );
          })}
          <text x={padding} y={padding - 10}>
            {maxLatency.toFixed(2)} ms
          </text>
          <text x={width - padding} y={height - padding + 20} textAnchor="end">
            Checks recentes
          </text>
        </>
      )}
    </svg>
  );
}

export function TimelineChart({ history }: ChartProps) {
  const plotted = history.slice().reverse();

  return (
    <svg className="chart timeline-chart" viewBox="0 0 800 120" role="img" aria-label="Timeline de checks">
      {plotted.length === 0 ? (
        <text x="400" y="60" textAnchor="middle">
          Sem checks para exibir
        </text>
      ) : (
        <>
          {plotted.map((entry, index) => {
            const x = 20 + index * 13;

            return (
              <rect
                fill={entry.reachable ? '#10b981' : '#f43f5e'}
                height="88"
                key={`${entry.checkedAt}-${index}`}
                rx="2"
                width="10"
                x={x}
                y="16"
              >
                <title>
                  {formatDate(entry.checkedAt)} - {entry.reachable ? 'Online' : 'Offline'}
                  {entry.error ? ` - ${entry.error}` : ''}
                </title>
              </rect>
            );
          })}
          <text x="20" y="114">
            Mais antigo
          </text>
          <text x="780" y="114" textAnchor="end">
            Mais recente
          </text>
        </>
      )}
    </svg>
  );
}

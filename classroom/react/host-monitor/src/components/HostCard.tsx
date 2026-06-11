import { Eye, Trash2 } from 'lucide-react';

import { availabilityValue, formatUptime } from '../lib/format';
import type { Host } from '../types';

type HostCardProps = {
  host: Host;
  navigate: (path: string) => void;
  onDelete: (id: string) => void;
};

function statusClass(status: string) {
  switch (status) {
    case 'Unknown':
      return 'status unknown';
    case 'Online':
      return 'status online';
    case 'Manutenção':
    case 'Manutencao':
      return 'status maintenance';
    case 'Offline':
      return 'status offline';
    default:
      return 'status';
  }
}

function availabilityClass(value: number) {
  if (value >= 95) {
    return 'bar-fill good';
  }

  if (value >= 80) {
    return 'bar-fill warning';
  }

  if (value > 0) {
    return 'bar-fill danger';
  }

  return 'bar-fill neutral';
}

export function HostCard({ host, navigate, onDelete }: HostCardProps) {
  const availability = availabilityValue(host.uptime);

  return (
    <article className="host-card">
      <div className="card-heading">
        <div>
          <h2>{host.name}</h2>
          <p>Categoria: {host.category}</p>
        </div>
        <span className={statusClass(host.status)}>{host.status}</span>
      </div>

      <dl className="host-facts">
        <div>
          <dt>Endereco</dt>
          <dd>{host.address}</dd>
        </div>
        <div>
          <span className="fact-row">
            <dt>Uptime</dt>
            <dd>{formatUptime(host.uptime)}</dd>
          </span>
          <span className="progress-bar">
            <span className={availabilityClass(availability)} style={{ width: `${availability}%` }} />
          </span>
        </div>
      </dl>

      <div className="card-actions">
        <span className="host-id">ID: {host.id.slice(0, 10)}...</span>
        <div>
          <button className="small-primary" type="button" onClick={() => navigate(`/host?id=${host.id}`)}>
            <Eye size={14} />
            Detalhes
          </button>
          <button className="small-danger" type="button" onClick={() => onDelete(host.id)}>
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}

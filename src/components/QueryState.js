import React from 'react';
import { SkeletonStatCard, SkeletonTableRow } from './Skeleton';

export function QueryErrorState({ message = 'Failed to load data.', onRetry }) {
  return (
    <div className="empty-state" style={{ marginTop: 12 }}>
      <div style={{ fontSize: '2rem', marginBottom: 10 }}>📡</div>
      <h3>We could not reach the server</h3>
      <p>{message}</p>
      <button className="btn btn-secondary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export function StatsLoadingGrid({ count = 4 }) {
  return (
    <div className="stats-grid" style={{ marginBottom: 28 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

export function TableLoadingRows({ cols = 8, rows = 6 }) {
  return (
    <table>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  );
}

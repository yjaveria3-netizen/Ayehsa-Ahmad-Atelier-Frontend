// Re-export from new UI components location for backward compatibility
export { 
  default, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTable 
} from './ui/Skeleton';

// Legacy exports
export function SkeletonStatCard() {
  return <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />;
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '16px 20px' }}>
          <div className="skeleton" style={{ height: 13, borderRadius: 4, width: i === 0 ? '70%' : '55%' }} />
        </td>
      ))}
    </tr>
  );
}

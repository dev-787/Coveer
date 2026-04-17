export default function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <span
            className="admin-skeleton"
            style={{ width: `${60 + Math.random() * 40}%`, height: 14, display: 'block' }}
          />
        </td>
      ))}
    </tr>
  );
}

import Link from 'next/link';
import { qs } from '@/lib/helpers';

export default function Pagination({ page, pages, params }) {
  if (pages <= 1) return null;
  const href = (p) => qs({ ...params, page: String(p) });
  const nums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);
  return (
    <div className="pagination">
      <Link className={`pg-btn${page <= 1 ? ' disabled' : ''}`} href={href(Math.max(1, page - 1))}>&laquo;</Link>
      {nums.map((i) => (
        <Link key={i} className={`pg-btn${i === page ? ' active' : ''}`} href={href(i)}>{i}</Link>
      ))}
      <Link className={`pg-btn${page >= pages ? ' disabled' : ''}`} href={href(Math.min(pages, page + 1))}>&raquo;</Link>
    </div>
  );
}

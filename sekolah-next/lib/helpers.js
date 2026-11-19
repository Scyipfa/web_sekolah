export const APP_NAME = 'School Management System';
export const NILAI_LULUS = 60;
export const PER_PAGE = 10;

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function tglId(date) {
  if (!date) return date ?? '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(date));
  if (!m) return String(date);
  return `${Number(m[3])} ${BULAN[Number(m[2]) - 1]} ${m[1]}`;
}

export function fotoUrl(foto) {
  return foto ? `/uploads/${encodeURIComponent(foto)}` : '/avatar.svg';
}

export function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

export function sp(searchParams, key) {
  const v = searchParams?.[key];
  return (Array.isArray(v) ? v[0] : v ?? '').trim();
}

export function qs(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) if (v !== '' && v != null) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function pageInfo(total, pageParam, perPage = PER_PAGE) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), pages);
  return { total, pages, page, offset: (page - 1) * perPage, perPage };
}

export function byteLen(s) {
  return new TextEncoder().encode(s).length;
}

export function errMsg(e) {
  return e?.message || String(e);
}

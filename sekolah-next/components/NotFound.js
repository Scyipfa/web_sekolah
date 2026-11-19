import Link from 'next/link';

export default function NotFoundCard({ message, back }) {
  return (
    <>
      <div className="alert alert-danger">{message}</div>
      <Link href={back} className="btn btn-secondary">Kembali</Link>
    </>
  );
}

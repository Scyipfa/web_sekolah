export default function Errors({ errors }) {
  return (errors || []).map((e, i) => (
    <div key={i} className="alert alert-danger">
      {e}
    </div>
  ));
}

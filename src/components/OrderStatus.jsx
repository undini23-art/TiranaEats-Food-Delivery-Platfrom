const styles = {
  scheduled: "bg-indigo-100 text-indigo-800",
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-sky-100 text-sky-800",
  delivering: "bg-violet-100 text-violet-800",
  delivered: "bg-limewash text-basil",
  cancelled: "bg-red-100 text-red-700"
};

export default function OrderStatus({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

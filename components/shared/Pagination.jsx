export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center items-center gap-2 my-8">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
      >
        ← Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 rounded ${
            p === page
              ? 'bg-primary text-white'
              : 'border border-gray-300 hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
      >
        Siguiente →
      </button>
    </div>
  );
}

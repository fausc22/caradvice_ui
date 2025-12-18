"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (page) =>
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 2 && page <= currentPage + 2)
    );

  return (
    <div className="font-antenna mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-2 px-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 sm:px-4 py-2 text-sm sm:text-base border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        Anterior
      </button>

      {pages.map((page, index, array) => (
        <div key={page} className="flex items-center gap-1 sm:gap-2">
          {index > 0 && array[index - 1] !== page - 1 && (
            <span className="px-1 sm:px-2 text-sm sm:text-base">...</span>
          )}
          <button
            onClick={() => onPageChange(page)}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base border rounded transition-colors min-w-[40px] sm:min-w-[44px] ${
              currentPage === page
                ? "bg-orange-500 text-white border-orange-500"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        </div>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 sm:px-4 py-2 text-sm sm:text-base border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        Siguiente
      </button>
    </div>
  );
}

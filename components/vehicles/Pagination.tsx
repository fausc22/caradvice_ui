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
    <div className="font-antenna mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-3 px-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 sm:px-5 py-2.5 sm:py-3 text-base border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] touch-manipulation"
        aria-label="Página anterior"
      >
        Anterior
      </button>

      {pages.map((page, index, array) => (
        <div key={page} className="flex items-center gap-1 sm:gap-2">
          {index > 0 && array[index - 1] !== page - 1 && (
            <span className="px-2 text-base">...</span>
          )}
          <button
            onClick={() => onPageChange(page)}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 text-base border rounded-lg transition-colors min-w-[44px] min-h-[44px] touch-manipulation ${
              currentPage === page
                ? "bg-orange-500 text-white border-orange-500"
                : "hover:bg-gray-100 active:bg-gray-200"
            }`}
            aria-label={`Ir a página ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        </div>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 sm:px-5 py-2.5 sm:py-3 text-base border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] touch-manipulation"
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </div>
  );
}

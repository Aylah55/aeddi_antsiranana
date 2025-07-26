import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "",
  showInfo = false,
  totalItems = 0,
  itemsPerPage = 10
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center mt-4 ${className}`}>
      {showInfo && totalItems > 0 && (
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          Affichage de {startItem} à {endItem} sur {totalItems} résultats
        </div>
      )}
      
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Précédent
        </button>
        
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          const isCurrentPage = currentPage === pageNumber;
          
          // Afficher seulement quelques pages autour de la page courante
          if (totalPages <= 7 || 
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  isCurrentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            );
          } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
            return (
              <span
                key={pageNumber}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            );
          }
          return null;
        })}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Suivant
        </button>
      </nav>
    </div>
  );
};

export default Pagination; 
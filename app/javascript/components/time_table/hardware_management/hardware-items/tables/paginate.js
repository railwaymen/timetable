import React from 'react';

export default function Paginate({ onChange, totalPages, currentPage }) {
  const list = new Array(totalPages).fill(null);

  const onNextPage = (value) => {
    if (value >= totalPages) return false;

    return onChange(value + 1);
  };

  const onPreviousPage = (value) => {
    if (value <= 1) return false;

    return onChange(value - 1);
  };

  return (
    <div className="pagination">
      <div className="page" onClick={() => onPreviousPage(currentPage)}>
        <i className="fa fa-chevron-left" />
      </div>
      {list.map((_e, i) => {
        const pageValue = i + 1;

        return (
          <div
            key={`page-${pageValue}`}
            onClick={() => onChange(pageValue)}
            className={`page ${pageValue === currentPage ? 'current' : ''}`}
          >
            {pageValue}
          </div>
        );
      })}
      <div className="page" onClick={() => onNextPage(currentPage)}>
        <i className="fa fa-chevron-right" />
      </div>
    </div>
  );
}

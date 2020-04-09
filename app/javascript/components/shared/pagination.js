import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

function Pagination(props) {
  const {
    page, setPage, totalCount, perPage = 25,
  } = props;
  const pages = Math.ceil(totalCount / perPage);
  const isBackAvailable = (page !== 1);
  const isForwardAvailable = (pages > 1 && page !== pages);

  return (
    <ul className="pagination pull-right">
      {isBackAvailable && (
        <li id="prevPage">
          <a className="symbol fa fa-chevron-left" onClick={() => setPage(page - 1)} type="button" />
        </li>
      )}

      {_.times(pages, (i) => {
        const index = i + 1;

        return (
          <li key={index} className={`page ${parseInt(page, 10) === index ? 'active' : ''}`}>
            <a onClick={() => setPage(index)} className="page" type="button">{index}</a>
          </li>
        );
      })}

      {isForwardAvailable && (
        <li className={!isForwardAvailable ? 'disabled' : ''} id="nextPage">
          <a className="symbol fa fa-chevron-right" onClick={() => setPage(page + 1)} type="button" />
        </li>
      )}
    </ul>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  perPage: PropTypes.number,
};

export default Pagination;

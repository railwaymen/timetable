import React, { useEffect, useState } from 'react';
import { makeGetRequest } from '../../../../shared/api';
import TableHeader from './table-header';
import Paginate from './paginate';
import TableRow from './table-row';

export default function ArchivedContent({ phrase, visible, onSelectItem }) {
  const [content, setContent] = useState({
    list: [], isLoaded: false, currentPage: 1, totalPages: 1,
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const { query, unassigned } = phrase;

    makeGetRequest({
      url: `/api/hardware_devices/archived?page=1&q=${query}&${unassigned ? 'unassigned_only=true' : ''}`,
    }).then(({ data: { records, total_pages } }) => {
      setContent({
        list: records, isLoaded: true, page: 1, totalPages: total_pages,
      });
      setPage(1);
    });
  }, [phrase]);

  useEffect(() => {
    const { query, unassigned } = phrase;

    makeGetRequest({
      url: `/api/hardware_devices/archived?page=${page}&q=${query}&${unassigned ? 'unassigned_only=true' : ''}`,
    }).then(({ data: { records, total_pages } }) => {
      setContent({
        list: records, isLoaded: true, page, totalPages: total_pages,
      });
    });
  }, [page]);

  const { list, totalPages } = content;

  return (
    <div className="content" style={!visible ? { display: 'none' } : {}}>
      <table className="table">
        <TableHeader />
        <tbody>
          {list.map((item) => (
            <TableRow item={item} key={item.id} onRemove={onSelectItem} />
          ))}
        </tbody>
      </table>
      <Paginate totalPages={totalPages} currentPage={page} onChange={setPage} />
    </div>
  );
}

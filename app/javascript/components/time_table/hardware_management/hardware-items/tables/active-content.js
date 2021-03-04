import React, { useEffect, useState } from 'react';
import { makeGetRequest } from '../../../../shared/api';
import Paginate from './paginate';
import TableRow from './table-row';

export default function ActiveContent({ phrase, visible, onSelectItem }) {
  const [content, setContent] = useState({
    list: [], isLoaded: false, currentPage: 1, totalPages: 1,
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    makeGetRequest({
      url: `/api/hardware_devices?page=${1}&q=${phrase}`,
    }).then(({ data: { data, total_pages } }) => {
      setContent({
        list: data, isLoaded: true, page: 1, totalPages: total_pages,
      });
      setPage(1);
    });
  }, [phrase]);

  useEffect(() => {
    makeGetRequest({
      url: `/api/hardware_devices?page=${page}&q=${phrase}`,
    }).then(({ data: { data, total_pages } }) => {
      setContent({
        list: data, isLoaded: true, page, totalPages: total_pages,
      });
    });
  }, [page]);

  const { list, totalPages } = content;

  return (
    <div className="content" style={!visible ? { display: 'none' } : {}}>
      <table className="table">
        <thead>
          <tr>
            <th>{I18n.t('apps.hardware_devices.category')}</th>
            <th>{I18n.t('apps.hardware_devices.brand')}</th>
            <th>{I18n.t('apps.hardware_devices.model')}</th>
            <th>{I18n.t('apps.hardware_devices.serial_number')}</th>
            <th>{I18n.t('apps.hardware_devices.assigned_person')}</th>
            <th>{I18n.t('apps.hardware_devices.state')}</th>
            <th>{I18n.t('apps.hardware_devices.year_of_production')}</th>
            <th>{I18n.t('common.action')}</th>
          </tr>
        </thead>
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

import React, { useState, useEffect } from 'react';
import Pagination from '@components/shared/pagination';
import { locationParams, replaceLocationParams } from '@components/shared/helpers';
import UserSlider from '@components/shared/user_slider';
import { Helmet } from 'react-helmet';
import Entry from './entry';
import { makeGetRequest } from '../../shared/api';

function RemoteWork() {
  const params = locationParams();
  const currentPage = parseInt(params.page, 10);
  const userId = (params.user_id || currentUser.id);

  const [remoteWorks, setRemoteWorks] = useState({ total_count: 0, remote_works: [] });
  const [user, setUser] = useState({ id: userId });
  const [page, setPage] = useState(currentPage || 1);

  function getRemoteWorks() {
    makeGetRequest({ url: `/api/remote_works?page=${page}&user_id=${user.id}` })
      .then((response) => {
        setRemoteWorks(response.data);
      });
  }

  function getUser() {
    makeGetRequest({ url: `/api/users/${user.id}` })
      .then((userResponse) => {
        setUser(userResponse.data);
      });
  }

  useEffect(() => {
    getRemoteWorks();
    replaceLocationParams({ page, user_id: user.id });
  }, [page, user.id]);

  useEffect(() => {
    setPage(1);
    getUser();
  }, [user.id]);

  return (
    <div>
      <Helmet>
        <title>{I18n.t('common.remote_work')}</title>
      </Helmet>

      {currentUser.admin && (
        <UserSlider user={user} setUserId={(id) => setUser({ id })} />
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>{I18n.t('common.from')}</th>
            <th>{I18n.t('common.to')}</th>
            <th>{I18n.t('common.duration')}</th>
            <th className="text-left">{I18n.t('apps.accounting_periods.note')}</th>
            {currentUser.admin ? <th /> : null}
          </tr>
        </thead>
        <tbody>
          {remoteWorks.remote_works.map((work) => (
            <Entry key={work.id} work={work} />
          ))}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} totalCount={remoteWorks.total_count} />
    </div>
  );
}

export default RemoteWork;

import React, { useState, useEffect } from 'react';
import Pagination from '@components/shared/pagination';
import { locationParams, replaceLocationParams } from '@components/shared/helpers';
import UserSlider from '@components/shared/user_slider';
import { Helmet } from 'react-helmet';
import useOutsideClick from '@hooks/use_outside_click';
import NewEntryForm from './new_entry_form';
import Entry from './entry';
import EditEntry from './edit_entry';
import { makeGetRequest, makeDeleteRequest, makePutRequest } from '../../shared/api';

function RemoteWork() {
  const params = locationParams();
  const currentPage = parseInt(params.page, 10) || 1;
  const userId = parseInt(params.user_id, 10) || currentUser.id;

  const [remoteWorks, setRemoteWorks] = useState({ total_count: 0, remote_works: [] });
  const [user, setUser] = useState({ id: userId });
  const [page, setPage] = useState(currentPage);
  const [editedWorkTimeId, setEditedWorkTimeId] = useState();

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

  function updateRemoteWork(newRemoteWork) {
    makePutRequest({
      url: `/api/remote_works/${newRemoteWork.id}`,
      body: { remote_work: newRemoteWork },
    }).then(() => {
      getRemoteWorks();
    });
  }

  function handleNewEntry(entryUserid) {
    // TODO: find a better way for that
    if (entryUserid !== user.id) {
      setUser({ id: entryUserid });
    } else if (page !== 1) {
      setPage(1);
    } else {
      getRemoteWorks();
    }
  }

  function onDelete(id) {
    makeDeleteRequest({ url: `/api/remote_works/${id}`})
      .then(() => {
        getRemoteWorks();
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

  useOutsideClick('.switch-edition', () => setEditedWorkTimeId(''));

  return (
    <div>
      <Helmet>
        <title>{I18n.t('common.remote_work')}</title>
      </Helmet>

      <NewEntryForm handleNewEntry={handleNewEntry} userId={userId} />

      {currentUser.admin && (
        <UserSlider user={user} setUserId={(id) => setUser({ id })} />
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th className="text-left">{I18n.t('apps.accounting_periods.note')}</th>
            <th>{I18n.t('common.date')}</th>
            <th>{I18n.t('common.duration')}</th>
            <th>{I18n.t('common.from')}</th>
            <th>{I18n.t('common.to')}</th>
            {currentUser.admin ? <th /> : null}
          </tr>
        </thead>
        <tbody>
          {remoteWorks.remote_works.map((work) => (
            <React.Fragment key={work.id}>
              {work.id === editedWorkTimeId ? (
                <EditEntry
                  work={work}
                  onDelete={onDelete}
                  updateRemoteWork={updateRemoteWork}
                />
              ) : (
                <Entry
                  work={work}
                  onDelete={onDelete}
                  setEditedWorkTimeId={setEditedWorkTimeId}
                />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} totalCount={remoteWorks.total_count} />
    </div>
  );
}

export default RemoteWork;

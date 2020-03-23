import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { displayDuration } from '@components/shared/helpers';

function Entry(props) {
  const { work } = props;

  function formatDate(date) {
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  return (
    <tr>
      <td>{work.starts_at ? formatDate(work.starts_at) : ''}</td>
      <td>{work.ends_at ? formatDate(work.ends_at) : ''}</td>
      <td>{displayDuration(work.duration)}</td>
      <td>{work.note}</td>
      <td>
        {currentUser.admin && (
          <span>Actions</span>
        )}
      </td>
    </tr>
  );
}

Entry.propTypes = {
  work: PropTypes.shape({
    starts_at: PropTypes.string,
    ends_at: PropTypes.string,
    duration: PropTypes.number,
    note: PropTypes.string,
  }),
};

export default Entry;

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { displayDuration } from '@components/shared/helpers';
// import ErrorTooltip from '@components/shared/error_tooltip';

function Entry(props) {
  const { work, onDelete, setEditedWorkTimeId } = props;

  function formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  function hourFormat(date) {
    return moment(date).format('HH:mm');
  }

  function setAsActive() {
    setEditedWorkTimeId(work.id);
  }

  return (
    <tr>
      <td role="gridcell" className="switch-edition" onClick={setAsActive}>
        {/* TODO: style needed */}
        {/* {Object.values(work.errors || []).map((error) => (<ErrorTooltip key={error} errors={error} />))} */}
        {Object.values(work.errors || []).map((error) => (<div key={error} className="text-danger">{error}</div>))}
        {work.note}
      </td>
      <td role="gridcell" className="switch-edition" onClick={setAsActive}>{work.starts_at ? formatDate(work.starts_at) : ''}</td>
      <td>{displayDuration(work.duration)}</td>
      <td role="gridcell" className="switch-edition" onClick={setAsActive}>{work.starts_at ? hourFormat(work.starts_at) : ''}</td>
      <td role="gridcell" className="switch-edition" onClick={setAsActive}>{work.ends_at ? hourFormat(work.ends_at) : ''}</td>
      <td>
        <div className="actions-container">
          <span
            className="action-item destroy"
            onClick={() => onDelete(work.id)}
            data-tooltip-bottom={I18n.t('common.remove')}
          >
            <i className="symbol fa fa-trash-o" />
          </span>
        </div>
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
  onDelete: PropTypes.func,
  setEditedWorkTimeId: PropTypes.func,
};

export default Entry;

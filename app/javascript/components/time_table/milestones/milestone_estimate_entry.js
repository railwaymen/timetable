import React from 'react';
import moment from 'moment';
import { formattedDuration } from '../../shared/helpers';

function MilestoneEstimateEntry(props) {
  const { estimate } = props;

  function formatEstimateChange(estimate, diff) {
    return (
      <span>
        {formattedDuration(estimate)}
        {diff > 0 && (
          <span className="positive">
            +
            {formattedDuration(diff)}
          </span>
        )}
        {diff < 0 && (
          <span className="negative">
            -
            {formattedDuration(diff)}
          </span>
        )}
      </span>
    );
  }

  return (
    <tr>
      <td>{moment(estimate.created_at).formatTime()}</td>
      <td>{formatEstimateChange(estimate.dev_estimate, estimate.dev_estimate_diff)}</td>
      <td>{formatEstimateChange(estimate.qa_estimate, estimate.qa_estimate_diff)}</td>
      <td>{formatEstimateChange(estimate.ux_estimate, estimate.ux_estimate_diff)}</td>
      <td>{formatEstimateChange(estimate.pm_estimate, estimate.pm_estimate_diff)}</td>
      <td>{formatEstimateChange(estimate.other_estimate, estimate.other_estimate_diff)}</td>
      <td>{formatEstimateChange(estimate.external_estimate, estimate.external_estimate_diff)}</td>
      <td>{estimate.note}</td>
    </tr>
  );
}

export default MilestoneEstimateEntry;

import React from 'react';
import Modal from '@components/shared/modal';

function SummaryPopup(props) {
  const { closePopup, reports } = props;

  console.log(reports);

  return (
    <Modal
      id="work-time-modal"
      header="Details"
      content={(
        <div>
          <h1>Dupa</h1>
        </div>
        )}
      actions={(
        <div>
          <button className="bt bt-second" type="button" onClick={closePopup}>close me</button>
        </div>
      )}
    />
  );
}

export default SummaryPopup;

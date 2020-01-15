import React from 'react';
import Entry from './entry';
import EntryHistory from './entry_history';

class Vacations extends React.Component {
  constructor(props) {
    super(props);

    this.updateVacationList = this.updateVacationList.bind(this);
  }

  updateVacationList(object) {
    this.entryHistory.updateVacationList(object);
  }

  render() {
    return (
      <div className="container vacation-entry">
        <div className="row">
          <div className="vacations-container">
            <Entry ref={(entry) => { this.entry = entry; }} updateVacationList={this.updateVacationList} />
            <EntryHistory ref={(entryHistory) => { this.entryHistory = entryHistory; }} />
          </div>
        </div>
      </div>
    );
  }
}

export default Vacations;

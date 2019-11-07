import React from 'react';
import Filters from './filters';
import VacationApplications from './vacation_applications';

class Staff extends React.Component {
  constructor(props) {
    super(props);

    this.onFilterChange = this.onFilterChange.bind(this);
    this.urlFilters = this.urlFilters.bind(this);
  }

  onFilterChange(params) {
    this.vacationApplications.getVacationApplications(params);
  }

  urlFilters(params) {
    this.filters.setFilters(params);
  }

  render() {
    return (
      <div className="staff-container">
        <Filters ref={(filters) => { this.filters = filters; }} onFilterChange={this.onFilterChange} />
        { currentUser.canManageStaff()
            && <VacationApplications ref={(vacationApplications) => { this.vacationApplications = vacationApplications; }} urlFilters={this.urlFilters} />
          }
      </div>
    );
  }
}

export default Staff;

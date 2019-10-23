import React from 'react'
import Filters from './filters'
import VacationApplications from './vacation_applications'

class Staff extends React.Component {
  constructor(props) {
    super(props);
    
    this.onFilterChange = this.onFilterChange.bind(this);
    this.showErrors = this.showErrors.bind(this);
  }

  state = {
    errors: []
  }

  onFilterChange(params) {
    this.vacationApplications.getVacationApplications(params);
  }

  showErrors(errors) {
    this.setState({
      errors: errors
    })
  }

  renderErrors() {
    const { errors } = this.state;
    let errorList = []
    errors.forEach((error) => {
      Object.keys(error).forEach((err) => {
        errorList.push(<div className={err} key={err}>{error[err]}</div>)
      })
    })
    console.log(errorList)
    return(
      <div className='row staff-errors' style={{ textAlign: 'center' }}>
        {errorList}
      </div>
    )
  }

  render() {
    const { errors } = this.state;
    return(
      <div>
        { errors.length > 0
            && this.renderErrors()
        }
        <Filters ref={(filters) => { this.filters = filters; }} onFilterChange={this.onFilterChange} />
        { currentUser.canManageStaff()
            && <VacationApplications ref={(vacationApplications) => { this.vacationApplications = vacationApplications; }} showErrors={this.showErrors} />
          }
      </div>
    )
  }
}

export default Staff
import React from 'react';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api';
import moment, { isMoment } from 'moment';

class EntryHistory extends React.Component {
  constructor(props) {
    super(props);

    this.renderVacations = this.renderVacations.bind(this);
    this.getVacations = this.getVacations.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.renderUsedVacationDays = this.renderUsedVacationDays.bind(this);
  }

  static propTypes = {
    vacations: PropTypes.array,
    years: PropTypes.array,
    selectedYear: PropTypes.number,
    availableVacationDays: PropTypes.number    
  }

  state = {
    vacations: [],
    years: [parseInt(moment().year())],
    selectedYear: undefined,
    availableVacationDays: 0,
    usedVacationDays: {}
  }

  componentDidMount() {
    let years = this.state.years;
    const currentYear = years[0];
    const iterator = moment().format('YYYY') - moment('2017', 'YYYY').year();
    for (let i = 0; i < iterator; i++) {
      years.push(currentYear - (i + 1));
    }
    this.setState({
      years: years.sort(),
      selectedYear: currentYear
    })
    this.getVacations(currentYear);
  }

  onSelectChange(e) {
    this.setState({
      selectedYear: e.target.value
    }, () => {
      this.getVacations(this.state.selectedYear);
    })
  }

  renderVacations(vacation, key) {
    return(
      <div className="row vacation" key={key}>
        <div className="col-sm-12 col-md-4 vacation-type">
          {I18n.t(`common.${vacation.vacation_type}`)}
        </div>
        <div className="col-sm-12 col-md-4 vacation-date-range">
          {moment(vacation.start_date).format('DD.MM.YYYY')}
          <span>-</span>
          {moment(vacation.end_date).format('DD.MM.YYYY')}
        </div>
        <div className="col-sm-12 col-md-4 vacation-status">
          {vacation.status === 'approved' ? I18n.t('apps.vacations.status.unconfirmed') : I18n.t('apps.vacations.status.' + vacation.status)}
        </div>
      </div>
    )
  }

  renderYearFilter(years) {
    const { selectedYear } = this.state;
    let options = [];
    for (let i = 0; i < years.length; i++) {
      options.push(<option key={i} value={years[i]}>{years[i]}</option>)
    }
    return(
      <select className="custom-select year-select" value={selectedYear} onChange={this.onSelectChange}>
        {options}
      </select>
    )
  }

  updateVacationList(object) {
    let vacations = this.state.vacations;
    vacations.push(object);
    this.setState({
      vacations: vacations
    });
  }

  getVacations(year) {
    Api.makeGetRequest({ url: `/api/vacations?year=${year}` })
      .then((response) => {
        this.setState({
          vacations: response.data.vacations,
          availableVacationDays: response.data.available_vacation_days,
          usedVacationDays: response.data.used_vacation_days
        })
      });
  }

  renderUsedVacationDays() {
    const { usedVacationDays } = this.state;
    let usedVacationDaysList = []
    Object.keys(usedVacationDays).forEach((type) => {
      usedVacationDaysList.push(
                                    <div className={type} key={type}>
                                      {I18n.t('apps.vacations.used_vacation_days', 
                                        { type: I18n.t(`common.${type}`).toLowerCase(), count: usedVacationDays[type] } )}
                                    </div>
                                  )
    })
    return(
      <div>
        {usedVacationDaysList}
      </div>
    )
  }

  render() {
    const { years, vacations, availableVacationDays } = this.state;
    
    return(
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-3 available-vacation-days">
            {I18n.t('apps.vacations.remaining_vacation', { count: availableVacationDays })}
            {this.renderUsedVacationDays()}
          </div>
          <div className="col-sm-12 col-md-3 year-filter">
            {this.renderYearFilter(years)}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6 vacations">
             {vacations.map((vacation, key) => this.renderVacations(vacation, key))}
          </div>
        </div>
      </div>
    )
  }
}

export default EntryHistory
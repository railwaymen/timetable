import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import * as Api from '../../shared/api';

class EntryHistory extends React.Component {
  constructor(props) {
    super(props);

    this.renderVacations = this.renderVacations.bind(this);
    this.getVacations = this.getVacations.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.renderUsedVacationDays = this.renderUsedVacationDays.bind(this);
    this.onCollappsibleClick = this.onCollappsibleClick.bind(this);
  }

  static propTypes = {
    vacations: PropTypes.array,
    years: PropTypes.array,
    selectedYear: PropTypes.number,
    availableVacationDays: PropTypes.number,
  }

  state = {
    vacations: [],
    years: [parseInt(moment().year(), 10)],
    selectedYear: undefined,
    availableVacationDays: 0,
    usedVacationDays: {},
    usedVacationsExpanded: false,
  }

  componentDidMount() {
    const { years } = this.state;
    const currentYear = years[0];
    const iterator = moment().format('YYYY') - moment('2017', 'YYYY').year();
    for (let i = 0; i < iterator; i += 1) {
      years.push(currentYear - (i + 1));
    }
    this.setState({
      years: years.sort(),
      selectedYear: currentYear,
    });
    this.getVacations(currentYear);
  }

  onSelectChange(e) {
    this.setState({
      selectedYear: e.target.value,
    }, () => {
      this.getVacations(this.state.selectedYear);
    });
  }

  onTrashClick(vacationId) {
    if (window.confirm(I18n.t('common.confirm'))) {
      Api.makePutRequest({
        url: `/api/vacations/${vacationId}/self_decline`,
      }).then(() => {
        this.getVacations(this.state.selectedYear);
      });
    }
  }

  renderVacations(vacation, key) {
    const status = vacation.status === 'approved' ? I18n.t('apps.vacations.status.unconfirmed') : I18n.t(`apps.vacations.status.${vacation.status}`);
    const statusClass = vacation.status === 'approved' ? 'unconfirmed' : vacation.status;
    return (
      <tr className="row vacation" key={key}>
        <td>{I18n.t(`common.${vacation.vacation_type}`)}</td>
        <td>
          {moment(vacation.start_date).format('DD.MM.YYYY')}
          <span>-</span>
          {moment(vacation.end_date).format('DD.MM.YYYY')}
        </td>
        <td className={statusClass}>{status}</td>
        <td className="trash">
          {vacation.status === 'unconfirmed' ? (
            <i className="symbol fa fa-trash" onClick={() => this.onTrashClick(vacation.id)} />
          ) : '' }
        </td>
      </tr>
    );
  }

  renderYearFilter(years) {
    const { selectedYear } = this.state;
    const options = [];
    for (let i = 0; i < years.length; i += 1) {
      options.push(<option key={i} value={years[i]}>{years[i]}</option>);
    }
    return (
      <select className="form-control" value={selectedYear} onChange={this.onSelectChange}>
        {options}
      </select>
    );
  }

  getVacations(year) {
    if (!year) { year = this.state.selectedYear; }
    Api.makeGetRequest({ url: `/api/vacations?year=${year}` })
      .then((response) => {
        this.setState({
          vacations: response.data.vacations,
          availableVacationDays: response.data.available_vacation_days,
          usedVacationDays: response.data.used_vacation_days,
        });
      });
  }

  renderUsedVacationDays() {
    const { usedVacationDays, usedVacationsExpanded } = this.state;
    const usedVacationDaysList = [];
    Object.keys(usedVacationDays).forEach((type) => {
      usedVacationDaysList.push(
        <div className={type} key={type}>
          {I18n.t('apps.vacations.used_vacation_days', { type: I18n.t(`common.${type}`).toLowerCase() })}
          <span>{I18n.t('apps.vacations.days', { count: usedVacationDays[type] })}</span>
        </div>,
      );
    });
    const chevron = usedVacationsExpanded ? 'up' : 'down';
    const translation = usedVacationsExpanded ? 'fold_used_days' : 'expand_used_days';
    return (
      <div className="used-vacations">
        <a href="#used-vacations-collapse" data-toggle="collapse" role="button" aria-expanded={usedVacationsExpanded} aria-controls="used-vacations-collapse" onClick={this.onCollappsibleClick}>
          <i className={`glyphicon glyphicon-chevron-${chevron}`} />
          {I18n.t(`apps.vacations.${translation}`)}
        </a>
        <div className="collapse" id="used-vacations-collapse">
          {usedVacationDaysList}
        </div>
      </div>
    );
  }

  onCollappsibleClick() {
    $('.used-vacations')[0].style.pointerEvents = 'none';
    setTimeout(() => {
      this.setState({
        usedVacationsExpanded: !this.state.usedVacationsExpanded,
      }, () => { $('.used-vacations')[0].style.pointerEvents = ''; });
    }, 300);
  }

  render() {
    const { years, vacations, availableVacationDays } = this.state;

    return (
      <div>
        <div className="row">
          <div className="available-vacation-days">
            {I18n.t('apps.vacations.remaining_vacation')}
            <span>{I18n.t('apps.vacations.days', { count: availableVacationDays })}</span>
            {this.renderUsedVacationDays()}
          </div>
          <div className="year-filter">
            {this.renderYearFilter(years)}
          </div>
        </div>
        <div className="row">
          <div className="vacations">
            <table>
              <tbody>
                {vacations.map((vacation, key) => this.renderVacations(vacation, key))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default EntryHistory;

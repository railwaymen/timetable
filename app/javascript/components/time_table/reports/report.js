import React from 'react';
import URI from 'urijs';
import { monthFromRange } from '../../shared/helpers';

class Report extends React.Component {
  constructor (props) {
    super(props);

    this.getReports = this.getReports.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.prevMonth = this.prevMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
    this.onFromDateChange = this.onFromDateChange.bind(this);
    this.onToDateChange = this.onToDateChange.bind(this);
    this.onOrderChange = this.onOrderChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
  }

  componentDidMount () {
    let original = URI(window.location.href);
    let queries = original.search(true);

    if (queries['from'] && queries['to']) {
      this.getReports({ from: queries['from'], to: queries['to'] });
    } else {
      this.getReports({ from: this.state.from, to: this.state.to });
    }
  }

  onFilter () {
    this.getReports({
      from: this.state.from,
      to: this.state.to
    })
  }

  onOrderChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    }, () => {
      this.getReports({ filter: this.state.filter })
    })
  }

  onFilterChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    }, () => {
      this.getReports({ list: this.state.list })
    })
  }

  onFromDateChange (date) {
    this.setState({
      from: moment(date).format()
    })
  }

  onToDateChange (date) {
    this.setState({
      to: moment(date).format()
    })
  }

  prevMonth () {
    let from = moment(this.state.from).subtract(1, 'month').format();
    let to = moment(from).endOf('month').format();

    this.getReports({ from, to });
  }

  nextMonth () {
    let from = moment(this.state.from).add(1, 'month').format();
    let to = moment(from).endOf('month').format();

    this.getReports({ from, to });
  }

  redirectTo (location) {
    let url = URI(location);
    this.setState({ redirectToReferer: `${url.path()}?${url.query()}` })
  }

  detectMonth (from, to) {
    if (moment(from).month() === moment(to).month()) {
      return moment(from).format('MMMM YYYY');
    } else {
      return I18n.t('common.custom');
    }
  }
}

export default Report;

import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import URI from 'urijs';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';

const simpleDateFormat = (date) => moment(date).format('YYYY/MM/DD');
export default class ProjectReports extends React.Component {
  constructor(props) {
    super(props);

    this.onDelete = this.onDelete.bind(this);

    this.state = {
      projectId: parseInt(this.props.match.params.projectId, 10),
      reports: [],
      from: '',
      to: '',
    };
  }

  componentDidMount() {
    this.getReports();
    const base = URI(window.location.href);
    const { from, to } = base.query(true);
    this.setState({ from, to });
  }

  newReportLink() {
    const { from, to, projectId } = this.state;
    return `/projects/${projectId}/new_report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  }

  onDelete(e) {
    e.preventDefault();

    if (window.confirm(I18n.t('common.confirm'))) {
      Api.makeDeleteRequest({ url: e.currentTarget.href }).then((data) => {
        if (parseInt(data.status, 10) === 204) {
          this.getReports();
        }
      });
    }
  }

  getReports() {
    Api.makeGetRequest({ url: `/api/projects/${this.state.projectId}/project_reports` })
      .then(({ data }) => {
        this.setState({ reports: data });
      });
  }

  renderReportState(state) {
    const iconClass = ({
      done: 'fa-check',
      editing: 'fa-pencil',
    })[state] || 'fa-info-circle';
    return (
      <span className="report-status">
        <i className={`symbol fa ${iconClass}`} />
        {state}
      </span>
    );
  }

  render() {
    const { projectId, reports } = this.state;
    return (
      <div className="list-of-reports">
        <p className="text-right">
          <Link to={this.newReportLink()} className="bt bt-main">
            <i className="symbol fa fa-plus" />
            <span className="bt-txt">{I18n.t('apps.reports.new')}</span>
          </Link>
        </p>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{I18n.t('common.name')}</th>
                <th className="text-center">{I18n.t('common.state')}</th>
                <th className="text-center">{I18n.t('common.range')}</th>
                <th className="text-center">{I18n.t('common.duration')}</th>
                <th className="text-center">{I18n.t('common.cost')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reports.map(({
                id,
                name,
                state,
                starts_at,
                ends_at,
                generated,
                duration,
                cost,
                currency,
              }) => (
                <tr key={id}>
                  <td>
                    {name}
                  </td>
                  <td className="text-center">
                    {this.renderReportState(state)}
                  </td>
                  <td className="text-center">
                    {`${simpleDateFormat(starts_at)}-${simpleDateFormat(ends_at)}`}
                  </td>
                  <td className="text-center">
                    {displayDuration(duration)}
                  </td>
                  <td className="text-center">
                    {currency}
                    {' '}
                    {cost.toFixed(2)}
                  </td>
                  <td className="report-actions text-right">
                    {generated
                      && (
                      <a className="bt bt-second bt-download" href={`/api/projects/${projectId}/project_reports/${id}/file`}>
                        <i className="symbol fa fa-file-pdf-o" />
                        <span className="txt">{I18n.t('common.download')}</span>
                      </a>
                      )}
                    <Link className="bt bt-second" to={`/projects/${projectId}/edit_report/${id}`}>
                      <i className="symbol fa fa-search" />
                      <span className="bt-txt">{I18n.t('common.show')}</span>
                    </Link>
                    <a className="bt bt-danger" onClick={this.onDelete} href={`/api/projects/${projectId}/project_reports/${id}`}>
                      <i className="symbol fa fa-trash-o" />
                      <span className="bt-txt">{I18n.t('apps.reports.remove')}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

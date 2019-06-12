import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import URI from 'urijs';
import * as Api from '../../shared/api';

const simpleDateFormat = date => moment(date).format('YYYY/MM/DD');
export default class ProjectReports extends React.Component {
  constructor(props) {
    super(props);

    this.onDelete = this.onDelete.bind(this);
  }

  state = {
    projectId: parseInt(this.props.match.params.projectId, 10),
    reports: [],
    from: '',
    to: '',
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

    if (window.confirm('Are you sure?')) {
      Api.makeDeleteRequest({ url: e.target.href }).then((data) => {
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

  render() {
    const { projectId, reports } = this.state;
    return (
      <div>
        <Link to={this.newReportLink()} className="btn btn-success">
          {I18n.t('apps.reports.new')}
        </Link>
        <table className="table">
          <thead>
            <tr>
              <th>{I18n.t('common.name')}</th>
              <th>{I18n.t('common.state')}</th>
              <th>{I18n.t('common.show')}</th>
              <th>{I18n.t('common.download')}</th>
              <th>{I18n.t('common.range')}</th>
              <th>{I18n.t('common.remove')}</th>
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
            }) => (
              <tr key={id}>
                <td>
                  {name}
                </td>
                <td>
                  {state}
                </td>
                <td>
                  <Link to={`/projects/${projectId}/edit_report/${id}`}>
                  Link
                  </Link>
                </td>
                <td>
                  {generated
                    && (
                    <a href={`/api/projects/${projectId}/project_reports/${id}/file`}>
                      {I18n.t('common.download')}
                    </a>
                    )
                  }
                </td>
                <td>
                  {`${simpleDateFormat(starts_at)}-${simpleDateFormat(ends_at)}`}
                </td>
                <td>
                  <a onClick={this.onDelete} href={`/api/projects/${projectId}/project_reports/${id}`}>
                    {I18n.t('apps.reports.remove')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

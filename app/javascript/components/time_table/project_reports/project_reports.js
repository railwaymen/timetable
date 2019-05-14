import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import * as Api from '../../shared/api';

const simpleDateFormat = date => moment(date).format('YYYY/MM/DD');
export default class ProjectReports extends React.Component {
  state = {
    projectId: parseInt(this.props.match.params.projectId, 10),
    reports: [],
  }

  componentDidMount() {
    this.getReports();
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
        <Link to={`/projects/${projectId}/new_report`} className="btn btn-success">
          New report
        </Link>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>State</th>
              <th>Show</th>
              <th>Download</th>
              <th>Range</th>
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
                      Download
                    </a>
                    )
                  }
                </td>
                <td>
                  {`${simpleDateFormat(starts_at)}-${simpleDateFormat(ends_at)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

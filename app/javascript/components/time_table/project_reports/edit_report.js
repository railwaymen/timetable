import React from 'react';
import {
  bindAll, get, sumBy, uniq, partition, without, isEmpty, cloneDeep,
} from 'lodash';
import uuidv4 from 'uuid/v4';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';

export default class EditReport extends React.Component {
  state = {
    reportId: parseInt(this.props.match.params.reportId, 10),
    projectId: parseInt(this.props.match.params.projectId, 10),
    report: this.prepareReport(get(this.props.location, ['state', 'report'])),
    mergeTask: '',
    mergeOwner: '',
  };

  constructor(props) {
    super(props);
    bindAll(this, [
      'getReport',
      'renderCategory',
      'onMergeOwnerChange',
      'onMergeTaskChange',
      'onShowMerge',
      'onMergeSubmit',
      'onIgnore',
      'onHardReset',
      'onSoftReset',
      'onSubmit',
    ]);
  }

  componentDidMount() {
    if (this.state.report) return;
    this.getReport();
  }

  prepareReport(report) {
    if (!report) return report;
    report.currentBody = cloneDeep(report.last_body);
    this.keyifyBody(report.currentBody);
    return report;
  }

  keyifyBody(body) {
    Object.keys(body).forEach((key) => {
      body[key].forEach((workTime) => {
        workTime.key = uuidv4();
        workTime.toMerge = false;
      });
    });
    return body;
  }

  unkeyifyBody(body) {
    Object.keys(body).forEach((key) => {
      body[key].forEach((workTime) => {
        delete workTime.key;
        delete workTime.toMerge;
      });
    });
    return body;
  }

  onHardReset() {
    this.setState(({ report }) => ({ report: { ...report, currentBody: this.keyifyBody(cloneDeep(report.initial_body)) } }));
  }

  onSoftReset() {
    this.setState(({ report }) => ({ report: this.prepareReport(report) }));
  }

  onMergeOwnerChange(event) {
    this.setState({ mergeOwner: event.target.value });
  }

  onMergeTaskChange(event) {
    this.setState({ mergeTask: event.target.value });
  }

  onSubmit(event) {
    event.preventDefault();
    const { report, projectId, reportId } = this.state;
    Api.makePutRequest({
      url: `/api/projects/${projectId}/project_reports/${reportId}`,
      body: {
        project_report: {
          last_body: this.unkeyifyBody(cloneDeep(report.currentBody)),
        },
      },
    }).then(({ data }) => {
      this.setState({ report: this.prepareReport(data) });
    });
  }

  onIgnore(event, category, key) {
    event.preventDefault();
    this.setState(({ report }) => {
      const [removedWorkedTime, rest] = partition(report.currentBody[category], wt => wt.key === key);
      const ignored = removedWorkedTime.concat(report.currentBody.ignored || []);
      const currentBody = { ...report.currentBody, [category]: rest, ignored };
      return { report: { ...report, currentBody } };
    });
  }

  onShowMerge(category) {
    this.setState((state) => {
      const tasksToMerge = state.currentBody[category].filter(e => e.toMerge);
      return {
        mergeTask: uniq(tasksToMerge.map(wt => wt.task)).join(', '),
        mergeOwner: uniq(tasksToMerge.map(wt => wt.owner)).join(', '),
      };
    }, () => $(`#modal-${category}`).toggle());
  }

  getReport() {
    const { projectId, reportId } = this.state;
    Api.makeGetRequest({ url: `/api/projects/${projectId}/project_reports/${reportId}/edit` })
      .then(({ data }) => {
        this.setState({ report: this.prepareReport(data) });
      });
  }

  onMergeSubmit(e, category) {
    e.preventDefault();
    this.setState(({ report, mergeOwner, mergeTask }) => {
      const [wtToMerge, otherWt] = partition(report.currentBody[category], 'toMerge');
      const newWt = {
        owner: mergeOwner, task: mergeTask, duration: sumBy(wtToMerge, 'duration'), key: uuidv4(), toMerge: false,
      };
      otherWt.unshift(newWt);
      const currentBody = { ...report.currentBody, [category]: otherWt };
      return { mergeOwner: '', mergeTask: '', report: { ...report, currentBody } };
    }, () => $(`#modal-${category}`).toggle());
  }

  handleMergeChange(event, category, key) {
    const checkValue = event.target.checked;
    this.setState(({ report }) => {
      report.currentBody[category] = report.currentBody[category].map((wt) => {
        if (wt.key === key) wt.toMerge = checkValue;
        return wt;
      });
      return report;
    });
  }

  renderMergeButton(category, times, disabled) {
    return (
      <button type="button" className="inline" disabled={disabled} onClick={() => this.onShowMerge(category)}>
        Merge
      </button>
    );
  }

  renderCategory(category) {
    const { mergeTask, mergeOwner } = this.state;
    const times = this.state.report.currentBody[category];
    if (times.length === 0) return null;
    const disableMergeButton = times.filter(wt => wt.toMerge).length < 2;
    return (
      <div key={category}>
        <h2>{category}</h2>
        <table className="table">
          <thead>
            <tr>
              <th>
                Merge
              </th>
              <th>
                Time spent
              </th>
              <th>
                Task
              </th>
              <th>
                Owner
              </th>
              <th>
                Ignore
              </th>
            </tr>
          </thead>
          <tbody>
            {times.map(({
              key, task, duration, owner, toMerge,
            }) => (
              <tr key={key}>
                <td>
                  <input name="toMerge" type="checkbox" checked={toMerge} onChange={e => this.handleMergeChange(e, category, key)} />
                  {toMerge && this.renderMergeButton(category, times, disableMergeButton)}
                </td>
                <td>{displayDuration(duration)}</td>
                <td>{task}</td>
                <td>{owner}</td>
                <td>
                  <button type="button" onClick={e => this.onIgnore(e, category, key)}>
                    Ignore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <div id={`modal-${category}`} className="unique-modal-class" style={{ display: 'none' }}>
          <div className="ui centered-modal modal transition visible active">
            <i className="close icon" />
            <div className="header">MERGE</div>
            <div className="content">
              <form className="form ui">
                <div className="error hidden message ui">
                  <p />
                </div>
                <div className="fields inline">
                  <div className="field">
                    <label>Task</label>
                    <input onChange={this.onMergeTaskChange} value={mergeTask} name="mergeTask" />
                  </div>
                  <div className="field">
                    <label>Owner</label>
                    <input onChange={this.onMergeOwnerChange} value={mergeOwner} name="mergeOwner" />
                  </div>
                  <div>
                    <label>Time Spent:</label>
                    <p>
                      {displayDuration(sumBy(times.filter(wt => wt.toMerge), 'duration'))}
                    </p>
                  </div>
                </div>
              </form>
            </div>
            <div className="actions">
              <button onClick={e => this.onMergeSubmit(e, category)} className="button green icon labeled right ui" type="button">
                Merge
                <i className="angle double icon right" />
              </button>
            </div>
          </div>
          <div className="ui dimmer modals modal-backdrop page transition visible active" style={{ display: 'flex !important' }} />
        </div>
      </div>
    );
  }

  renderIgnored() {
    const times = this.state.report.currentBody.ignored;
    if (isEmpty(times)) return null;
    return (
      <div>
        <h2>Ignored</h2>
        <table className="table">
          <thead>
            <tr>
              <th>
                Time spent
              </th>
              <th>
                Task
              </th>
              <th>
                Owner
              </th>
            </tr>
          </thead>
          <tbody>
            {times.map(({
              key, task, duration, owner,
            }) => (
              <tr key={key}>
                <td>{displayDuration(duration)}</td>
                <td>{task}</td>
                <td>{owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
      </div>
    );
  }

  render() {
    const { report } = this.state;
    if (!report) return <div />;
    return (
      <div>
        <button type="button" onClick={this.onSoftReset}>Soft reset</button>
        <button type="button" onClick={this.onHardReset}>Hard reset</button>
        <hr />
        {without(Object.keys(report.currentBody), 'ignored').map(this.renderCategory)}
        {this.renderIgnored()}
        <div className="text-center">
          <button className="text-center" type="button" onClick={this.onSubmit}>SUBMIT</button>
        </div>
      </div>
    );
  }
}

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
    report: get(this.props.location, ['state', 'report']),
    currentBody: this.keyifyBody(get(this.props.location, ['state', 'report', 'last_body'])),
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
    this.props.history.replace({ pathname: this.props.location.pathname, state: {} });
    if (this.state.currentBody) return;
    this.getReport();
  }

  keyifyBody(body) {
    if (!body) return body;
    const newBody = cloneDeep(body);
    Object.keys(newBody).forEach((key) => {
      newBody[key].forEach((workTime) => {
        workTime.key = uuidv4();
        workTime.toMerge = false;
      });
    });
    return newBody;
  }

  unkeyifyBody(body) {
    const newBody = cloneDeep(body);
    Object.keys(newBody).forEach((key) => {
      newBody[key].forEach((workTime) => {
        delete workTime.key;
        delete workTime.toMerge;
      });
    });
    return newBody;
  }

  onHardReset() {
    this.setState(({ report }) => ({ currentBody: this.keyifyBody(report.initial_body) }));
  }

  onSoftReset() {
    this.setState(({ report }) => ({ currentBody: this.keyifyBody(report.last_body) }));
  }

  onMergeOwnerChange(event) {
    this.setState({ mergeOwner: event.target.value });
  }

  onMergeTaskChange(event) {
    this.setState({ mergeTask: event.target.value });
  }

  onSubmit(event) {
    event.preventDefault();
    const { currentBody, projectId, reportId } = this.state;
    Api.makePutRequest({
      url: `/api/projects/${projectId}/project_reports/${reportId}`,
      body: {
        project_report: {
          last_body: this.unkeyifyBody(currentBody),
        },
      },
    }).then(({ data }) => {
      this.setState({ currentBody: this.keyifyBody(data.last_body) });
    });
  }

  onIgnore(event, category, key) {
    event.preventDefault();
    this.setState(({ currentBody }) => {
      const [removedWorkedTime, rest] = partition(currentBody[category], wt => wt.key === key);
      const ignored = removedWorkedTime.concat(currentBody.ignored || []);
      const newBody = { ...currentBody, [category]: rest, ignored };
      return { currentBody: newBody };
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
        this.setState({ report: data, currentBody: this.keyifyBody(data.last_body) });
      });
  }

  onMergeSubmit(e, category) {
    e.preventDefault();
    this.setState(({ currentBody, mergeOwner, mergeTask }) => {
      const [wtToMerge, otherWt] = partition(currentBody[category], 'toMerge');
      const newWt = {
        owner: mergeOwner,
        task: mergeTask,
        duration: sumBy(wtToMerge, 'duration'),
        key: uuidv4(),
        toMerge: false,
        id: wtToMerge.map(wt => wt.id).join(','),
      };
      otherWt.unshift(newWt);
      const newBody = { ...currentBody, [category]: otherWt };
      return { mergeOwner: '', mergeTask: '', currentBody: newBody };
    }, () => $(`#modal-${category}`).toggle());
  }

  handleMergeChange(event, category, key) {
    const checkValue = event.target.checked;
    this.setState(({ currentBody }) => {
      currentBody[category] = currentBody[category].map((wt) => {
        if (wt.key === key) wt.toMerge = checkValue;
        return wt;
      });
      return { currentBody };
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
    const { mergeTask, mergeOwner, currentBody } = this.state;
    const times = currentBody[category];
    if (times.length === 0) return null;
    const toMergeTasks = times.filter(wt => wt.toMerge);
    return (
      <div key={category}>
        <h2>{category}</h2>
        <h3>{displayDuration(sumBy(times, 'duration'))}</h3>
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
                Description
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
              key, task, duration, owner, toMerge, description,
            }) => (
              <tr key={key}>
                <td>
                  <input name="toMerge" type="checkbox" checked={toMerge} onChange={e => this.handleMergeChange(e, category, key)} />
                  {toMerge && this.renderMergeButton(category, times, toMergeTasks.length < 2)}
                </td>
                <td>{displayDuration(duration)}</td>
                <td>{task}</td>
                <td>{description}</td>
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
                      {displayDuration(sumBy(toMergeTasks, 'duration'))}
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
    const times = this.state.currentBody.ignored;
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
                Description
              </th>
              <th>
                Owner
              </th>
            </tr>
          </thead>
          <tbody>
            {times.map(({
              key, task, duration, owner, description,
            }) => (
              <tr key={key}>
                <td>{displayDuration(duration)}</td>
                <td>{task}</td>
                <td>{description}</td>
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
    const { report, currentBody } = this.state;
    if (!report || !currentBody) return <div />;
    return (
      <div>
        <button type="button" onClick={this.onSoftReset}>Soft reset</button>
        <button type="button" onClick={this.onHardReset}>Hard reset</button>
        <hr />
        <h2>
          Whole duration:
          {' '}
          {displayDuration(report.duration_sum - sumBy(currentBody.ignored, 'duration'))}
        </h2>
        <hr />
        {without(Object.keys(currentBody), 'ignored').sort().map(this.renderCategory)}
        {this.renderIgnored()}
        <div className="text-center">
          <button className="text-center" type="button" onClick={this.onSubmit}>SUBMIT</button>
        </div>
      </div>
    );
  }
}

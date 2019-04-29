import React from 'react';
import moment from 'moment';
import {
  bindAll, get, sumBy, uniq, partition, without, isEmpty, cloneDeep,
} from 'lodash';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';

export default class EditReport extends React.Component {
  state = {
    reportId: parseInt(this.props.match.params.reportId, 10),
    projectId: parseInt(this.props.match.params.projectId, 10),
    report: get(this.props.location, ['state', 'report']),
    currentBody: this.prepareBody(get(this.props.location, ['state', 'report', 'last_body'])),
    mergeTask: '',
    mergeOwner: '',
    mergeDescription: '',
    workTimeModalCategory: null,
    workTimeModalId: null,
  };

  constructor(props) {
    super(props);
    bindAll(this, [
      'getReport',
      'renderCategory',
      'onMergeOwnerChange',
      'onMergeTaskChange',
      'onMergeDescriptionChange',
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

  prepareBody(body) {
    if (!body) return body;
    const newBody = cloneDeep(body);
    Object.keys(newBody).forEach((key) => {
      newBody[key].forEach((workTime) => {
        workTime.toMerge = false;
      });
    });
    return newBody;
  }

  stripBody(body) {
    const newBody = cloneDeep(body);
    Object.keys(newBody).forEach((key) => {
      newBody[key].forEach((workTime) => {
        delete workTime.toMerge;
      });
    });
    return newBody;
  }

  onHardReset() {
    this.setState(({ report }) => ({ currentBody: this.prepareBody(report.initial_body) }));
  }

  onSoftReset() {
    this.setState(({ report }) => ({ currentBody: this.prepareBody(report.last_body) }));
  }

  onMergeOwnerChange(event) {
    this.setState({ mergeOwner: event.target.value });
  }

  onMergeTaskChange(event) {
    this.setState({ mergeTask: event.target.value });
  }

  onMergeDescriptionChange(event) {
    this.setState({ mergeDescription: event.target.value });
  }

  onSubmit(event) {
    event.preventDefault();
    const { currentBody, projectId, reportId } = this.state;
    Api.makePutRequest({
      url: `/api/projects/${projectId}/project_reports/${reportId}`,
      body: {
        project_report: {
          last_body: this.stripBody(currentBody),
        },
      },
    }).then(({ data }) => {
      this.setState({ currentBody: this.prepareBody(data.last_body), report: data });
    });
  }

  onIgnore(event, category, id) {
    event.preventDefault();
    this.setState(({ currentBody }) => {
      const [removedWorkedTime, rest] = partition(currentBody[category], wt => wt.id === id);
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
        this.setState({ report: data, currentBody: this.prepareBody(data.last_body) });
      });
  }

  onShowWorkTimeModal(e, category, id) {
    e.preventDefault();
    this.setState({ workTimeModalCategory: category, workTimeModalId: id }, () => $('#work-time-modal').toggle());
  }

  onMergeSubmit(e, category) {
    e.preventDefault();
    this.setState(({
      currentBody, mergeOwner, mergeTask, mergeDescription,
    }) => {
      const [wtToMerge, otherWt] = partition(currentBody[category], 'toMerge');
      const newWt = {
        owner: mergeOwner,
        task: mergeTask,
        description: mergeDescription,
        duration: sumBy(wtToMerge, 'duration'),
        toMerge: false,
        touched: true,
        cost: sumBy(wtToMerge, 'cost'),
        id: wtToMerge.map(wt => wt.id).join(';'),
      };
      otherWt.unshift(newWt);
      const newBody = { ...currentBody, [category]: otherWt };
      return {
        mergeOwner: '', mergeTask: '', mergeDescription: '', currentBody: newBody, workTimeModalCategory: null, workTimeModalId: null,
      };
    }, () => $(`#modal-${category}`).toggle());
  }

  handleMergeChange(event, category, id) {
    const checkValue = event.target.checked;
    this.setState(({ currentBody }) => {
      currentBody[category] = currentBody[category].map((wt) => {
        if (wt.id === id) wt.toMerge = checkValue;
        return wt;
      });
      return { currentBody };
    });
  }

  renderMergeButton(category, edit) {
    return (
      <button type="button" className="inline" onClick={() => this.onShowMerge(category)}>
        {edit ? 'Edit' : 'Merge'}
      </button>
    );
  }

  renderCost(cost) {
    const { report } = this.state;
    // eslint-disable-next-line
    return `${cost.toFixed(2)} ${report.currency}`; // hard space
  }

  renderWorkTimeModal() {
    const { workTimeModalCategory, workTimeModalId, currentBody } = this.state;
    if (!workTimeModalCategory || !workTimeModalId) return null;
    const workTime = currentBody[workTimeModalCategory].find(wt => wt.id === workTimeModalId);
    const ids = workTime.id.split(';');
    const ancestors = this.state.report.initial_body[workTimeModalCategory].filter(wt => ids.includes(wt.id));
    return (
      <div id="work-time-modal" className="unique-modal-class" style={{ display: 'none' }}>
        <div className="ui centered-modal modal transition visible active">
          <i className="close icon" />
          <div className="header">Details</div>
          <div className="content">
            <table className="table">
              <thead>
                <tr>
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
                    Time spent
                  </th>
                  <th>
                    Owner wage
                  </th>
                  <th>
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {ancestors.map(({
                  id, duration, task, description, owner, cost,
                }) => (
                  <tr key={id}>
                    <td>
                      {task}
                    </td>
                    <td>
                      {description}
                    </td>
                    <td>
                      {owner}
                    </td>
                    <td>
                      {displayDuration(duration)}
                    </td>
                    <td>
                      {this.state.report.roles[owner].hourly_wage}
                    </td>
                    <td>
                      {this.renderCost(cost)}
                    </td>
                  </tr>
                ))}
                <tr className="active">
                  <td>
                    {workTime.task}
                  </td>
                  <td>
                    {workTime.description}
                  </td>
                  <td>
                    {workTime.owner}
                  </td>
                  <td>
                    {displayDuration(workTime.duration)}
                  </td>
                  <td>
                    -
                  </td>
                  <td>
                    {this.renderCost(workTime.cost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="ui dimmer modals modal-backdrop page transition visible active" style={{ display: 'flex !important' }} />
      </div>
    );
  }

  renderCategory(category) {
    const {
      mergeTask, mergeOwner, mergeDescription, currentBody,
    } = this.state;
    const times = currentBody[category];
    if (times.length === 0) return null;
    const toMergeTasks = times.filter(wt => wt.toMerge);
    return (
      <div key={category}>
        <h2>{category}</h2>
        <table className="table">
          <thead>
            <tr>
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
                Time spent
              </th>
              <th>
                Cost
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {times.map(({
              id, task, duration, owner, toMerge, description, cost, touched,
            }) => (
              <tr key={id}>
                <td>{task}</td>
                <td>{description}</td>
                <td>{owner}</td>
                <td>{displayDuration(duration)}</td>
                <td>{this.renderCost(cost)}</td>
                <td>
                  <p>
                    <input name="toMerge" type="checkbox" checked={toMerge} onChange={e => this.handleMergeChange(e, category, id)} />
                    {toMerge && this.renderMergeButton(category, toMergeTasks.length < 2)}
                  </p>
                  {touched
                    && (
                    <button type="button" onClick={e => this.onShowWorkTimeModal(e, category, id)}>
                      Show Details
                    </button>
                    )
                  }
                  <button type="button" onClick={e => this.onIgnore(e, category, id)}>
                    Ignore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {this.renderWorkTimeModal()}
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
                <div className="fields">
                  <div className="field">
                    <label htmlFor="mergeTask">Task</label>
                    <textarea onChange={this.onMergeTaskChange} value={mergeTask} name="mergeTask" />
                  </div>
                  <div className="field">
                    <label htmlFor="mergeDescription">Description</label>
                    <textarea onChange={this.onMergeDescriptionChange} value={mergeDescription} name="mergeDescription" />
                  </div>
                  <div className="field">
                    <label htmlFor="mergeOwner">Owner</label>
                    <textarea onChange={this.onMergeOwnerChange} value={mergeOwner} name="mergeOwner" />
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
                {toMergeTasks.length > 1 ? 'Merge' : 'Update'}
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
                Task
              </th>
              <th>
                Description
              </th>
              <th>
                Owner
              </th>
              <th>
                Time spent
              </th>
              <th>
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {times.map(({
              id, task, duration, owner, description, cost,
            }) => (
              <tr key={id}>
                <td>{task}</td>
                <td>{description}</td>
                <td>{owner}</td>
                <td>{displayDuration(duration)}</td>
                <td>{this.renderCost(cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
      </div>
    );
  }

  renderSummary() {
    const { report, currentBody } = this.state;
    const categories = without(Object.keys(currentBody), 'ignored').sort();
    const categoriesDurationSum = categories.map(category => sumBy(currentBody[category], 'duration'));
    const categoriesCostSum = categories.map(category => sumBy(currentBody[category], 'cost'));
    return (
      <div className="edit-report-summary">
        <button type="button" onClick={this.onSoftReset}>Soft reset</button>
        <button type="button" onClick={this.onHardReset}>Hard reset</button>
        <hr />
        <h2>{report.project_name}</h2>
        <p>
          <strong>
            {moment(report.starts_at).format('MM.DD')}
-
            {moment(report.ends_at).format('MM.DD')}
          </strong>
        </p>
        <table className="table">
          <tbody>
            {categories.map((category, idx) => (
              <tr key={category}>
                <td>
                  {category}
                </td>
                <td>
                  {displayDuration(categoriesDurationSum[idx])}
                </td>
                <td>
                  {this.renderCost(categoriesCostSum[idx])}
                </td>
              </tr>
            ))}
            <tr className="active">
              <th>Total</th>
              <th>{displayDuration(sumBy(categoriesDurationSum))}</th>
              <th>{this.renderCost(sumBy(categoriesCostSum))}</th>
            </tr>
          </tbody>
        </table>
        <hr />
        <button className="text-center" type="button" onClick={this.onSubmit}>Submit</button>
        <button className="text-center" type="button">Generate</button>
      </div>
    );
  }

  render() {
    const { report, currentBody } = this.state;
    if (!report || !currentBody) return <div />;
    return (
      <div>
        {without(Object.keys(currentBody), 'ignored').sort().map(this.renderCategory)}
        {this.renderIgnored()}
        {this.renderSummary()}
      </div>
    );
  }
}

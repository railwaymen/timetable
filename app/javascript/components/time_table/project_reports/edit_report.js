import React from 'react';
import moment from 'moment';
import {
  bindAll, get, sumBy, uniq, partition, without, isEmpty, cloneDeep,
} from 'lodash';
import * as Api from '../../shared/api';
import { displayDuration } from '../../shared/helpers';
import Modal from '../../shared/modal';
import TagPill from '../timesheet/tag_pill';

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
      'onGenerate',
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

  editable() {
    return this.state.report.state !== 'done';
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

  onGenerate(event) {
    event.preventDefault();
    const { projectId, reportId } = this.state;
    Api.makePutRequest({
      url: `/api/projects/${projectId}/project_reports/${reportId}/generate`,
      body: {
      },
    }).then(({ data }) => {
      this.setState({ report: data });
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

  renderRowActions({ id, touched, toMerge }, category, toMergeTasks) {
    let result = [];
    if (this.editable()) {
      result = [
        <p key="merge">
          <input name="toMerge" type="checkbox" checked={toMerge} onChange={e => this.handleMergeChange(e, category, id)} />
          {toMerge && this.renderMergeButton(category, toMergeTasks.length < 2)}
        </p>,
        <button key="ignore" type="button" onClick={e => this.onIgnore(e, category, id)}>
          Ignore
        </button>,
      ];
    }
    if (touched) {
      result.push(
        <button key="details" type="button" onClick={e => this.onShowWorkTimeModal(e, category, id)}>
          Show Details
        </button>,
      );
    }
    return result;
  }

  renderWorkTimeModal() {
    const { workTimeModalCategory, workTimeModalId, currentBody } = this.state;
    if (!workTimeModalCategory || !workTimeModalId) return null;
    const workTime = currentBody[workTimeModalCategory].find(wt => wt.id === workTimeModalId);
    const ids = workTime.id.split(';');
    const ancestors = this.state.report.initial_body[workTimeModalCategory].filter(wt => ids.includes(wt.id));
    return (
      <Modal
        id="work-time-modal"
        header="Details"
        content={(
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
          )}
      />
    );
  }

  createTagObject(tag) {
    return {
      key: tag,
      value: I18n.t(`apps.tag.${tag}`),
    };
  }

  selectAllWithTag(category, tag) {
    this.setState(({ currentBody }) => {
      const newBody = currentBody[category].map((wt) => {
        const workTime = cloneDeep(wt);
        if (workTime.tag === tag) {
          workTime.toMerge = true;
        } else {
          delete workTime.toMerge;
        }
        return workTime;
      });
      return { currentBody: { ...currentBody, [category]: newBody } };
    });
  }

  renderCategory(category) {
    const {
      mergeTask, mergeOwner, mergeDescription, currentBody,
    } = this.state;
    const times = currentBody[category];
    if (times.length === 0) return null;
    const toMergeTasks = times.filter(wt => wt.toMerge);
    const modalHeader = toMergeTasks.length > 1 ? 'Merge' : 'Update';
    return (
      <div key={category}>
        <h2>{category}</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Tag</th>
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
              id, task, duration, owner, toMerge, description, cost, touched, tag,
            }) => (
              <tr key={id}>
                <td><TagPill tag={this.createTagObject(tag)} onClick={() => this.selectAllWithTag(category, tag)} /></td>
                <td>{task}</td>
                <td>{description}</td>
                <td>{owner}</td>
                <td>{displayDuration(duration)}</td>
                <td>{this.renderCost(cost)}</td>
                <td>
                  {this.renderRowActions({ id, toMerge, touched }, category, toMergeTasks)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal
          id={`modal-${category}`}
          header={modalHeader}
          content={(
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
          )}
          actions={(
            <button onClick={e => this.onMergeSubmit(e, category)} className="button green icon labeled right ui" type="button">
              {modalHeader}
              <i className="angle double icon right" />
            </button>
          )}
        />
        <hr />
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
    const {
      report,
      currentBody,
      projectId,
      reportId,
    } = this.state;
    const categories = without(Object.keys(currentBody), 'ignored').sort();
    const categoriesDurationSum = categories.map(category => sumBy(currentBody[category], 'duration'));
    const categoriesCostSum = categories.map(category => sumBy(currentBody[category], 'cost'));
    return (
      <div className="edit-report-summary">
        {this.editable()
          && [
            <button key="soft" type="button" onClick={this.onSoftReset}>Soft reset</button>,
            <button key="hard" type="button" onClick={this.onHardReset}>Hard reset</button>,
            <hr key="hr" />,
          ]
        }
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
        {this.editable()
          && [
            <hr key="hr" />,
            <button key="submit" className="text-center" type="button" onClick={this.onSubmit}>Submit</button>,
            <button key="generate" className="text-center" type="button" onClick={this.onGenerate}>Generate</button>,
          ]}
        {report.generated
          && (
          <a href={`/api/projects/${projectId}/project_reports/${reportId}/file`}>
            Download
          </a>
          )
        }
      </div>
    );
  }

  render() {
    const { report, currentBody } = this.state;
    if (!report || !currentBody) return <div />;
    return (
      <div>
        {without(Object.keys(currentBody), 'ignored').sort().map(this.renderCategory)}
        {this.renderWorkTimeModal()}
        {this.renderIgnored()}
        {this.renderSummary()}
      </div>
    );
  }
}

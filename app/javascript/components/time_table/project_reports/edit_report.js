import React from 'react';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import {
  bindAll, get, sumBy, uniq, partition, without, isEmpty, cloneDeep,
} from 'lodash';
import ModalButton from '@components/shared/modal_button';
import Modal from '@components/shared/modal';
import * as Api from '../../shared/api';
import { displayDuration, extractIntegrationPayload } from '../../shared/helpers';
import Breadcrumb from '../../shared/breadcrumb';
import TagPill from '../timesheet/tag_pill';

export default class EditReport extends React.Component {
  constructor(props) {
    super(props);

    bindAll(this, [
      'getReport',
      'getProject',
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
      'onRefresh',
    ]);

    this.state = {
      reportId: parseInt(this.props.match.params.reportId, 10),
      projectId: parseInt(this.props.match.params.projectId, 10),
      report: get(this.props.location, ['state', 'report']),
      currentBody: this.prepareBody(get(this.props.location, ['state', 'report', 'last_body'])),
      mergeTask: '',
      mergeOwner: '',
      mergeDescription: '',
      crumbs: [],
      workTimeModalCategory: null,
      workTimeModalId: null,
    };
  }

  componentDidMount() {
    this.props.history.replace({ pathname: this.props.location.pathname, state: {} });
    if (this.state.currentBody) return;
    this.getReport().then(this.getProject);
  }

  onHardReset() {
    if (window.confirm(I18n.t('common.confirm'))) {
      this.setState(({ report }) => ({ currentBody: this.prepareBody(report.initial_body) }));
    }
  }

  onSoftReset() {
    if (window.confirm(I18n.t('common.confirm'))) {
      this.setState(({ report }) => ({ currentBody: this.prepareBody(report.last_body) }));
    }
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

  onRefresh() {
    const { projectId, reportId } = this.state;
    Api.makePutRequest({
      url: `/api/projects/${projectId}/project_reports/${reportId}/refresh`,
      body: {
      },
    }).then(({ data }) => {
      this.setState({ report: data });
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

  onIgnore(event, category, ids) {
    event.preventDefault();
    if (window.confirm(I18n.t('common.confirm'))) {
      this.setState(({ currentBody }) => {
        const [removedWorkedTime, rest] = partition(currentBody[category], (wt) => ids.includes(wt.id));
        const ignored = removedWorkedTime.concat(currentBody.ignored || []);
        const newBody = { ...currentBody, [category]: rest, ignored };
        return { currentBody: newBody, workTimeModalCategory: null, workTimeModalId: null };
      });
    }
  }

  onShowMerge(event, category) {
    this.setState((state) => {
      const tasksToMerge = state.currentBody[category].filter((e) => e.toMerge);
      return {
        mergeTask: uniq(tasksToMerge.map((wt) => wt.task)).join(', '),
        mergeOwner: uniq(tasksToMerge.map((wt) => wt.owner)).join(', '),
        mergeDescription: uniq(tasksToMerge.map((wt) => wt.description)).join(', '),
      };
    }, () => $(`#modal-${category}`).modal('show'));
  }

  onShowWorkTimeModal(e, category, id) {
    e.preventDefault();
    this.setState({ workTimeModalCategory: category, workTimeModalId: id }, () => $('#workTimeModal').modal('show'));
  }

  onMergeSubmit(e, category) {
    e.preventDefault();
    this.setState(({
      currentBody, mergeOwner, mergeTask, mergeDescription,
    }) => {
      const [wtToMerge, otherWt] = partition(currentBody[category], 'toMerge');
      const tag = wtToMerge.find((wt) => wt.tag !== wtToMerge[0].tag) ? 'various' : wtToMerge[0].tag;
      const user_id = wtToMerge.find((wt) => wt.user_id !== wtToMerge[0].user_id) ? null : wtToMerge[0].user_id;
      const newWt = {
        owner: mergeOwner,
        task: mergeTask,
        description: mergeDescription,
        duration: sumBy(wtToMerge, 'duration'),
        toMerge: false,
        touched: true,
        cost: sumBy(wtToMerge, 'cost'),
        id: wtToMerge.map((wt) => wt.id).join(';'),
        tag,
        user_id,
      };
      otherWt.unshift(newWt);
      const newBody = { ...currentBody, [category]: otherWt };
      return {
        mergeOwner: '', mergeTask: '', mergeDescription: '', currentBody: newBody, workTimeModalCategory: null, workTimeModalId: null,
      };
    }, () => $(`#modal-${category}`).modal('hide'));
  }

  onShowEdit(event, category, id) {
    this.setState(({ currentBody }) => {
      const newCurrentBody = currentBody[category].map((wt) => {
        if (wt.id === id) return { ...wt, toMerge: true };
        return wt;
      });

      return { currentBody: { ...currentBody, [category]: newCurrentBody } };
    }, () => this.onShowMerge(event, category));
  }

  getReport() {
    const { projectId, reportId } = this.state;
    return Api.makeGetRequest({ url: `/api/projects/${projectId}/project_reports/${reportId}/edit` })
      .then(({ data }) => {
        this.setState({ report: data, currentBody: this.prepareBody(data.last_body) });
      });
  }

  getProject() {
    const { report, projectId } = this.state;
    Api.makeGetRequest({ url: `/api/projects/${projectId}` })
      .then((response) => {
        const crumbs = [
          { href: '/projects', label: I18n.t('common.projects') },
          { href: `/projects/${projectId}/work_times`, label: response.data.name },
          { href: `/projects/${projectId}/reports`, label: I18n.t('common.reports') },
          { label: report.name },
        ];
        this.setState({ crumbs });
      });
  }

  handleMergeChange(event, category, id) {
    const checkValue = event.target.checked;
    this.setState(({ currentBody }) => {
      const newCurrentBody = currentBody[category].map((wt) => {
        if (wt.id === id) wt.toMerge = checkValue;
        return wt;
      });
      return { currentBody: { ...currentBody, [category]: newCurrentBody } };
    });
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

  handleTagPillClick(category, tag) {
    this.setState(({ currentBody }) => {
      const toMergeValue = !currentBody[category].find((wt) => wt.toMerge && wt.tag === tag);
      const newBody = currentBody[category].map((wt) => {
        const { toMerge, ...workTime } = wt;
        workTime.toMerge = toMergeValue && workTime.tag === tag;
        return workTime;
      });
      return { currentBody: { ...currentBody, [category]: newBody } };
    });
  }

  renderIgnoreButton(category, id) {
    return (
      <button
        key="ignore"
        type="button"
        className="btn btn-outline-danger destroy"
        onClick={(e) => this.onIgnore(e, category, [id])}
        data-tooltip-bottom={I18n.t('apps.reports.ignore')}
      >
        <i className="fa fa-trash-o" />
      </button>
    );
  }

  renderIgnoreMultipleButton(category, ids) {
    return (
      <button
        key="ignore"
        type="button"
        className="btn btn-outline-danger destroy"
        onClick={(e) => this.onIgnore(e, category, ids)}
        data-tooltip-bottom={I18n.t('apps.reports.ignore')}
      >
        <i className="fa fa-trash-o" />
        <i className="fa fa-trash-o" />
      </button>
    );
  }

  renderMergeButton(category) {
    return (
      <button
        key="merge"
        type="button"
        className="btn btn-outline-secondary"
        onClick={(e) => this.onShowMerge(e, category)}
        data-tooltip-bottom={I18n.t('apps.reports.merge')}
      >
        <i className="fa fa-compress" />
      </button>
    );
  }

  renderEditOrMergeButton(category, id, addToMerge) {
    return (
      <ModalButton
        key="edit"
        id={category ? `modal-${category}` : 'workTimeModal'}
        type="button"
        btnClass={`btn btn-outline-primary ml-0 ${addToMerge ? 'plus' : ''}`}
        content={(<i className="fa fa-pencil" />)}
        onClick={(e) => this.onShowEdit(e, category, id)}
        data-tooltip-bottom={addToMerge ? I18n.t('apps.reports.merge') : I18n.t('common.edit')}
      />
    );
  }

  renderCost(cost) {
    const { report } = this.state;
    // eslint-disable-next-line
    return `${cost.toFixed(2)} ${report.currency}`; // hard space
  }

  renderRowActions({ id, touched, toMerge }, category, toMergeTasks) {
    const result = [];
    const willBeAddedToMerge = !toMerge && toMergeTasks.length > 0;
    if (touched) {
      result.push(
        <button
          key="details"
          type="button"
          className="btn btn-info"
          onClick={(e) => this.onShowWorkTimeModal(e, category, id)}
          data-tooltip-bottom={I18n.t('common.history')}
        >
          <i className="fa fa-clock-o" />
        </button>,
      );
    }
    if (this.editable()) {
      result.push(
        <React.Fragment key="merge">
          <div className="input-group-prepend">
            <div className="input-group-text">
              <input
                name="toMerge"
                type="checkbox"
                checked={toMerge}
                onChange={(e) => this.handleMergeChange(e, category, id)}
                aria-label="Mark report to merge"
              />
            </div>
          </div>
          {toMerge && toMergeTasks.length >= 2 ? (
            this.renderMergeButton(category)
          ) : (
            this.renderEditOrMergeButton(category, id, willBeAddedToMerge)
          )}
        </React.Fragment>,
        <React.Fragment key="ignore">
          {toMerge && toMergeTasks.length >= 2 ? (
            this.renderIgnoreMultipleButton(category, toMergeTasks.map((t) => t.id))
          ) : (
            this.renderIgnoreButton(category, id)
          )}
        </React.Fragment>,
      );
    }
    return result;
  }

  renderWorkTimeModal() {
    const { workTimeModalCategory, workTimeModalId, currentBody } = this.state;
    if (!workTimeModalCategory || !workTimeModalId) return null;
    const workTime = currentBody[workTimeModalCategory].find((wt) => wt.id === workTimeModalId);
    const ids = workTime.id.split(';');
    const ancestors = this.state.report.initial_body[workTimeModalCategory].filter((wt) => ids.includes(wt.id));
    return (
      <Modal
        id="workTimeModal"
        modalClass="modal-lg"
        header="Details"
        content={(
          <table className="table">
            <thead>
              <tr>
                <th>
                  {I18n.t('common.task')}
                </th>
                <th>
                  {I18n.t('common.description')}
                </th>
                <th>
                  {I18n.t('apps.reports.owner')}
                </th>
                <th>
                  {I18n.t('apps.reports.time_spent')}
                </th>
                <th>
                  {I18n.t('apps.reports.owners_hourly_wage')}
                </th>
                <th>
                  {I18n.t('apps.reports.cost')}
                </th>
              </tr>
            </thead>
            <tbody>
              {ancestors.map(({
                id, duration, task, description, owner, cost, user_id,
              }) => (
                <tr key={id}>
                  <td>
                    {task && <a href={task} target="_blank" rel="noopener noreferrer">{task}</a>}
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
                    {this.state.report.roles[user_id].hourly_wage}
                  </td>
                  <td>
                    {this.renderCost(cost)}
                  </td>
                </tr>
              ))}
              <tr className="active">
                <td>
                  {workTime.task && (
                    <a href={workTime.task} target="_blank" rel="noopener noreferrer">{workTime.task}</a>
                  )}
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

  renderCategory(category) {
    const {
      mergeTask, mergeOwner, mergeDescription, currentBody,
    } = this.state;
    const times = currentBody[category];
    if (times.length === 0) return null;
    const toMergeTasks = times.filter((wt) => wt.toMerge);
    const modalHeader = toMergeTasks.length > 1 ? 'Merge' : 'Update';
    return (
      <div key={category}>
        <h2>{category}</h2>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>
                  {I18n.t('common.tag')}
                </th>
                <th>
                  {I18n.t('common.task')}
                </th>
                <th>
                  {I18n.t('common.type')}
                </th>
                <th>
                  {I18n.t('common.labels')}
                </th>
                <th>
                  {I18n.t('common.description')}
                </th>
                <th>
                  {I18n.t('apps.reports.owner')}
                </th>
                <th className="text-center">
                  {I18n.t('apps.reports.time_spent')}
                </th>
                <th className="text-right">
                  {I18n.t('apps.reports.cost')}
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {times.map(({
                id, task, duration, owner, toMerge, description, cost, touched, tag, integration_payload,
              }) => (
                <tr key={id}>
                  <td><TagPill tag={tag} onClick={() => this.handleTagPillClick(category, tag)} bold={false} /></td>
                  <td>
                    {task && <a href={task} target="_blank" rel="noopener noreferrer">{task}</a>}
                  </td>
                  <td>
                    {extractIntegrationPayload(integration_payload).type}
                  </td>
                  <td>
                    {(extractIntegrationPayload(integration_payload).labels || []).map((label) => (
                      <span key={label} className="badge badge-pill badge-primary">{label}</span>
                    ))}
                  </td>
                  <td>{description}</td>
                  <td>{owner}</td>
                  <td className="text-center">{displayDuration(duration)}</td>
                  <td className="text-right">{this.renderCost(cost)}</td>
                  <td className="task-actions list-of-actions">
                    <div className="input-group btn-group">
                      {this.renderRowActions({ id, toMerge, touched }, category, toMergeTasks)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal
          id={`modal-${category}`}
          modalClass="modal-lg"
          header={modalHeader}
          content={(
            <form className="form ui">
              <div className="error hidden message ui">
                <p />
              </div>
              <div className="fields">
                <div className="field">
                  <label htmlFor="mergeTask" style={{display: 'block'}}>Task</label>
                  <textarea onChange={this.onMergeTaskChange} value={mergeTask} name="mergeTask" />
                </div>
                <div className="field">
                  <label htmlFor="mergeDescription" style={{display: 'block'}}>Description</label>
                  <textarea onChange={this.onMergeDescriptionChange} value={mergeDescription} name="mergeDescription" style={{width: '300px'}} />
                </div>
                <div className="field">
                  <label htmlFor="mergeOwner" style={{display: 'block'}}>Owner</label>
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
            <button onClick={(e) => this.onMergeSubmit(e, category)} className="button green icon labeled right ui" type="button">
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
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>
                  {I18n.t('common.tag')}
                </th>
                <th>
                  {I18n.t('common.task')}
                </th>
                <th>
                  {I18n.t('common.type')}
                </th>
                <th>
                  {I18n.t('common.labels')}
                </th>
                <th>
                  {I18n.t('common.description')}
                </th>
                <th>
                  {I18n.t('apps.reports.owner')}
                </th>
                <th className="text-center">
                  {I18n.t('apps.reports.time_spent')}
                </th>
                <th className="text-right">
                  {I18n.t('apps.reports.cost')}
                </th>
              </tr>
            </thead>
            <tbody>
              {times.map(({
                id, task, duration, owner, description, tag, integration_payload, cost,
              }) => (
                <tr key={id}>
                  <td><TagPill tag={tag} bold={false} /></td>
                  <td>
                    {task && <a href={task} target="_blank" rel="noopener noreferrer">{task}</a>}
                  </td>
                  <td>
                    {extractIntegrationPayload(integration_payload).type}
                  </td>
                  <td>
                    {(extractIntegrationPayload(integration_payload).labels || []).map((label) => (
                      <span key={label} className="badge badge-pill badge-primary">{label}</span>
                    ))}
                  </td>
                  <td>{description}</td>
                  <td>{owner}</td>
                  <td className="text-center">{displayDuration(duration)}</td>
                  <td className="text-right">{this.renderCost(cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    const categoriesDurationSum = categories.map((category) => sumBy(currentBody[category], 'duration'));
    const categoriesCostSum = categories.map((category) => sumBy(currentBody[category], 'cost'));
    return (
      <div className="edit-report-summary card">
        <h2>{report.project_name}</h2>
        <p>
          <strong>
            {moment(report.starts_at).format('MM.DD')}
            -
            {moment(report.ends_at).format('MM.DD')}
          </strong>
        </p>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>
                  {I18n.t('apps.reports.role')}
                </th>
                <th>
                  {I18n.t('apps.reports.time_spent')}
                </th>
                <th>
                  {I18n.t('apps.reports.cost')}
                </th>
              </tr>
            </thead>
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
              <tr>
                <th>Total</th>
                <th>{displayDuration(sumBy(categoriesDurationSum))}</th>
                <th>{this.renderCost(sumBy(categoriesCostSum))}</th>
              </tr>
            </tbody>
          </table>
        </div>
        {this.editable() && (
          <div className="report-main-actions btn-group">
            <button key="submit" className="btn btn-outline-success btn-lg" type="button" onClick={this.onSubmit}>
              {I18n.t('common.save')}
              <i className="ml-2 fa fa-check" />
            </button>
            <button
              key="refresh"
              disabled={report.refresh_status === 'in_progress'}
              className="btn btn-outline-success btn-lg"
              type="button"
              onClick={this.onRefresh}
            >
              {I18n.t('common.refresh')}
              <i className="ml-2 fa fa-repeat" />
            </button>
            <button key="generate" className="btn btn-outline-success btn-lg" type="button" onClick={this.onGenerate}>
              {I18n.t('common.generate')}
              <i className="ml-2 fa fa-file-pdf-o" />
            </button>
          </div>
        )}
        {report.generated && (
          <div className="report-download-actions">
            <a className="btn btn-outline-success btn-lg" href={`/api/projects/${projectId}/project_reports/${reportId}/file.pdf`}>
              <i className="fa fa-file-pdf-o mr-2" />
              {I18n.t('common.download')}
            </a>
            <a className="btn btn-outline-success btn-lg" href={`/api/projects/${projectId}/project_reports/${reportId}/file.csv`}>
              <i className="fa fa-file-excel-o mr-2" />
              {I18n.t('common.download')}
            </a>
          </div>
        )}
        {this.editable() && (
          <>
            {report.refresh_status === 'done' && (
              <span className="text-success">
                {`${I18n.t('common.refreshed_at')}: ${moment(report.refreshed_at).formatTime()}`}
              </span>
            )}
            {report.refresh_status === 'in_progress' && (
              <span className="text-info">{I18n.t('common.refresh_in_progress')}</span>
            )}
            {report.refresh_status === 'error' && (
              <span className="text-danger">{I18n.t('common.refresh_error')}</span>
            )}
            <div className="report-undo-actions">
              <button key="soft" type="button" className="btn btn-sm text-info" onClick={this.onSoftReset}>
                <i className="fa fa-undo mr-2" />
                {I18n.t('apps.reports.restore_previous')}
              </button>
              <button key="hard" type="button" className="btn btn-sm text-danger" onClick={this.onHardReset}>
                <i className="fa fa-history mr-2" />
                {I18n.t('apps.reports.restore_first')}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  render() {
    const { report, currentBody } = this.state;
    if (!report || !currentBody) return <div />;
    return (
      <div className="edit-report-form">
        <Helmet>
          {report.state === 'done' ? (
            <title>{`${I18n.t('common.show')} ${report.name} - ${report.project_name}`}</title>
          ) : (
            <title>{`${I18n.t('common.edit')} ${report.name} - ${report.project_name}`}</title>
          )}
        </Helmet>
        <Breadcrumb crumbs={this.state.crumbs} />
        {without(Object.keys(currentBody), 'ignored').sort().map(this.renderCategory)}
        {this.renderWorkTimeModal()}
        {this.renderIgnored()}
        {this.renderSummary()}
      </div>
    );
  }
}

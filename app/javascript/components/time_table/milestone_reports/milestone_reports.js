import _ from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import usePrevious from '@hooks/use_previous';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import WorkTimesReportTable from '../../shared/work_times_report_table';
import { makeGetRequest } from '../../shared/api';
import { defaultDatePickerProps } from '../../shared/helpers';
import MilestonePieChart from './milestone_pie_chart';
import MilestoneSummary from './milestone_summary';
import MilestoneSummaryByPeople from './milestone_summary_by_people';
import MilestoneTagBreakdownChart from './milestone_tag_breakdown_chart';
import MilestoneProgressChart from './milestone_progress_chart';

function MilestoneReports() {
  const { projectId } = useParams();
  const [reportData, setReportData] = useState({
    workTimes: [], workTimesSumByType: {}, workTimesSumByTag: {}, workTimesSumByUser: {},
  });
  const [milestones, setMilestones] = useState([]);
  const [project, setProject] = useState({});
  const [mainChartType, setMainChartType] = useState('progress');
  const [rangeType, setRangeType] = useState('milestone');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [fromDate, setFromDate] = useState(moment().startOf('isoWeek').formatDate());
  const [toDate, setToDate] = useState(moment().endOf('isoWeek').formatDate());
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const prevSelectedMilestoneId = usePrevious(selectedMilestoneId);
  const prevRangeType = usePrevious(rangeType);

  function setChartDates(data) {
    let newFromDate = selectedMilestone?.starts_on;
    let newToDate = selectedMilestone?.ends_on;
    if (data.length > 0) {
      newFromDate = moment(data[0].starts_at);
      newToDate = moment(data[data.length - 1].ends_at);
      newFromDate = newFromDate.isBefore(selectedMilestone.starts_on) ? newFromDate.formatDate() : selectedMilestone.starts_on;
      newToDate = newToDate.isAfter(selectedMilestone.ends_on) ? newToDate.formatDate() : selectedMilestone.ends_on;
    }
    setToDate(newToDate);
    setFromDate(newFromDate);
  }

  function getWorkTimes() {
    const params = rangeType === 'customDates' ? `?from=${fromDate}&to=${toDate}` : `?milestone_id=${selectedMilestoneId}`;

    makeGetRequest({ url: `/api/projects/${projectId}/milestones/work_times${params}` })
      .then((response) => {
        const workTimesSumByType = _(response.data)
          .groupBy('department')
          .mapValues((records) => _.sumBy(records, 'duration'))
          .value();

        const workTimesSumByTag = _(response.data)
          .groupBy('tag')
          .mapValues((records) => _.sumBy(records, 'duration'))
          .value();

        const workTimesSumByUser = _(response.data)
          .groupBy('user_name')
          .mapValues((records) => _.sumBy(records, 'duration'))
          .value();

        if (rangeType !== 'customDates') setChartDates(response.data);

        setReportData({
          workTimes: response.data.reverse(), workTimesSumByType, workTimesSumByTag, workTimesSumByUser,
        });
      });
  }

  function filterResults() {
    let filteredWorkTimes = reportData.workTimes;
    if (selectedDepartment) filteredWorkTimes = filteredWorkTimes.filter((wt) => wt.department === selectedDepartment);
    if (selectedTag) filteredWorkTimes = filteredWorkTimes.filter((wt) => wt.tag === selectedTag);
    if (selectedUser) filteredWorkTimes = filteredWorkTimes.filter((wt) => wt.user_name === selectedUser);

    const workTimesSumByType = _(filteredWorkTimes)
      .groupBy('department')
      .mapValues((records) => _.sumBy(records, 'duration'))
      .value();

    const workTimesSumByTag = _(filteredWorkTimes)
      .groupBy('tag')
      .mapValues((records) => _.sumBy(records, 'duration'))
      .value();

    const workTimesSumByUser = _(filteredWorkTimes)
      .groupBy('user_name')
      .mapValues((records) => _.sumBy(records, 'duration'))
      .value();
    return {
      workTimes: filteredWorkTimes, workTimesSumByType, workTimesSumByTag, workTimesSumByUser,
    };
  }

  const data = (selectedUser || selectedDepartment || selectedTag) ? filterResults() : reportData;

  function getInitialData() {
    const projectPromise = makeGetRequest({ url: `/api/projects/${projectId}` });
    const milestonesPromise = makeGetRequest({ url: `/api/projects/${projectId}/milestones?only_visible=true` });

    return Promise.all([projectPromise, milestonesPromise]).then((values) => {
      const [projectResponse, milestonesResponse] = values;
      const currentMilestone = milestonesResponse.data.find((m) => m.current);

      setProject(projectResponse.data);
      setMilestones(milestonesResponse.data);
      setSelectedMilestone(currentMilestone);
      setSelectedMilestoneId(currentMilestone.id);
    });
  }

  function onMilestoneChange(event) {
    const id = parseInt(event.target.value, 10);
    setSelectedMilestoneId(id);
    setSelectedMilestone(milestones.find((m) => m.id === id));
  }

  function onMainChartTypeChange(event) {
    setMainChartType(event.target.value);
  }

  function onRangeTypeChange(event) {
    setRangeType(event.target.value);
  }

  function renderMilestoneDates(milestone) {
    if (milestone.starts_on && milestone.ends_on) return ` (${I18n.t('common.from')} ${milestone.starts_on} ${I18n.t('common.to')} ${milestone.ends_on})`;
    if (milestone.starts_on && !milestone.ends_on) return ` (${I18n.t('common.from')} ${milestone.starts_on})`;
    return '';
  }

  useEffect(() => {
    getInitialData().then(getWorkTimes);
  }, []);

  useEffect(() => {
    if (prevSelectedMilestoneId) getWorkTimes();
  }, [selectedMilestoneId]);

  useEffect(() => {
    if (prevRangeType) getWorkTimes();
  }, [rangeType, fromDate, toDate]);

  function renderDatesRange() {
    return (
      <div className="col-5">
        <DatePicker
          {...defaultDatePickerProps}
          dateFormat="YYYY-MM-DD"
          selected={moment(fromDate, 'YYYY-MM-DD')}
          value={fromDate}
          name="fromDate"
          placeholderText={I18n.t('common.from')}
          onChange={(date) => setFromDate(date.format('YYYY-MM-DD'))}
        />
        <DatePicker
          {...defaultDatePickerProps}
          dateFormat="YYYY-MM-DD"
          selected={moment(toDate, 'YYYY-MM-DD')}
          value={toDate}
          name="toDate"
          placeholderText={I18n.t('common.from')}
          onChange={(date) => setToDate(date.format('YYYY-MM-DD'))}
        />
      </div>
    );
  }

  function renderMilestones() {
    return (
      <div className="col-5">
        <select className="form-control" value={selectedMilestoneId} name="selectedMilestoneId" onChange={onMilestoneChange}>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.name}
              {renderMilestoneDates(milestone)}
              {(milestone.current && ` - ${I18n.t('apps.milestone_reports.current_milestone')}`)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function handleChartClick(element) {
    /* eslint no-underscore-dangle: 0 */
    const chart = element._chart;
    if (chart.config.data.labels.length === 1) {
      setSelectedTag(null);
    } else {
      setSelectedTag(element._model.label);
    }
  }

  return (
    <div>
      <Helmet>
        <title>
          {[project.name, I18n.t('common.milestone_reports')].join(' - ')}
        </title>
      </Helmet>
      <div className="row mb-3">
        <div className="col-md-8">
          <h1 className="project-title">
            <span
              className="badge badge-secondary project-badge"
              style={{
                backgroundColor: `#${project.color}`,
              }}
            />
            {project.name}
          </h1>
        </div>
      </div>

      <div className="row">
        <div className="col-2">
          <select className="form-control" value={rangeType} name="rangeType" onChange={onRangeTypeChange}>
            <option value="milestone">{I18n.t('apps.milestone_reports.range_type.show_milestone')}</option>
            <option value="customDates">{I18n.t('apps.milestone_reports.range_type.date_range')}</option>
          </select>
        </div>
        {rangeType === 'milestone' && renderMilestones()}
        {rangeType === 'customDates' && renderDatesRange()}
        <div className="col-2">
          <select className="form-control" value={mainChartType} name="mainChartType" onChange={onMainChartTypeChange}>
            <option value="progress">{I18n.t('apps.milestone_reports.type.progress')}</option>
            <option value="tagBreakdown">{I18n.t('apps.milestone_reports.type.tag_breakdown')}</option>
          </select>
        </div>
      </div>

      <div className="row mt-5 row-eq-height">
        <div className="col-md-8">
          {mainChartType === 'tagBreakdown' && (
            <MilestoneTagBreakdownChart
              workTimesSumByTag={data.workTimesSumByTag}
              workTimes={data.workTimes}
            />
          )}
          {mainChartType === 'progress' && (
            <MilestoneProgressChart
              estimateTotal={rangeType === 'customDates' ? null : selectedMilestone?.total_estimate}
              fromDate={fromDate}
              toDate={toDate}
              workTimes={data.workTimes}
            />
          )}
          <div className="mt-2">
            <WorkTimesReportTable
              workTimes={data.workTimes}
            />
          </div>
        </div>
        <div className="col-md-4 milestone-summary">
          <div className="sticky-record">
            <MilestoneSummary
              milestone={rangeType === 'customDates' ? null : selectedMilestone}
              workTimes={data.workTimes}
              workTimesSumByType={data.workTimesSumByType}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
            />
            <MilestonePieChart
              workTimesSumByTag={data.workTimesSumByTag}
              workTimes={data.workTimes}
              handleChartClick={handleChartClick}
            />
            <MilestoneSummaryByPeople
              workTimesSumByUser={data.workTimesSumByUser}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MilestoneReports;

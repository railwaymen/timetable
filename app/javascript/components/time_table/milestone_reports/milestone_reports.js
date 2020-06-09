import _ from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import usePrevious from '@hooks/use_previous';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ProjectWorkTimeEntry from '../projects/project_work_time_entry';
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
  const prevSelectedMilestoneId = usePrevious(selectedMilestoneId);

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

        setReportData({
          workTimes: response.data, workTimesSumByType, workTimesSumByTag, workTimesSumByUser,
        });
      });
  }

  function getProject() {
    makeGetRequest({ url: `/api/projects/${projectId}` })
      .then((response) => {
        setProject(response.data);
      });
  }

  function getMilestones() {
    makeGetRequest({ url: `/api/projects/${projectId}/milestones` })
      .then((response) => {
        const currentMilestone = response.data.find((m) => m.current);
        setMilestones(response.data);
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
    getWorkTimes();
    getProject();
    getMilestones();
  }, []);

  useEffect(() => {
    if (prevSelectedMilestoneId) getWorkTimes();
  }, [selectedMilestoneId]);

  useEffect(() => {
    getWorkTimes();
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

  const groupedWorkTimes = _.groupBy(reportData.workTimes, (workTime) => (
    moment(workTime.starts_at).format('YYYYMMDD')
  ));

  const dayKeys = Object.keys(groupedWorkTimes).sort((l, r) => r.localeCompare(l));

  return (
    <div>
      <Helmet>
        <title>{I18n.t('common.project_milesontes')}</title>
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
              workTimesSumByTag={reportData.workTimesSumByTag}
              workTimes={reportData.workTimes}
            />
          )}
          {mainChartType === 'progress' && (
            <MilestoneProgressChart
              estimateTotal={rangeType === 'customDates' ? null : selectedMilestone?.total_estimate}
              fromDate={rangeType === 'customDates' ? fromDate : selectedMilestone?.starts_on}
              toDate={rangeType === 'customDates' ? toDate : selectedMilestone?.ends_on}
              workTimes={reportData.workTimes}
            />
          )}
          {dayKeys.map((dayKey) => (
            <ProjectWorkTimeEntry
              key={dayKey}
              dayKey={dayKey}
              groupedWorkTimes={groupedWorkTimes}
            />
          ))}
        </div>
        <div className="col-md-4">
          <div className="sticky-record">
            <MilestoneSummary
              milestone={rangeType === 'customDates' ? null : selectedMilestone}
              workTimes={reportData.workTimes}
              workTimesSumByType={reportData.workTimesSumByType}
            />
            <MilestonePieChart workTimesSumByTag={reportData.workTimesSumByTag} workTimes={reportData.workTimes} />
            <MilestoneSummaryByPeople workTimesSumByUser={reportData.workTimesSumByUser} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MilestoneReports;

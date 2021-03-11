import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import moment from 'moment';
import * as Api from '../../shared/api';
import ProjectStats from './project_stats';
import RangeFilter from './range_filter';
import TypeFilter from './type_filter';
import DateRangeFilter from '../../shared/date_range_filter';

function ProjectsRanking() {
  const [projectsStats, setProjectsStats] = useState([]);
  const [range, setRange] = useState('30');
  const [type, setType] = useState('commercial');

  function getProjects() {
    Api.makeGetRequest({ url: `/api/projects/stats?range=${range}&type=${type}` })
      .then((response) => {
        setProjectsStats(response.data);
      });
  }

  function renderGroupedRecords() {
    return _.map(projectsStats, (value) => <ProjectStats stats={value} key={value.id} />);
  }

  useEffect(() => {
    getProjects();
  }, [range, type]);

  return (
    <div>
      <Helmet>
        <title>{I18n.t('common.projects')}</title>
      </Helmet>
      {currentUser.isSuperUser() && <EfficiencyReports />}
      <header className="page-header">
        <div className="clearfix mb-3">
          <div className="btn-group pull-right">
            <NavLink className="btn btn-secondary active" exact to="/projects/ranking">{I18n.t('common.rank')}</NavLink>
            <NavLink className="btn btn-secondary" exact to="/projects/progress">{I18n.t('apps.milestones.progress')}</NavLink>
            <NavLink className="btn btn-secondary" exact to="/projects">{I18n.t('common.all')}</NavLink>
          </div>
          { currentUser.isSuperUser() && (
            <div className="btn-group pull-left">
              <NavLink to="/projects/new" className="btn btn-secondary pull-left">{I18n.t('common.add')}</NavLink>
            </div>
          )}
          <div className="btn-group pull-left">
            <RangeFilter range={range} setRange={setRange} />
          </div>
          <div className="btn-group pull-left">
            <TypeFilter type={type} setType={setType} />
          </div>
        </div>
      </header>
      <div className="row row-eq-height projects-cards">
        { !_.isEmpty(projectsStats) && renderGroupedRecords() }
      </div>
    </div>
  );
}

function EfficiencyReports() {
  const [from, setFrom] = useState(moment().startOf('month').format());
  const [to, setTo] = useState(moment().endOf('month').format());

  const onGenerate = () => {
    const path = `/efficiency_reports?from=${from}&to=${to}`;
    window.open(path, '_blank');
  };

  return (
    <div className="filters-report-efficiency">
      <DateRangeFilter
        from={from}
        to={to}
        title={I18n.t('common.download')}
        onFilter={onGenerate}
        onFromChange={(time) => setFrom(time.format())}
        onToChange={(time) => setTo(time.format())}
      />
    </div>
  );
}

export default ProjectsRanking;

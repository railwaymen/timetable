import React, { useState, useEffect } from 'react';
import Pagination from '@components/shared/pagination';
import { locationParams, replaceLocationParams } from '@components/shared/helpers';
import { Helmet } from 'react-helmet';
import { NavLink } from 'react-router-dom';
import Tag from './tag';

function Tags() {
  const params = locationParams();
  const currentPage = parseInt(params.page, 10) || 1;
  const [page, setPage] = useState(currentPage);
  const [query, setQuery] = useState('');

  const [tags, setTags] = useState({ total_pages: 0, records: [] });
  const [visibility, setVisibility] = useState('active');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);

  function getProjects() {
    fetch('/api/projects/simple')
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
      });
  }

  function getTags() {
    fetch(`/api/tags?page=${page}&filter=${visibility}&query=${query}&project_id=${projectId}`)
      .then((response) => response.json())
      .then((data) => {
        setTags(data);
      });
  }

  useEffect(() => {
    getProjects();
  }, []);

  useEffect(() => {
    getTags();
    replaceLocationParams({ page });
  }, [page, visibility, projectId, query]);

  return (
    <>
      <Helmet>
        <title>{I18n.t('common.tags')}</title>
      </Helmet>
      <div className="input-group mb-3 w-50">
        <div className="input-group-prepend">
          <NavLink className="btn btn-secondary" to="/tags/new">{I18n.t('common.add')}</NavLink>
        </div>
        <select
          name="visibility"
          id="filter"
          className="custom-select"
          onChange={(e) => setVisibility(e.target.value)}
          value={visibility}
        >
          <option value="active">{I18n.t('common.active')}</option>
          <option value="inactive">{I18n.t('common.inactive')}</option>
          <option value="all">{I18n.t('common.all')}</option>
        </select>
        <select
          name="project"
          id="project"
          className="custom-select"
          onChange={(e) => setProjectId(e.target.value)}
          value={projectId}
        >
          <option value="">{I18n.t('common.all')}</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input
          type="text"
          className="form-control"
          placeholder={I18n.t('apps.tags.search')}
          name="query"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th />
            <th>{I18n.t('common.name')}</th>
            <th>{I18n.t('apps.projects.project')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          { tags.records.map((tag) => <Tag key={tag.id} tag={tag} />) }
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} totalPages={tags.total_pages} />
    </>
  );
}

export default Tags;

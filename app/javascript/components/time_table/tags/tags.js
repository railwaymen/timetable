import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { NavLink } from 'react-router-dom';
import Tag from './tag';

function Tags() {
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState('active');

  function getUsers() {
    fetch(`/api/tags?filter=${visibility}`)
      .then((response) => response.json())
      .then((data) => {
        setTags(data);
      });
  }

  useEffect(() => {
    getUsers();
  }, [visibility]);

  return (
    <>
      <Helmet>
        <title>{I18n.t('common.tags')}</title>
      </Helmet>
      <div className="input-group mb-3 w-25">
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
          { tags.map((tag) => <Tag key={tag.id} tag={tag} />) }
        </tbody>
      </table>
    </>
  );
}

export default Tags;

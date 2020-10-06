import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeGetRequest } from '../../shared/api';

function TagFields(props) {
  const {
    tag,
    errors,
    onChange,
    setTag,
  } = props;

  const [availableProjects, setAvailableProjects] = useState([]);

  function getAvailableProjects() {
    makeGetRequest({ url: '/api/projects/list' })
      .then((response) => {
        const projects = response.data.map((project) => (project.name));
        if (tag.project_name.length < 1) setTag({ ...tag, project_name: projects[0] });
        setAvailableProjects(projects);
      });
  }

  useEffect(() => {
    getAvailableProjects();
  }, []);

  function renderProjects() {
    return (
      availableProjects.map((project) => (<option key={project} value={project}>{project}</option>))
    );
  }

  return (
    <div>
      <div className="form-group">
        {errors.name && <div className="error-description">{errors.name.join(', ')}</div>}
        <input
          className={`${errors.name ? 'error' : ''} form-control`}
          type="text"
          name="name"
          placeholder="Name"
          onChange={onChange}
          value={tag.name || ''}
        />
      </div>
      <div className="form-group">
        <label>
          {I18n.t('apps.users.user_active')}
          <input type="checkbox" name="active" checked={tag.active || false} onChange={onChange} />
        </label>
      </div>
      <div className="form-group">
        <select className="form-control" name="project_name" onChange={onChange} value={tag.project_name || ''}>
          {renderProjects()}
        </select>
      </div>
    </div>
  );
}

TagFields.propTypes = {
  tag: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  setTag: PropTypes.func.isRequired,
};

export default TagFields;

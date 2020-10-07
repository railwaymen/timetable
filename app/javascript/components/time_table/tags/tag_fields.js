import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeGetRequest } from '../../shared/api';

function TagFields(props) {
  const {
    tag,
    errors,
    onChange,
  } = props;

  const [availableProjects, setAvailableProjects] = useState([]);

  function getAvailableProjects() {
    makeGetRequest({ url: '/api/projects/list' })
      .then((response) => {
        setAvailableProjects(response.data);
      });
  }

  useEffect(() => {
    getAvailableProjects();
  }, []);

  function renderProjects() {
    return (
      availableProjects.map((project) => (<option key={project.id} value={project.id}>{project.name}</option>))
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
          <input type="checkbox" name="active" checked={tag.active} onChange={onChange} />
        </label>
      </div>
      <div className="form-group">
        <label>
          {I18n.t('apps.tags.global')}
          <input type="checkbox" name="global" checked={tag.global} onChange={onChange} />
        </label>
      </div>
      <div className="form-group">
        <select className="form-control" name="project_id" disabled={tag.global} onChange={onChange} value={tag.project_id}>
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
};

export default TagFields;

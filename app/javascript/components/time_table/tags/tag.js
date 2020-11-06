import React from 'react';
import { NavLink } from 'react-router-dom';

function Tag(props) {
  const {
    name, project_name, id, active, edit,
  } = props.tag;

  function getIconClass() {
    return active ? 'active' : 'inactive';
  }

  return (
    <tr>
      <td><div className={`circle ${getIconClass()}`} /></td>
      <td>{name}</td>
      <td>{project_name}</td>
      <td>
        {!edit
          && (
          <div className="btn-group">
            <NavLink className="btn btn-outline-primary" to={`/tags/edit/${id}`}>
              <i className="fa fa-pencil" />
            </NavLink>
          </div>
          )}
      </td>
    </tr>
  );
}

export default Tag;

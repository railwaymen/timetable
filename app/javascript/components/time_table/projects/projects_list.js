import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api.js';
import { NavLink } from 'react-router-dom';
import Project from './project.js';

class ProjectsList extends React.Component {
  constructor (props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.getProjects = this.getProjects.bind(this);
  }

  componentDidMount () {
    this.getProjects()
  }

  static propTypes = {
    projects: PropTypes.array,
    visible: PropTypes.string
  }

  state = {
    projects: [],
    visible: 'all'
  }

  getProjects () {
    Api.makeGetRequest({ url: `/api/projects/list?display=${this.state.visible}` })
       .then((response) => {
         console.log(response.data);
         this.setState({ projects: response.data });
       })
  }

  onChange (e) {
    this.setState({
      [e.target.name]: [e.target.value]
    }, () => { this.getProjects() })
  }

  render () {
    const { visible, projects } = this.state;

    return (
      <div>
        <div className="ui grid">
          <div className="sixteen wide column">
            <div className="btn-group pull-right">
              <NavLink className="btn btn-default" exact to="/projects">{I18n.t('common.rank')}</NavLink>
              <NavLink className="btn btn-default active" to="/projects/list">{I18n.t('common.all')}</NavLink>
            </div>
            { currentUser.admin ? <NavLink to="/projects/new" className="btn btn-default pull-left">{I18n.t('common.add')}</NavLink> : null }
            <div className="btn-group pull-left">
              <select name="visible" id="filter" className="form-control" onChange={this.onChange} defaultSelected={visible}>
                <option value="active">{I18n.t('apps.projects.filter_active')}</option>
                <option value="inactive">{I18n.t('apps.projects.filter_inactive')}</option>
                <option value="all">{I18n.t('apps.projects.filter_all')}</option>
              </select>
            </div>
          </div>
          <table className="table table-striped">
            <thead>
              <th></th>
              <th>{I18n.t('apps.projects.name')}</th>
              <th>{I18n.t('apps.projects.leader')}</th>
              <th></th>
              <th></th>
            </thead>
            <tbody>
              { projects.map((project, index) => (
                <Project key={`${project.id}/${index}`} project={project} />
              )) }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default ProjectsList;

import React from 'react';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api.js';
import { NavLink, Redirect } from 'react-router-dom';

class EditProject extends React.Component {
  constructor (props) {
    super(props);

    this.getProject = this.getProject.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  static propTypes = {
    project: PropTypes.object,
    users: PropTypes.array
  }

  state = {
    project: {
      id: undefined,
      name: undefined,
      color: '0c0c0c',
      leader_id: '',
      work_times_allows_task: true,
      active: true
    },
    users: [],
    projectId: parseInt(this.props.match.params.id),
    redirectToReferer: undefined
  }

  componentDidMount () {
    this.getProject();

    if (currentUser.admin) {
      this.getUsers();
    }
  }

  getProject () {
    if (this.state.projectId) {
      Api.makeGetRequest({ url: `/api/projects/${this.state.projectId}` })
         .then((response) => {
           let project = response.data;
           if (!project.leader_id) project.leader_id = undefined;

           this.setState({ project: project });
         })
    }
  }

  getUsers () {
    Api.makeGetRequest({ url: '/api/users' })
       .then((response) => {
         this.setState({ users: response.data });
       })
  }

  onChange (e) {
    this.setState({
      project: {
        ...this.state.project,
        [e.target.name]: e.target.value
      }
    })
  }

  onCheckboxChange (e) {
    let project = this.state.project;

    this.setState({
      project: {
        ...project,
        [e.target.name]: !project[e.target.name]
      }
    })
  }

  onSubmit (e) {
    e.preventDefault();
    let project = this.state.project;
    project.color = project.color[0] === '#' ? project.color.substring(1) : project.color;

    if (this.state.projectId) {
      Api.makePutRequest({ url: `/api/projects/${this.state.project.id}`, body: { project: project } })
         .then(() => {
           this.setState({
             redirectToReferer: '/projects/list'
           })
         })
    } else {
      Api.makePostRequest({ url: '/api/projects', body: { project: project } })
         .then(() => {
           this.setState({
             redirectToReferer: '/projects/list'
           })
         })
    }
  }

  _renderPreloader () {
    return (
      <div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
        <div className="form-group">
          <div className="preloader"></div>
        </div>
      </div>
    )
  }

  render () {
    const { project, users, redirectToReferer, projectId } = this.state;

    if (redirectToReferer) return <Redirect to={redirectToReferer} />
    if (!projectId || projectId === project.id ) {
      return (
        <form>
          { currentUser.admin ?
            <div>
              <div className="form-group">
                <input className="form-control" type="text" name="name" placeholder={I18n.t('common.name')} onChange={this.onChange} value={project.name} autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="leader">{I18n.t('apps.projects.leader')}</label>
                <select name="leader_id" id="leader" className="form-control" value={project.leader_id} onChange={this.onChange}>
                  <option value=""></option>
                  { users.map((user, index) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  )) }
                </select>
              </div>
              <div className="form-group">
                <label>
                  {I18n.t('apps.projects.active')}
                  <input type="checkbox" name="active" checked={project.active} onChange={this.onCheckboxChange} />
                </label>
              </div>
            </div>
          : null }
          <div className="form-group"></div>
          <input type="color" name="color" value={((project.color && project.color[0] !== '#') ? '#' : '') + project.color} onChange={this.onChange} />
          <div className="form-group">
            <label>
              {I18n.t('apps.projects.work_times_allows_task')}
              <input type="checkbox" name="work_times_allows_task" checked={project.work_times_allows_task} onChange={this.onCheckboxChange} />
            </label>
          </div>
          <p>
            <NavLink className="btn btn-primary" to={`/projects/${projectId}/external_authorization`}>{I18n.t('common.external_auth')}</NavLink>
          </p>
          <input className="btn btn-default" type="submit" value={I18n.t('common.save')} onClick={this.onSubmit} />
          <NavLink className="btn btn-primary" to="/projects/list">{I18n.t('common.cancel')}</NavLink>
        </form>
      )
    } else {
      return this._renderPreloader()
    }
  }
}

export default EditProject;

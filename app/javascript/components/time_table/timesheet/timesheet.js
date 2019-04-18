import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Entry from './entry';
import EntryHistory from './history/entry_history';
import * as Api from '../../shared/api';

class Timesheet extends React.Component {
  constructor(props) {
    super(props);

    this.pushEntry = this.pushEntry.bind(this);
    this.onCopy = this.onCopy.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.setLastProject = this.setLastProject.bind(this);
  }

  componentDidMount() {
    this.getProjects();
  }

  static propTypes = {
    projects: PropTypes.array,
  }

  state = {
    projects: [],
  }

  pushEntry(object) {
    this.entryHistory.pushEntry(object);
  }

  onCopy(object) {
    this.entry.paste(object);
  }

  getProjects() {
    Api.makeGetRequest({ url: '/api/projects/simple' })
      .then((response) => {
        this.setState({
          projects: response.data,
        });
      });
  }

  setLastProject(project) {
    if (!_.isEmpty(project)) this.entry.paste({ project });
  }

  render() {
    const { projects } = this.state;

    if (projects.length > 0) {
      return (
        <div>
          <Entry ref={(entry) => { this.entry = entry; }} pushEntry={this.pushEntry} projects={projects} />
          <EntryHistory ref={(entryHistory) => { this.entryHistory = entryHistory; }} onCopy={this.onCopy} projects={projects} setLastProject={this.setLastProject} />
        </div>
      );
    }
    return (
      <div />
    );
  }
}

export default Timesheet;

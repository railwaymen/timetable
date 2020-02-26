import React from 'react';
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

    this.state = {
      projects: [],
      tags: [],
      tags_disabled: false,
    };
  }

  componentDidMount() {
    this.getProjects();
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
          projects: response.data.projects,
          tags: response.data.tags,
          tags_disabled: response.data.tags_disabled,
        });
      });
  }

  setLastProject(project) {
    if (!_.isEmpty(project)) this.entry.paste({ project });
  }

  render() {
    const { projects, tags_disabled, tags } = this.state;

    if (projects.length > 0) {
      return (
        <div>
          <Entry ref={(entry) => { this.entry = entry; }} pushEntry={this.pushEntry} projects={projects} tags={tags} tags_disabled={tags_disabled} />
          <EntryHistory
            ref={(entryHistory) => { this.entryHistory = entryHistory; }}
            onCopy={this.onCopy}
            projects={projects}
            setLastProject={this.setLastProject}
            tags_disabled={tags_disabled}
            tags={tags}
          />
        </div>
      );
    }
    return (
      <div />
    );
  }
}

export default Timesheet;

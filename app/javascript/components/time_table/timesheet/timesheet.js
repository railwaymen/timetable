import React from 'react';
import { Helmet } from 'react-helmet';
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
    this.lockRequests = this.lockRequests.bind(this);

    this.state = {
      projects: [],
      tags: [],
      requestsLocked: false,
    };
  }

  componentDidMount() {
    this.getProjects();
    this.getTags();
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

  getTags() {
    Api.makeGetRequest({ url: '/api/projects/tags' })
      .then((response) => {
        this.setState({
          tags: response.data,
        });
      });
  }

  setLastProject(project) {
    if (!_.isEmpty(project)) this.entry.paste({ project });
  }

  pushEntry(object) {
    this.entryHistory.pushEntry(object);
  }

  lockRequests(requestsLocked) {
    return new Promise((resolve) => {
      this.setState({ requestsLocked }, () => {
        resolve();
      });
    });
  }

  render() {
    const { projects, tags, requestsLocked } = this.state;
    const projectsForEntries = projects.filter((project) => !project.accounting);

    if (projects.length > 0) {
      return (
        <>
          <Helmet>
            <title>{I18n.t('common.timesheet')}</title>
          </Helmet>
          <Entry
            ref={(entry) => { this.entry = entry; }}
            pushEntry={this.pushEntry}
            projects={projectsForEntries}
            tags={tags}
            lockRequests={this.lockRequests}
            requestsLocked={requestsLocked}
          />
          <EntryHistory
            ref={(entryHistory) => { this.entryHistory = entryHistory; }}
            onCopy={this.onCopy}
            projects={projects}
            setLastProject={this.setLastProject}
            tags={tags}
            lockRequests={this.lockRequests}
            requestsLocked={requestsLocked}
          />
        </>
      );
    }
    return (
      <div />
    );
  }
}

export default Timesheet;

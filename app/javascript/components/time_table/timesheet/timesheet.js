import React from 'react';
import { Helmet } from 'react-helmet';
import Entry from './entry';
import EntryHistory from './history/entry_history';
import * as Api from '../../shared/api';
import ColorizeHelper from '../../../helpers/colorize_helper';

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
      lastProject: null,
      tags: [],
      requestsLocked: false,
      globalTags: [],
    };
  }

  componentDidMount() {
    this.getProjects();
  }

  onCopy(object) {
    this.entry.paste(object);
  }

  getProjects() {
    Api.makeGetRequest({ url: '/api/projects/with_tags' })
      .then((response) => {
        this.setState({
          projects: response.data.projects,
          globalTags: ColorizeHelper.colorizeArray(response.data.global_tags),
        });
      });
  }

  setLastProject(project) {
    if (!this.state.lastProject) {
      this.setState({ lastProject: project });
      this.entry.paste({ project });
    }
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
    const {
      projects, globalTags, tags, requestsLocked,
    } = this.state;
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
            globalTags={globalTags}
          />
          <EntryHistory
            ref={(entryHistory) => { this.entryHistory = entryHistory; }}
            onCopy={this.onCopy}
            projects={projects}
            setLastProject={this.setLastProject}
            tags={tags}
            lockRequests={this.lockRequests}
            requestsLocked={requestsLocked}
            globalTags={globalTags}
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

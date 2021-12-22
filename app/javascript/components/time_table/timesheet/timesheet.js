import React from 'react';
import { Helmet } from 'react-helmet';
import Entry from './entry';
import EntryHistory from './history/entry_history';
import * as Api from '../../shared/api';

class Timesheet extends React.Component {
  constructor(props) {
    super(props);

    this.pushEntry = this.pushEntry.bind(this);
    this.onCopy = this.onCopy.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.setOfficeWorkStatus = this.setOfficeWorkStatus.bind(this);
    this.lockRequests = this.lockRequests.bind(this);
    this.setLastWorkTime = this.setLastWorkTime.bind(this);

    this.state = {
      projects: [],
      lastProject: null,
      tags: [],
      requestsLocked: false,
      globalTags: [],
      lastWork: null,
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
          globalTags: response.data.global_tags,
        });
      });
  }

  setOfficeWorkStatus(officeWork) {
    if (!this.state.officeWork) {
      this.setState({ officeWork });
      //
    }
  }

  setLastWorkTime(lastWork) {
    if (!this.state.lastWork) {
      this.setState({ lastWork });
      this.entry.paste(lastWork);
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
            setOfficeWorkStatus={this.setOfficeWorkStatus}
            tags={tags}
            lockRequests={this.lockRequests}
            requestsLocked={requestsLocked}
            globalTags={globalTags}
            setLastWorkTime={this.setLastWorkTime}
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

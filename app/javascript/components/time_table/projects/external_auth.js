import React from 'react';
import PropTypes from 'prop-types';
import * as Api from '../../shared/api.js';
import { NavLink, Redirect } from 'react-router-dom';

class ExternalAuth extends React.Component {
  constructor (props) {
    super(props);
    this.onDomainChange = this.onDomainChange.bind(this);
    this.getAuthLink = this.getAuthLink.bind(this);
    this.onTokenChange = this.onTokenChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  state = {
    project: {
    },
    publicKey: '',
    auth: {},
    authorizationUrl: '',
    domain: '',
    token: '',
    requestData: undefined,
    projectId: parseInt(this.props.match.params.id),
    redirectToReferer: undefined
  };

  componentDidMount () {
    this.getProject();
  }

  getProject () {
    if (this.state.projectId) {
      Api.makeGetRequest({ url: `/api/projects/${this.state.projectId}/external_auth` })
         .then((response) => {
           const { project, auth, public_key} = response.data;
           if (!project.leader_id) project.leader_id = undefined;

           this.setState({ project, auth, publicKey: public_key });
         })
    }
  }

  getAuthLink () {
      Api.makeGetRequest({ url: `/api/external_auths/new?domain=${encodeURI(this.state.domain)}&provider=jira` })
        .then((response) => {
          const { authorization_url, request_data } = response.data;
          this.setState({ authorizationUrl: authorization_url, requestData: request_data });
        })
  }

  onDomainChange (e) {
    const domain = e.target.value;
    this.setState({ domain })
  }

  onTokenChange (e) {
    const token = e.target.value;
    this.setState({ token })
  }

  onSubmit (e) {
    e.preventDefault()
    const { domain, token } = this.state;
    const authorization_url = this.state.authorizationUrl;
    const request_data = this.state.requestData;
    const project_id = this.state.projectId;
    const provider = 'jira';
    Api.makePostRequest({ url: "/api/external_auths", body: { external_auth: { domain, token, authorization_url, provider, request_data, project_id } } })
        .then((response) => {
          this.setState({ auth: response.data })
        }).catch((error) => {
          alert("Error during authorization")
        })

  }

  onDelete (e) {
    e.preventDefault();
    Api.makeDeleteRequest({ url: `/api/external_auths/${this.state.auth.id}`})
        .then(() => {
          this.setState({ auth: undefined })
        })
  }

  render () {
    const { redirectToReferer, projectId } = this.state;

    if (redirectToReferer) return <Redirect to={redirectToReferer} />
    return (
      <div>
        {this._renderPublicKey()}
        {this._renderAuth()}
        <NavLink className="btn btn-primary" to={`/projects/${projectId}/edit`}>{I18n.t('common.cancel')}</NavLink>
      </div>
    )
  }

  _renderPublicKey () {
    if (!this.state.publicKey || this.state.auth)
      return null;
    return (
      [
        <p key={0}>Public key:</p>,
        <pre key={1}>
          {this.state.publicKey}
        </pre>
      ]
    );
  }

  _renderAuth () {
    if (this.state.auth) {
      return (
        <div>
          <p>
             {`${I18n.t('apps.external_auths.authorized')} ${this.state.auth.provider}`}
          </p>
          <p>
            <a className="btn btn-danger" onClick={this.onDelete}>{I18n.t('common.destroy')}</a>
          </p>
        </div>
      );
    }
    return (
      <div>
        <h3>New auth</h3>
        <input placeholder="Domain" value={this.state.domain} onChange={this.onDomainChange}></input>
        <button onClick={this.getAuthLink}>Generate link</button>
        {this.state.authorizationUrl && <p><a className="btn btn-primary" href={this.state.authorizationUrl} target="_blank" rel="noopener noreferrer">Click to authorize</a></p>}
        {this.state.authorizationUrl &&
          <form>
            <div className="form-group">
              <input value={this.state.token} placeholder="oAuth token" onChange={this.onTokenChange}></input> 
            </div>
            <div className="form-group">
              <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={this.onSubmit} />
            </div>
          </form>
        }
      </div>
    )
  }
}

export default ExternalAuth;

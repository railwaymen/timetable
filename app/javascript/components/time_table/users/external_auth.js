import React from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import * as Api from '../../shared/api';

class ExternalAuth extends React.Component {
  constructor(props) {
    super(props);
    this.onDomainChange = this.onDomainChange.bind(this);
    this.getAuthLink = this.getAuthLink.bind(this);
    this.onTokenChange = this.onTokenChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.state = {
      authorizationUrl: '',
      domain: '',
      token: '',
      userId: parseInt(this.props.match.params.id, 10),
      requestData: undefined,
      redirectToReferer: undefined,
    };
  }

  componentDidMount() {
    this.getUser();
  }

  getUser() {
    Api.makeGetRequest({ url: `/api/users/${this.state.userId}` })
      .then((response) => {
        this.setState({ externalAuth: response.data.external_auth });
      });
  }

  getAuthLink() {
    Api.makeGetRequest({ url: `/api/external_auths/new?domain=${encodeURI(this.state.domain)}&provider=jira` })
      .then((response) => {
        const { authorization_url, request_data } = response.data;
        this.setState({ authorizationUrl: authorization_url, requestData: request_data });
      });
  }

  onDomainChange(e) {
    const domain = e.target.value;
    this.setState({ domain });
  }

  onTokenChange(e) {
    const token = e.target.value;
    this.setState({ token });
  }

  onSubmit(e) {
    e.preventDefault();
    const { domain, token } = this.state;
    const authorization_url = this.state.authorizationUrl;
    const request_data = this.state.requestData;
    const project_id = this.state.projectId;
    const provider = 'jira';

    Api.makePostRequest({
      url: '/api/external_auths',
      body: {
        external_auth: {
          domain, token, authorization_url, provider, request_data, project_id,
        },
      },
    }).then((response) => {
      this.setState({ externalAuth: response.data });
    }).catch(() => {
      // eslint-disable-next-line no-alert
      alert(I18n.t('activerecord.errors.models.external_auth.basic'));
    });
  }

  onDelete(e) {
    e.preventDefault();
    Api.makeDeleteRequest({ url: `/api/external_auths/${this.state.externalAuth.id}` })
      .then(() => {
        this.setState({ externalAuth: undefined });
      });
  }

  render() {
    const { redirectToReferer, userId } = this.state;

    if (redirectToReferer) return <Redirect to={redirectToReferer} />;
    return (
      <div>
        {this.renderAuth()}
        <NavLink className="btn btn-primary" to={`/users/${userId}/edit`}>{I18n.t('common.cancel')}</NavLink>
      </div>
    );
  }

  renderAuth() {
    if (this.state.externalAuth) {
      return (
        <div>
          <p>{I18n.t('apps.external_auths.authorized')}</p>
          {this.state.externalAuth.provider}
          <a className="btn btn-danger" onClick={this.onDelete}>{I18n.t('common.destroy')}</a>
        </div>
      );
    }
    return (
      <div>
        <h3>{I18n.t('apps.external_auths.new')}</h3>
        <input placeholder={I18n.t('apps.external_auths.domain')} value={this.state.domain} onChange={this.onDomainChange} />
        <button onClick={this.getAuthLink} type="button">{I18n.t('apps.external_auths.generate_link')}</button>
        {this.state.authorizationUrl && (
          <p>
            <a className="btn btn-primary" href={this.state.authorizationUrl} target="_blank" rel="noopener noreferrer">{I18n.t('apps.external_auths.follow_link')}</a>
          </p>
        )}
        {this.state.authorizationUrl && (
          <form>
            <div className="form-group">
              <input value={this.state.token} placeholder={I18n.t('apps.external_auths.token')} onChange={this.onTokenChange} />
            </div>
            <div className="form-group">
              <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={this.onSubmit} />
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default ExternalAuth;

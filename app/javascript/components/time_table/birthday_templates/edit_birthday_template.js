import React from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Api from '../../shared/api';
import translateErrors from '../../shared/translate_errors';
import { unnullifyFields } from '../../shared/helpers';

class EditBirthdayTemplate extends React.Component {
  constructor(props) {
    super(props);

    this.getBirthdayTemplate = this.getBirthdayTemplate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fetchPreview = this.fetchPreview.bind(this);
    this.birthdayTemplatePreview = this.birthdayTemplatePreview.bind(this);
    this.onSubmitAndPreview = this.onSubmitAndPreview.bind(this);
    this.catchErrors = this.catchErrors.bind(this);

    this.state = {
      birthdayTemplate: {},
      birthdayTemplateId: parseInt(this.props.match.params.id, 10),
      redirectToReferer: undefined,
      errors: {},
    };
  }

  componentDidMount() {
    this.getBirthdayTemplate();
    if (this.state.birthdayTemplateId) this.fetchPreview();
  }

  getBirthdayTemplate() {
    const { birthdayTemplateId } = this.state;
    if (birthdayTemplateId) {
      Api.makeGetRequest({
        url: `/api/birthday_email_templates/${birthdayTemplateId}`,
      }).then((response) => {
        const birthdayTemplate = unnullifyFields(response.data);
        this.setState({
          birthdayTemplate,
        });
      });
    }
  }

  onChange(e) {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      birthdayTemplate: {
        ...prevState.birthdayTemplate,
        [name]: value,
      },
    }), () => {
      this.setState(({ errors }) => {
        delete errors[name];
        return { errors };
      });
    });
  }

  onSubmitAndPreview() {
    const { birthdayTemplate, birthdayTemplateId } = this.state;
    if (birthdayTemplateId) {
      Api.makePutRequest({
        url: `/api/birthday_email_templates/${birthdayTemplateId}`,
        body: { birthday_email_template: birthdayTemplate },
      }).then(this.fetchPreview)
        .catch((e) => {
          this.catchErrors(e);
        });
    } else {
      Api.makePostRequest({
        url: '/api/birthday_email_templates',
        body: { birthday_email_template: birthdayTemplate },
      }).then((response) => {
        this.setState({ birthdayTemplateId: response.data.id });
      }).then(this.fetchPreview)
        .catch((e) => {
          this.catchErrors(e);
        });
    }
  }

  fetchPreview() {
    const { birthdayTemplateId } = this.state;
    const url = `/rails/mailers/birthday_mailer/send_birthday_email.html?birthday_email_template_id=${birthdayTemplateId}&part=text%2Fhtml`;
    fetch(url)
      .then((response) => response.text()).then((html) => {
        this.setState({
          birthdayTemplatePreview: html,
        });
      });
  }

  onSubmit() {
    const { birthdayTemplate, birthdayTemplateId } = this.state;
    if (birthdayTemplateId) {
      Api.makePutRequest({
        url: `/api/birthday_email_templates/${birthdayTemplateId}`,
        body: birthdayTemplate,
      }).then(() => {
        this.setState({
          redirectToReferer: '/birthday_templates',
        });
      }).catch((e) => {
        this.catchErrors(e);
      });
    } else {
      Api.makePostRequest({
        url: '/api/birthday_email_templates',
        body: birthdayTemplate,
      }).then(() => {
        this.setState({
          redirectToReferer: '/birthday_templates',
        });
      }).catch((e) => {
        this.catchErrors(e);
      });
    }
  }

  catchErrors(e) {
    this.setState({ errors: translateErrors('birthday_email_template', e.errors) });
  }

  birthdayTemplatePreview() {
    return { __html: this.state.birthdayTemplatePreview };
  }

  renderErrorTooltip(errors) {
    return (
      <div className="error-tooltip birthday-error">
        <ul>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const {
      birthdayTemplate, birthdayTemplatePreview, redirectToReferer, errors,
    } = this.state;
    if (redirectToReferer) { return (<Redirect to={redirectToReferer} />); }
    return (
      <div>
        <Helmet>
          {birthdayTemplate.id ? (
            <title>{I18n.t('apps.birthday_templates.edit')}</title>
          ) : (
            <title>{I18n.t('apps.birthday_templates.new')}</title>
          )}
        </Helmet>
        <div className="birthday-template-form">
          <div className="form-group">
            {errors.name && this.renderErrorTooltip(errors.name)}
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder={I18n.t('common.name')}
              onChange={this.onChange}
              value={birthdayTemplate.name || ''}
            />
          </div>
          <div className="form-group">
            {errors.title && this.renderErrorTooltip(errors.title)}
            <input
              className="form-control"
              type="text"
              name="title"
              placeholder={I18n.t('common.title')}
              onChange={this.onChange}
              value={birthdayTemplate.title || ''}
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-control"
              name="header"
              rows="3"
              placeholder={I18n.t('apps.birthday_templates.email_header')}
              onChange={this.onChange}
              value={birthdayTemplate.header || ''}
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-control"
              name="body"
              rows="5"
              placeholder={I18n.t('apps.birthday_templates.email_content')}
              onChange={this.onChange}
              value={birthdayTemplate.body || ''}
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-control"
              name="bottom"
              rows="3"
              placeholder={I18n.t('apps.birthday_templates.email_bottom')}
              onChange={this.onChange}
              value={birthdayTemplate.bottom || ''}
            />
          </div>
          <NavLink activeClassName="" className="btn btn-default" to="/birthday_templates">{I18n.t('common.cancel')}</NavLink>
          <div className="btn btn-primary" onClick={this.onSubmitAndPreview}>{I18n.t('apps.birthday_templates.save_and_preview')}</div>
          <div className="btn btn-primary" value={I18n.t('common.save')} onClick={this.onSubmit}>{I18n.t('common.save')}</div>
        </div>
        <iframe title="preview" width="100%" height="400" frameBorder="0" srcDoc={birthdayTemplatePreview} />
      </div>
    );
  }
}

export default EditBirthdayTemplate;

import React from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import * as Api from '../../shared/api';
import { unnullifyFields } from '../../shared/helpers';

class EditBirthdayTemplate extends React.Component {
  constructor(props) {
    super(props);

    this.getBirthdayTemplate = this.getBirthdayTemplate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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

  onSubmit() {
    const { birthdayTemplate, birthdayTemplateId } = this.state;
    if (birthdayTemplateId) {
      Api.makePutRequest({
        url: `/api/birthday_email_templates/${birthdayTemplateId}`,
        body: { birthday_email_template: birthdayTemplate },
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
        body: { birthday_email_template: birthdayTemplate },
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
    if (e.errors && (e.errors.body || e.errors.name || e.errors.title)) {
      const newErrors = {};
      if (e.errors.body) newErrors.body = e.errors.body;
      if (e.errors.name) newErrors.name = e.errors.name;
      if (e.errors.title) newErrors.title = e.errors.title;
      this.setState({ errors: newErrors });
    }
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
    const { birthdayTemplate, redirectToReferer, errors } = this.state;
    if (redirectToReferer) { return (<Redirect to={redirectToReferer} />); }
    return (
      <div>
        <div className="birthday-template-form">
          <div className="form-group">
            {errors.name ? this.renderErrorTooltip(errors.name) : null}
            <input className="form-control" type="text" name="name" placeholder={I18n.t('common.name')} onChange={this.onChange} value={birthdayTemplate.name || ''} />
          </div>
          <div className="form-group">
            {errors.title ? this.renderErrorTooltip(errors.title) : null}
            <input className="form-control" type="text" name="title" placeholder={I18n.t('common.title')} onChange={this.onChange} value={birthdayTemplate.title || ''} />
          </div>
          <div className="form-group">
            {errors.body ? this.renderErrorTooltip(errors.body) : null}
            <textarea className="form-control" name="body" placeholder={I18n.t('apps.birthday_templates.email_content')} onChange={this.onChange} value={birthdayTemplate.body || ''} />
          </div>
          <NavLink activeClassName="" className="btn btn-default" to="/birthday_templates">{I18n.t('common.cancel')}</NavLink>
          <div className="btn btn-primary" value={I18n.t('common.save')} onClick={this.onSubmit}>{I18n.t('common.save')}</div>
        </div>
        <div className="birthday-template-preview">
          <div className="email-title">
            <strong>
              {`${I18n.t('common.title')}: `}
            </strong>
            <span>{birthdayTemplate.title}</span>
          </div>
          <div className="email-body">
            {birthdayTemplate.body}
          </div>
        </div>
      </div>
    );
  }
}

export default EditBirthdayTemplate;

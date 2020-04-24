import React from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Api from '../../shared/api';
import BirthdayTemplate from './birthday_template';
import IncomingBirthdays from './incoming_birthdays';

class BirthdayTemplates extends React.Component {
  constructor(props) {
    super(props);

    this.getBirthdayTemplates = this.getBirthdayTemplates.bind(this);

    this.state = {
      birthdayTemplates: [],
    };
  }

  componentDidMount() {
    this.getBirthdayTemplates();
  }

  getBirthdayTemplates() {
    Api.makeGetRequest({
      url: '/api/birthday_email_templates',
    }).then((response) => {
      this.setState({
        birthdayTemplates: response.data,
      });
    });
  }

  render() {
    const { birthdayTemplates } = this.state;
    return (
      <div className="birthday-templates">
        <Helmet>
          <title>{I18n.t('common.birthday_templates')}</title>
        </Helmet>
        <IncomingBirthdays />
        <div className="actions pull-left">
          <div className="disabled-button-wrapper" data-toggle="tooltip" data-placement="right" title="button_disabled_tooltip">
            <NavLink className="btn btn-secondary" to="/birthday_templates/new">{I18n.t('common.add')}</NavLink>
          </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{I18n.t('apps.birthday_templates.last_used')}</th>
              <th>{I18n.t('common.name')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            { birthdayTemplates.map((birthdayTemplate) => (
              <BirthdayTemplate key={birthdayTemplate.id} birthdayTemplate={birthdayTemplate} getBirthdayTemplates={this.getBirthdayTemplates} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default BirthdayTemplates;

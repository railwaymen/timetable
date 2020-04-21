import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Api from '../../shared/api';

class BirthdayTemplate extends React.Component {
  constructor(props) {
    super(props);

    this.onTrashClick = this.onTrashClick.bind(this);
    this.onLastUsedClick = this.onLastUsedClick.bind(this);
  }

  onTrashClick() {
    const { birthdayTemplate } = this.props;
    if (window.confirm(I18n.t('common.confirm'))) {
      Api.makeDeleteRequest({
        url: `/api/birthday_email_templates/${birthdayTemplate.id}`,
      }).then(() => {
        this.props.getBirthdayTemplates();
      });
    }
  }

  onLastUsedClick() {
    const { birthdayTemplate } = this.props;
    Api.makePutRequest({
      url: `/api/birthday_email_templates/${birthdayTemplate.id}/set_last_used`,
    }).then(() => {
      this.props.getBirthdayTemplates();
    });
  }

  render() {
    const { birthdayTemplate } = this.props;
    let circleColor = 'not-last-used';
    let disabled = '';
    if (birthdayTemplate.last_used) { circleColor = 'last-used'; disabled = 'disabled'; }

    return (
      <tr>
        <td style={{ width: '100px' }}><div className={`circle ${circleColor}`} /></td>
        <td>{birthdayTemplate.name}</td>
        <td>
          <div className="actions">
            <NavLink className="ui button icon basic blue" to={`/birthday_templates/edit/${birthdayTemplate.id}`}>
              <i className="icon pencil" />
            </NavLink>
            <div className={`ui button icon basic blue ${disabled}`} onClick={this.onLastUsedClick}>
              {I18n.t('apps.birthday_templates.set_as_last_used')}
            </div>
            <div className="ui button icon basic red" onClick={this.onTrashClick}>
              <i className="icon trash" />
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

export default BirthdayTemplate;

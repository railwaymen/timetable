import React from 'react';
import * as Api from '../../shared/api';

class IncomingBirthdays extends React.Component {
  constructor(props) {
    super(props);

    this.getIncomingBirthdays = this.getIncomingBirthdays.bind(this);
  }

  state = {
    incomingBirthdays: [],
  }

  componentDidMount() {
    this.getIncomingBirthdays();
  }

  getIncomingBirthdays() {
    Api.makeGetRequest({
      url: '/api/users/incoming_birthdays',
    }).then((response) => {
      this.setState({
        incomingBirthdays: response.data.incoming_birthdays,
      });
    });
  }

  renderIncomingBirthday(incomingBirthday) {
    return (
      <div key={incomingBirthday.id}>
        <span>
          {`${incomingBirthday.user_full_name}: `}
        </span>
        {incomingBirthday.birthday_date}
      </div>
    );
  }

  render() {
    const { incomingBirthdays } = this.state;
    return (
      <div className="incoming-birthdays">
        {I18n.t('apps.birthday_templates.incoming_birthdays')}
        <div className="incoming-birthdays-list">
          {incomingBirthdays.map((incomingBirthday) => (this.renderIncomingBirthday(incomingBirthday)))}
        </div>
      </div>
    );
  }
}

export default IncomingBirthdays;

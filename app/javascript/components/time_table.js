import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from './shared/navbar.js';

import Users from './time_table/users.js';
import Projects from './time_table/projects.js';

class TimeTable extends React.Component {
  render () {
    return (
      <BrowserRouter>
        <div className="app container">
          <Navbar />
          <div className="content">
            <Route path='/users'    component={Users} />
            <Route path='/projects' component={Projects} />
          </div>
        </div>
      </BrowserRouter>
    )
  }
}

export default TimeTable;

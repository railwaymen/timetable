import React, { useState, useEffect } from 'react';
import URI from 'urijs';
import _ from 'lodash';
import moment from 'moment';
import * as Api from '../../../shared/api';

function SearchBox(props) {
  const {
    setWorkHoursAfterSearch, from, selectedProject, getWorkHours,
  } = props;
  const [searchQuery, setSearchQuery] = useState('');

  function getWorkTimes(query) {
    if (query) {
      const linkParams = URI(window.location.href).search(true);
      const { user_id } = linkParams;
      const prepareParams = {
        user_id, query,
      };

      const url = URI('/api/work_times/search')
        .addSearch(prepareParams);

      Api.makeGetRequest({ url })
        .then((response) => {
          if (!prepareParams) prepareParams.delete('user_id');
          setWorkHoursAfterSearch(response.data, prepareParams);
        });
    }
  }

  function removeQueryFromUri() {
    const newPath = URI(window.location.href)
      .removeSearch('query');

    window.history.pushState('Timetable', 'Reports', newPath);
  }

  useEffect(() => {
    const linkParams = URI(window.location.href).search(true);
    const linkQuery = linkParams.query;
    if (linkQuery) {
      setSearchQuery(linkQuery);
      getWorkTimes(linkQuery);
    }
  }, []);

  useEffect(() => {
    if (!_.isEmpty(selectedProject)) {
      removeQueryFromUri();
      setSearchQuery('');
    }
  }, [selectedProject, from]);

  function onSearchClick() {
    if (searchQuery) {
      getWorkTimes(searchQuery);
    } else {
      removeQueryFromUri();
      getWorkHours({ from: moment().startOf('month').format(), to: moment().endOf('month').format() });
    }
  }

  function onKeyPress(e) {
    if (e.which === 13) { onSearchClick(); }
  }

  function onInputChange(e) {
    if (!e.target.value) {
      removeQueryFromUri();
      getWorkHours({ from: moment().startOf('month').format(), to: moment().endOf('month').format() });
    }

    setSearchQuery(e.target.value);
  }

  return (
    <div className="search-box">
      <input
        className="h-100"
        name="search-input"
        placeholder="Search among work times"
        onKeyPress={onKeyPress}
        onChange={onInputChange}
        value={searchQuery}
      />
      <div className="h-100 btn btn-outline-info fa fa-search" style={{ marginBottom: '2px' }} onClick={onSearchClick} />
    </div>
  );
}

export default SearchBox;

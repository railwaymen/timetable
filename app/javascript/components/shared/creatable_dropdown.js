import React, { useState, useEffect, useRef } from 'react';

function CreatableDropdown({ options, onSelectOption, onCreateOption }) {
  const [filter, setFilter] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isExpanded, setIsExpaned] = useState(false);
  const [showCreatableOption, setShowCreatableOption] = useState(false);

  const searchRef = useRef(null);

  const handleSearchChange = (e) => {
    const filterNewValue = e.target.value;

    setFilter(filterNewValue);

    if (filterNewValue.length === 0 || options.find((option) => option === filterNewValue)) {
      setShowCreatableOption(false);
    } else {
      setShowCreatableOption(true);
    }
  };

  const selectOption = (createOption, option) => {
    if (createOption) {
      setSelectedOption(filter);
      onCreateOption(filter);
    } else {
      setSelectedOption(option);
      onSelectOption(option);
    }

    setFilter('');
    setIsExpaned(false);
  };

  const filteredOptions = () => options.filter((option) => option.includes(filter));

  const handleClick = (e) => {
    if (e && e.target === searchRef.current) {
      return;
    }

    setIsExpaned(false);
  };

  const handleSearchInputEnterDown = (e) => {
    if (e.key !== 'Enter' || filteredOptions().length === 0) {
      return;
    }

    selectOption(false, filteredOptions()[0]);
  };

  const handleSelectOption = (e, createOption, option) => {
    if (e.type === 'keypress') {
      if (e.key !== 'Enter' || e.key !== 'Spacebar') {
        return;
      }
    }

    selectOption(createOption, option);
  };

  useEffect(() => {
    const listener = document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', listener);
    };
  }, []);

  return (
    <div className="dropdown">
      <input
        className="form-control input-search"
        name="filter"
        id="search-input"
        autoComplete="off"
        tabIndex="0"
        value={filter}
        onChange={handleSearchChange}
        ref={searchRef}
        onFocus={() => setIsExpaned(true)}
        onKeyPress={handleSearchInputEnterDown}
      />
      <div className={`text active ${(isExpanded ? 'hidden' : '')}`} onClick={() => setIsExpaned(true)}>
        {selectedOption}
      </div>
      { isExpanded && (
        <div className="dropdown-menu show p-0" tabIndex="-1">
          { filteredOptions().map((option) => (
            <button
              type="button"
              tabIndex="0"
              className="dropdown-item object"
              key={option}
              onClick={(e) => handleSelectOption(e, false, option)}
              onKeyPress={(e) => handleSelectOption(e, false, option)}
            >
              {option}
            </button>
          ))}
          { showCreatableOption && (
          <button
            type="button"
            tabIndex="0"
            className="dropdown-item object"
            onClick={(e) => handleSelectOption(e, true)}
            onKeyPress={(e) => handleSelectOption(e, true)}
          >
            New project:
            {' '}
            {filter}
          </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CreatableDropdown;

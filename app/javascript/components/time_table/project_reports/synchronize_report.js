import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeGetRequest } from '../../shared/api';

function SynchronizeReport(props) {
  const { url } = props;
  const [synchronize, setSynchronize] = useState(null);

  function onSynchronize(e) {
    e.preventDefault();

    makeGetRequest({ url }).then((response) => {
      setSynchronize(response.data.synchronized);
    });
  }

  function synchronizedIcon() {
    if (synchronize) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#27AE60" />
          {/* eslint-disable-next-line max-len */}
          <path d="M9.59629 14.906L6.99379 12.3035C6.85367 12.1631 6.66343 12.0842 6.46504 12.0842C6.26666 12.0842 6.07642 12.1631 5.93629 12.3035C5.64379 12.596 5.64379 13.0685 5.93629 13.361L9.07129 16.496C9.36379 16.7885 9.83629 16.7885 10.1288 16.496L18.0638 8.56104C18.3563 8.26854 18.3563 7.79604 18.0638 7.50354C17.9237 7.3631 17.7334 7.28418 17.535 7.28418C17.3367 7.28418 17.1464 7.3631 17.0063 7.50354L9.59629 14.906Z" fill="#FFFDFD" />
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="icon/alert/notification_important_24px">
          {/* eslint-disable-next-line max-len */}
          <path id="icon/alert/notification_important_24px_2" fillRule="evenodd" clipRule="evenodd" d="M19.0002 16.75L20.2902 18.04C20.9202 18.67 20.4802 19.75 19.5802 19.75H4.41017C3.52017 19.75 3.08017 18.67 3.71017 18.04L5.00017 16.75V10.75C5.00017 7.4 7.36017 4.6 10.5002 3.92V2.75C10.5002 1.92 11.1702 1.25 12.0002 1.25C12.8302 1.25 13.5002 1.92 13.5002 2.75V3.92C16.6402 4.6 19.0002 7.4 19.0002 10.75V16.75ZM13.9902 20.76C13.9902 21.86 13.1002 22.75 12.0002 22.75C10.9002 22.75 10.0102 21.86 10.0102 20.76H13.9902ZM11.0002 15.75V13.75H13.0002V15.75H11.0002ZM12.0002 11.75C12.5502 11.75 13.0002 11.3 13.0002 10.75V8.75C13.0002 8.2 12.5502 7.75 12.0002 7.75C11.4502 7.75 11.0002 8.2 11.0002 8.75V10.75C11.0002 11.3 11.4502 11.75 12.0002 11.75Z" fill="#D64E2B" />
        </g>
      </svg>
    );
  }

  function checkSychrnonization() {
    return (
      <a onClick={onSynchronize}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#333333" />
          {/* eslint-disable-next-line max-len */}
          <path fillRule="evenodd" clipRule="evenodd" d="M12 4.6574V5.9999C15.315 5.9999 18 8.6849 18 11.9999C18 12.7799 17.85 13.5299 17.5725 14.2124C17.37 14.7149 16.725 14.8499 16.3425 14.4674C16.14 14.2649 16.0575 13.9574 16.17 13.6874C16.3875 13.1699 16.5 12.5924 16.5 11.9999C16.5 9.5174 14.4825 7.4999 12 7.4999V8.8424C12 9.1799 11.595 9.3449 11.355 9.1124L9.26251 7.0199C9.11251 6.8699 9.11251 6.6374 9.26251 6.4874L11.3625 4.3949C11.595 4.1549 12 4.3199 12 4.6574ZM7.5 11.9999C7.5 14.4824 9.5175 16.4999 12 16.4999V15.1574C12 14.8199 12.405 14.6549 12.6375 14.8874L14.73 16.9799C14.88 17.1299 14.88 17.3624 14.73 17.5124L12.6375 19.6049C12.405 19.8449 12 19.6799 12 19.3424V17.9999C8.685 17.9999 6 15.3149 6 11.9999C6 11.2199 6.15 10.4699 6.4275 9.78735C6.63 9.28485 7.275 9.14985 7.6575 9.53235C7.86 9.73485 7.9425 10.0424 7.83 10.3124C7.6125 10.8299 7.5 11.4074 7.5 11.9999Z" fill="#FFFDFD" />
        </svg>
      </a>
    );
  }

  return (
    <div>
      {synchronize === null ? checkSychrnonization() : synchronizedIcon()}
    </div>
  );
}

SynchronizeReport.propTypes = {
  url: PropTypes.string.isRequired,
};

export default SynchronizeReport;

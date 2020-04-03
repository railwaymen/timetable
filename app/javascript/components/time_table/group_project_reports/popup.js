import React from 'react';
import style from '../../../../assets/stylesheets/pages/_popup.scss';

const Popup = (props) => (
  <div className={style.popup}>
    <div className={style.innerPopup}>
      <h1>{props.text}</h1>
      <button type="button" onClick={props.closePopup}>close me</button>
      <Item />
    </div>
  </div>
);

export default Popup;

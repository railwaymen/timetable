import React from 'react';

export default function Modal({
  children,
  visible = false,
  onClose,
  style = {},
}) {
  const onBackdropClick = (e) => {
    if (e.target.className === 'hardware-modal') {
      onClose();
    }
  };

  if (!visible) return (<></>);

  return (
    <div className="hardware-modal" onClick={onBackdropClick}>
      <div className="content" style={style}>
        <div className="close" onClick={onClose}>
          <i className="fa fa-close mr-3" />
        </div>
        <div className="body">
          {children}
        </div>
      </div>
    </div>
  );
}

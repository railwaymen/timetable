import React from 'react';

export default function Button({
  children, onClick, type, className = '',
}) {
  return (
    <button className={`action-button ${type} ${className}`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

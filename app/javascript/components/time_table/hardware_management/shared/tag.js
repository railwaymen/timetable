import React from 'react';

export default function Tag({ children }) {
  return (
    <div className={`tag ${children}`}>
      {children}
    </div>
  );
}

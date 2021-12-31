import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT = { path: '/hardware-devices', name: 'Hardware Devices' };

export default function Breadcrumb({ items = [] }) {
  const list = [DEFAULT].concat(items);
  const content = list.map(({ path, name }, i) => (
    <React.Fragment key={name}>
      <Link to={path}>
        {name}
      </Link>
      {i !== list.length - 1 ? ' / ' : ''}
    </React.Fragment>
  ));

  return (
    <div>
      {content}
    </div>
  );
}

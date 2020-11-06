import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Breadcrumb(props) {
  const initialCrumbs = props.crumbs;
  const [crumbs, setCrumbs] = useState([]);
  function renderCrumb(crumb) {
    return (
      <li key={crumb.label} className="breadcrumb-item">
        {crumb.active
          ? crumb.label
          : (<NavLink to={crumb.href}>{crumb.label}</NavLink>)}
      </li>
    );
  }
  useEffect(() => {
    if (initialCrumbs.length > 0) { initialCrumbs[initialCrumbs.length - 1].active = true; }
    setCrumbs(initialCrumbs);
  }, [initialCrumbs]);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {crumbs.map(renderCrumb)}
      </ol>
    </nav>
  );
}

import React from 'react';
import Button from '../shared/button';

export default function StickyMenu({ onCancel, onSubmit }) {
  return (
    <div className="sticky-menu">
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onSubmit} type="primary">Save Item</Button>
    </div>
  );
}

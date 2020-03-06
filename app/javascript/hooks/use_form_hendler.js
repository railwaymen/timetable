import { useState } from 'react';

export default function useFormHendler(def) {
  const [entry, setEntry] = useState(def);

  function handleInputChange(event) {
    const {
      target: {
        type,
        name,
        checked,
        value,
      },
    } = event;

    const newValue = type === 'checkbox' ? checked : value;

    setEntry({ ...entry, [name]: newValue });
  }

  return [entry, setEntry, handleInputChange];
}

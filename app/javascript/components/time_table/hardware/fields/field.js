import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditField from './edit_field';
import { makePutRequest } from '../../../shared/api';
import useFormHandler from '../../../../hooks/use_form_handler';
import translateErrors from '../../../shared/translate_errors';

const Field = ({
  hardware_id, id, name, value, locked, onDelete,
}) => {
  const [edit, setEdit] = useState(false);
  const [field, , onChange] = useFormHandler({ id, name, value });
  const [errors, setErrors] = useState({});

  const onSave = () => {
    makePutRequest(
      {
        url: `/api/hardwares/${hardware_id}/fields/${id}`,
        body: { field: { name: field.name, value: field.value } },
      },
    ).then(() => {
      setEdit(false);
      setErrors({});
    }).catch((response) => {
      const translatedErrors = translateErrors('hardware_field', response.errors);
      setErrors(translatedErrors);
    });
  };

  if (edit) {
    return (
      <EditField
        onChange={onChange}
        field={field}
        setEdit={setEdit}
        onSave={onSave}
        errors={errors}
      />
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-md-8">
          <div className="twelve wide column">
            <label className="font-weight-bold">{field.name}</label>
            <p>{field.value}</p>
          </div>
        </div>
        <div className="col-md-4">
          {(!locked || currentUser.isHardwareManager()) && (
          <div className="btn-group">
            <button
              type="button"
              data-tooltip-bottom={I18n.t('common.edit')}
              onClick={() => setEdit(true)}
              className="btn btn-primary"
            >
              <i className="fa fa-pencil" />
            </button>
            <button
              type="button"
              data-tooltip-bottom={I18n.t('common.destroy')}
              onClick={() => onDelete(id)}
              className="btn btn-danger"
            >
              <i className="fa fa-trash" />
            </button>
          </div>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
};

Field.propTypes = {
  hardware_id: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Field;

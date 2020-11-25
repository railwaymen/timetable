import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CreateField from './create_field';
import Field from './field';
import { makeDeleteRequest } from '../../../shared/api';

const FieldsList = (props) => {
  const [fields, setFields] = useState(props.fields);
  const [createFieldExpanded, setCreateFieldExpanded] = useState(false);

  const updateFieldList = (field) => {
    setFields([...fields, field]);
    setCreateFieldExpanded(false);
  };

  const onDelete = (id) => {
    makeDeleteRequest({
      url: `/api/hardwares/${props.hardware_id}/fields/${id}`,
    }).then(() => {
      setFields(fields.filter((field) => field.id !== id));
    });
  };

  const onCreateFieldExpand = () => {
    setCreateFieldExpanded(!createFieldExpanded);
  };

  return (
    <div>
      <div className="mb-3 mt-3">
        <h4 className="font-weight-bold">{I18n.t('apps.hardware.additional_fields')}</h4>
      </div>

      {fields.map((field) => {
        const { name, value, id } = field;
        return (
          <Field
            hardware_id={props.hardware_id}
            onDelete={onDelete}
            key={id}
            id={id}
            name={name}
            value={value}
            locked={props.locked}
            status={props.status}
          />
        );
      })}

      <div>
        <div className="row">
          <div className="col">
            {((!props.locked && props.status === 'in_office') || currentUser.isHardwareManager()) && (
              <CreateField
                toggleExpand={onCreateFieldExpand}
                expanded={createFieldExpanded}
                updateFieldList={updateFieldList}
                hardware_id={props.hardware_id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

FieldsList.propTypes = {
  hardware_id: PropTypes.number.isRequired,
  fields: PropTypes.array.isRequired,
  locked: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
};

export default FieldsList;

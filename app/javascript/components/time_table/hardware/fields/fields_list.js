import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CreateField from './create_field';
import Field from './field';
import { makeDeleteRequest } from '../../../shared/api';

const FieldsList = (props) => {
  const [fields, setFields] = useState(props.fields);
  const [createFieldExpanded, setCreateFieldExpanded] = useState(false);
  const [fieldsExpanded, setFieldsExpanded] = useState(false);

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

  const onFieldsExpand = () => {
    setFieldsExpanded(!fieldsExpanded);
  };

  const onCreateFieldExpand = () => {
    setCreateFieldExpanded(!createFieldExpanded);
  };

  if (fieldsExpanded) {
    return (
      <div>
        <div className="mb-3">
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
            />
          );
        })}

        <div>
          <div className="row">
            <div className="col">
              <CreateField
                toggleExpand={onCreateFieldExpand}
                expanded={createFieldExpanded}
                updateFieldList={updateFieldList}
                hardware_id={props.hardware_id}
              />
            </div>
            {!createFieldExpanded && (
              <div className="col-md-3">
                <button
                  onClick={onFieldsExpand}
                  type="button"
                  className="btn rounded-circle btn-outline-primary"
                  data-tooltip-bottom={I18n.t('common.fold')}
                >
                  <i className="fa fa-arrow-up" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" d-flex justify-content-end">
      <button
        onClick={onFieldsExpand}
        type="button"
        data-tooltip-bottom={I18n.t('common.expand')}
        className="btn btn-outline-primary rounded-circle "
      >
        <i className="fa fa-arrow-down" />
      </button>
    </div>
  );
};

FieldsList.propTypes = {
  hardware_id: PropTypes.number.isRequired,
  fields: PropTypes.array.isRequired,
};

export default FieldsList;

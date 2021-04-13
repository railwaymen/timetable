/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useRef, useState } from 'react';
import AttachmentModel from '../../../../models/attachment-model';
import ImagesPreview from './images-preview';

export default function Images({
  list = [], onFilesUpload, onRemoveImage, editable = true,
}) {
  const input = useRef(null);
  const [showPreviewIndex, setShowPreviewIndex] = useState(null);

  const onUpload = ({ target: { files } }) => {
    const fileEntries = [];
    let i = 1;

    const filesArray = [...files];

    filesArray.forEach((uploadedFile) => {
      const source = URL.createObjectURL(uploadedFile);

      if (list.length + i < 10) {
        fileEntries.push(new AttachmentModel({ added: true, source, file: uploadedFile }));
      }

      i += 1;
    });

    onFilesUpload(fileEntries);
  };

  const onShowImage = (id) => {
    const dataset = list.map((e) => e.id);
    const elementIndex = dataset.indexOf(id);

    setShowPreviewIndex(elementIndex);
  };

  const active = list.filter((content) => !content.removed);

  return (
    <div className="images">
      <ImagesPreview startWith={showPreviewIndex} visible={showPreviewIndex !== null} onClose={() => setShowPreviewIndex(null)} images={list} />
      {active.map((content) => (
        <div key={content.id} className="photo-card">
          {editable && (
            <button className="remove-button" type="button" onClick={() => onRemoveImage(content.id)}>
              <i className="fa fa-trash" />
            </button>
          )}
          <img onClick={() => onShowImage(content.id)} src={content.source} alt="preview" />
        </div>
      ))}
      {editable && active.length < 10 && (
        <button type="button" onClick={() => input.current.click()} className="photo-card add">
          {I18n.t('apps.hardware_devices.add_photo')}
          <input
            hidden
            ref={input}
            type="file"
            id="file-uplopad"
            className="add-photo-card"
            multiple
            onChange={onUpload}
          />
        </button>
      )}
    </div>
  );
}

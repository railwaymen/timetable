import React, { useEffect, useState } from 'react';
import Modal from './modal';

export default function ImagesPreview({
  images, onClose, visible, startWith,
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(startWith || 0);

  useEffect(() => {
    setCurrentPhotoIndex(startWith || 0);
  }, [startWith]);

  const onNext = () => {
    const { length } = images;

    if (currentPhotoIndex >= length - 1) return;

    setCurrentPhotoIndex((state) => state + 1);
  };

  const onPrevious = () => {
    if (currentPhotoIndex <= 0) return;

    setCurrentPhotoIndex((state) => state - 1);
  };

  return (
    <Modal onClose={onClose} visible={visible}>
      <div className="showcase">
        <img src={images[currentPhotoIndex]?.source} alt="preview" />
        <div className="actions">
          <button type="button" className="slider-button" onClick={onPrevious}>
            <i className="fa fa-chevron-left" />
          </button>
          <span>
            {currentPhotoIndex + 1}
            /
            {images.length}
          </span>
          <button type="button" className="slider-button" onClick={onNext}>
            <i className="fa fa-chevron-right" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

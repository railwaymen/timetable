import { shape, string } from 'prop-types';

const tagShape = shape({
  key: string,
  value: string,
});

export default tagShape;

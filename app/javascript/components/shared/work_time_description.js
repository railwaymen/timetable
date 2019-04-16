import _ from 'lodash';
import { preserveLines } from './helpers';

const WorkTimeDescription = ({ body }) => preserveLines(_.unescape(body) || '[No description]');

export default WorkTimeDescription;

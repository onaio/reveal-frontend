import moment from 'moment';
import React from 'react';
import { Badge } from 'reactstrap';
import { NEW_TITLE } from '../../configs/lang';

/** interface for NewRecordBadge props */
interface NewRecordBadgeProps {
  className: string;
  color: string;
  numDays: number;
  pill: boolean;
  recordDate: string | Date | null;
  text: string;
}

/** Simple component that displays a badge for new records */
const NewRecordBadge = (props: NewRecordBadgeProps) => {
  const { className, color, numDays, pill, recordDate, text } = props;
  if (
    recordDate &&
    moment(recordDate) &&
    moment(recordDate).isAfter(moment().subtract(numDays, 'days'))
  ) {
    return (
      <Badge color={color} pill={pill} className={className}>
        {text}
      </Badge>
    );
  }
  return null;
};

/** define default props */
const defaultProps: NewRecordBadgeProps = {
  className: 'new-record',
  color: 'warning',
  numDays: 1,
  pill: true,
  recordDate: null,
  text: NEW_TITLE,
};

/** declare default props for NewRecordBadge */
NewRecordBadge.defaultProps = defaultProps;

export default NewRecordBadge;

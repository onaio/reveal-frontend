import moment from 'moment';
import React from 'react';
import { Badge } from 'reactstrap';

/** interface for NewRecordBadge props */
interface NewRecordBadgeProps {
  className: string;
  numDays: number;
  recordDate: string | Date | null;
}

/** Simple component that displays a badge for new records */
const NewRecordBadge = (props: NewRecordBadgeProps) => {
  const { className, numDays, recordDate } = props;
  if (
    recordDate &&
    moment(recordDate) &&
    moment(recordDate).isAfter(moment().subtract(numDays, 'days'))
  ) {
    return (
      <Badge color="warning" pill={true} className={className}>
        New
      </Badge>
    );
  }
  return null;
};

/** define default props */
const defaultProps: NewRecordBadgeProps = {
  className: 'new-record',
  numDays: 1,
  recordDate: null,
};

/** declare default props for NewRecordBadge */
NewRecordBadge.defaultProps = defaultProps;

export default NewRecordBadge;

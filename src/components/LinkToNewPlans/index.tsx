import * as React from 'react';
import { Link } from 'react-router-dom';
import { NEW_PLAN_URL } from '../../constants';

/** interface for LinkToNewPlans component props */
export interface Props {
  classProp: string;
  text: string;
}

/** LinkToNewPlans component */
const LinkToNewPlans = (props: Props) => {
  const { text } = props;
  return (
    <Link to={NEW_PLAN_URL} className={props.classProp}>
      {text}
    </Link>
  );
};

const defaultProps: Props = {
  classProp: 'focus-investigation btn btn-primary float-right mt-5',
  text: 'Add Focus Investigation',
};
LinkToNewPlans.defaultProps = defaultProps;

export default LinkToNewPlans;

import * as React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { CASE_TRIGGERED, NEW_PLAN_URL, REACTIVE, ROUTINE } from '../../../constants';
import { Plan } from '../../../store/ducks/plans';
import LinkAsButton from '../../LinkAsButton';
/** Interface to describe props for TableHeader components  */
export interface TableHeaderProps {
  plansArray: Plan[];
}
/** Component returns header based on plan reason i.e reactive or routine */
class TableHeader extends React.Component<TableHeaderProps, {}> {
  constructor(props: TableHeaderProps) {
    super(props);
  }
  public render() {
    const { plansArray } = this.props;
    if (plansArray.every(d => d.plan_fi_reason === CASE_TRIGGERED)) {
      return <h3 className="mb-3 mt-5 page-title">{REACTIVE}</h3>;
    } else {
      return (
        <div className="routine-heading">
          <Row>
            <Col xs="6">
              <h3 className="mb-3 mt-5 page-title">{ROUTINE}</h3>
            </Col>
            <Col xs="6">
              <LinkAsButton />
            </Col>
          </Row>
        </div>
      );
    }
  }
}
export default TableHeader;

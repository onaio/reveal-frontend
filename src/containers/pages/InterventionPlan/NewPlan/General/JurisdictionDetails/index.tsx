import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Collapse } from 'reactstrap';
import { format } from 'util';
import { PlanJurisdictionFormFields } from '../../../../../../components/forms/PlanForm/types';
import { FIS_IN_JURISDICTION, JURISDICTION } from '../../../../../../configs/lang';
import { FI_SINGLE_URL } from '../../../../../../constants';

interface JurisdictionDetailsProps {
  planFormJurisdiction: PlanJurisdictionFormFields;
}

export const JurisdictionDetails = (props: JurisdictionDetailsProps) => {
  const { planFormJurisdiction } = props;
  const [isCollapsed, setCollapse] = useState<boolean>(true);
  const toggleCollapse = () => setCollapse(!isCollapsed);

  if (
    !planFormJurisdiction.id ||
    planFormJurisdiction.id === '' ||
    !planFormJurisdiction.name ||
    planFormJurisdiction.name === ''
  ) {
    return null;
  }

  return (
    <div>
      <div id="accordion-jurisdiction-deets">
        <Card>
          <CardHeader style={{ cursor: 'pointer' }} onClick={toggleCollapse}>
            <h5>{JURISDICTION}</h5>
          </CardHeader>
          <Collapse isOpen={isCollapsed}>
            <CardBody>
              <Link to={`${FI_SINGLE_URL}/${planFormJurisdiction.id}`}>
                {format(FIS_IN_JURISDICTION, planFormJurisdiction.name)}
              </Link>
            </CardBody>
          </Collapse>
        </Card>
      </div>
    </div>
  );
};

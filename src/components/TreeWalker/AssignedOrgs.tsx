import React, { Fragment, useState } from 'react';
import { Tooltip } from 'reactstrap';
import { Organization } from '../../store/ducks/opensrp/organizations';

interface AssignedOrgsProps {
  displayLimit: number;
  id: string;
  orgs: Organization[];
}

const defaultProps: AssignedOrgsProps = {
  displayLimit: 3,
  id: '',
  orgs: [],
};

const AssignedOrgs = (props: AssignedOrgsProps) => {
  const { id, orgs, displayLimit } = props;

  if (!orgs || orgs.length < 1 || id === '') {
    return null;
  }

  const orgNames: string[] = orgs.map(org => org.name);
  const orgsDisplay = orgNames.join(', ');

  if (orgNames.length < displayLimit) {
    return <span id={`org-span-${id}`}>{orgsDisplay}</span>;
  }

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const displayString = `${orgNames.slice(0, displayLimit).join(', ')} and ${orgs.length -
    displayLimit} more`;

  return (
    <Fragment>
      <span id={`org-tooltip-${id}`}>{displayString}</span>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={`org-tooltip-${id}`}
        toggle={toggleTooltip}
      >
        {orgsDisplay}
      </Tooltip>
    </Fragment>
  );
};

AssignedOrgs.defaultProps = defaultProps;

export { AssignedOrgs };

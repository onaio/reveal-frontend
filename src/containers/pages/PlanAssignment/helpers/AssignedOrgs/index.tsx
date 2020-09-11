import React, { Fragment, useState } from 'react';
import { Tooltip } from 'reactstrap';
import { AND, MORE } from '../../../../../configs/lang';
import { Organization } from '../../../../../store/ducks/opensrp/organizations';

/** Props for AssignedOrgs  */
export interface AssignedOrgsProps {
  displayLimit: number /** The max number of orgs to show initially */;
  id: string /** id to use for tooltip */;
  labels: {
    and: string;
    more: string;
  };
  orgs: Organization[] /** array of organisations */;
}

/** default props for AssignedOrgs */
const defaultProps: AssignedOrgsProps = {
  displayLimit: 3,
  id: '',
  labels: {
    and: AND,
    more: MORE,
  },
  orgs: [],
};

/**
 * AssignedOrgs
 *
 * This component displays a comma separated list of organization names.
 * When the number of names is more than displayLimit (default 3), then
 * the component only shows a few names, and hides the rest in a Tooltip.
 *
 * @param props - the props!
 */
const AssignedOrgs = (props: AssignedOrgsProps) => {
  const { id, orgs, displayLimit, labels } = props;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!orgs || orgs.length < 1 || id === '') {
    return null;
  }

  const orgNames: string[] = orgs.map(org => org.name);
  const orgsDisplay = orgNames.join(', ');

  if (orgNames.length <= displayLimit) {
    return <span id={`org-span-${id}`}>{orgsDisplay}</span>;
  }

  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const displayString = `${orgNames.slice(0, displayLimit).join(', ')} ${labels.and} ${orgs.length -
    displayLimit} ${labels.more}`;

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

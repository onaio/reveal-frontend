/** Resource Calculation component
 * going to be a side panel that calculates the ETA for an available
 * number of teams to be visit a variable number of structures in selected
 * jurisdictions.
 */

import { Field, Form, Formik } from 'formik';
import React from 'react';
import { format } from 'util';
import {
  AT_A_RATE_OF,
  RESOURCE_ESTIMATE_FOR,
  STRUCTURES_PER_TEAM_PER_DAY,
  TEAMS,
} from '../../../../../configs/lang';
import './index.css';

/** props */
export interface ResourceCalculationProps {
  jurisdictionName: string;
  structuresCount: number /** structure count per level parentNode.metaStructureCount */;
}

export const defaultCalculationProps = {
  jurisdictionName: '',
  structuresCount: 0,
};

/** helper function that computes the estimate time to completion given a
 * the total structures and rate of completion per team
 * @param totalStructures - total structures in these jurisdiction
 * @param structuresPerTeam - rate of completion; how many structures a team can handler
 * @param teams - tne number of teams
 */
export const computeEstimate = (
  totalStructures: number,
  structuresPerTeam: number,
  teams: number
) => {
  if (!teams || !structuresPerTeam) {
    return 0;
  }
  return Math.ceil(totalStructures / (teams * structuresPerTeam));
};

/** The component that renders the resource calculation info */
const ResourceCalculation = (props: ResourceCalculationProps) => {
  const { jurisdictionName, structuresCount } = props;

  return (
    <div id="resource-calc-widget">
      <h3 className="section-title">{format(RESOURCE_ESTIMATE_FOR, jurisdictionName)}</h3>

      <Formik
        initialValues={{ structuresCount: 0, teamsCount: 0 }}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={() => {
          return;
        }}
      >
        {formikProps => {
          const { structuresCount: formikStructureSCount, teamsCount } = formikProps.values;
          const numDays = computeEstimate(structuresCount, formikStructureSCount, teamsCount);
          return (
            <Form>
              <p>
                {`${numDays} days`}
                <br />
                {AT_A_RATE_OF} <Field type="number" name="structuresCount" />
                {'  '}
                {STRUCTURES_PER_TEAM_PER_DAY} <Field type="number" name="teamsCount" /> {TEAMS}
              </p>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

ResourceCalculation.defaultProps = defaultCalculationProps;
export { ResourceCalculation };

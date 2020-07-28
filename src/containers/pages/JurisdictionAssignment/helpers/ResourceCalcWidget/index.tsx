/** Resource Calculation component
 * going to be a side panel that calculates the ETA for an available
 * number of teams to be visit a variable number of structures in selected
 * jurisdictions.
 */

import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import '/.index.css';

export interface ResourceCalculationProps {
  structuresCount: number /** structure count per level parentNode.metaStructureCount */;
  jurisdictionName: string;
}

export const ResourceCalculation = (props: ResourceCalculationProps) => {
  const [numStructures, setNumStructures] = useState<number>(0);
  const [numTeams, setNumTeams] = useState<number>(0);

  const computeEstimate = (structures: number, teams: number) => {
    if (teams === 0) {
      return 0;
    }
    return structures / teams;
  };

  return (
    <div id="resource-calc-widget">
      <h3>Resource Estimate for {props.jurisdictionName}</h3>

      <Formik
        initialValues={{ structuresCount: 0, teamsCount: 0 }}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={() => {
          return;
        }}
      >
        {formikProps => {
          const numDays = computeEstimate(
            formikProps.values.structuresCount,
            formikProps.values.teamsCount
          );
          return (
            <Form>
              <p>
                {`${numDays} days`}
                <br />
                at a rate of <Field type="number" name="structuresCount" />
                {'  '}
                structures per team per day with <Field type="number" name="teamsCount" /> teams
              </p>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

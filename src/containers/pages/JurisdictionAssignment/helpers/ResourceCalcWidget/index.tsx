/** Resource Calculation component
 * going to be a side panel that calculates the ETA for an available
 * number of teams to be visit a variable number of structures in selected
 * jurisdictions.
 */

import { Field, Form, Formik } from 'formik';
import React from 'react';
import { format } from 'util';
import { RESOURCE_ESTIMATE_FOR } from '../../../../../configs/lang';
import '/.index.css';

export interface ResourceCalculationProps {
  jurisdictionName: string;
  structuresCount: number /** structure count per level parentNode.metaStructureCount */;
}

export const defaultCalculationProps = {
  jurisdictionName: '',
  structuresCount: 0,
};

export const computeEstimate = (structures: number, teams: number) => {
  if (teams === 0) {
    return 0;
  }
  return structures / teams;
};
export const ResourceCalculation = (props: ResourceCalculationProps) => {
  return (
    <div id="resource-calc-widget">
      <h3 className="section-title">{format(RESOURCE_ESTIMATE_FOR, props.jurisdictionName)}</h3>

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

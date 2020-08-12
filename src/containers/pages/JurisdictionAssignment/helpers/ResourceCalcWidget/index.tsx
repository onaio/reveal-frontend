/** Resource Calculation component
 * going to be a side panel that calculates the ETA for an available
 * number of teams to be visit a variable number of structures in selected
 * jurisdictions.
 */

import reducerRegistry from '@onaio/redux-reducer-registry';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { format } from 'util';
import { ErrorPage } from '../../../../../components/page/ErrorPage';
import {
  AT_A_RATE_OF,
  NO_JURISDICTION_SELECTIONS_FOUND,
  RESOURCE_ESTIMATE_FOR,
  STRUCTURES_PER_TEAM_PER_DAY,
  TEAMS,
} from '../../../../../configs/lang';
import hierarchyReducer, {
  getParentNodeInSelectedTree,
  reducerName as hierarchyReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import { getNodeStructureCount } from '../../../../../store/ducks/opensrp/hierarchies/utils';
import './index.css';

reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

/** props */
export interface ResourceCalculationProps {
  rootId: string;
  planId: string;
  currentParentNode?: TreeNode;
  currentParentId?: string;
}

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
  const { currentParentNode } = props;

  if (!currentParentNode) {
    return <ErrorPage errorMessage={NO_JURISDICTION_SELECTIONS_FOUND} />;
  }
  const jurisdictionName = currentParentNode.model.label;
  const structuresCount = getNodeStructureCount(currentParentNode);

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

export { ResourceCalculation };

type MapStateToProps = Pick<ResourceCalculationProps, 'currentParentNode'>;

export const parentNodeSelector = getParentNodeInSelectedTree();

/** map props to store state selectors
 * @param state - the store
 * @param ownProps - component props
 */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: ResourceCalculationProps
): MapStateToProps => {
  const filters = {
    currentParentId: ownProps.currentParentId,
    planId: ownProps.planId,
    rootJurisdictionId: ownProps.rootId,
  };
  const currentParentNode = parentNodeSelector(state, filters);
  return { currentParentNode };
};

const ConnectedResourceWidget = connect(mapStateToProps)(ResourceCalculation);
export { ConnectedResourceWidget };

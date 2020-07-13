import React from 'react';
import { Store, connect } from 'redux';
import { PlanDefinition } from '../../../configs/settings';
import { OpenSRPService } from '../../../services/opensrp';
import { fetchJurisdictions } from '../../../store/ducks/jurisdictions';
import { TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';

/** props for Plan jurisdiction and team assignment higher order component */
export interface AssignmentMapWrapperProps {
  plan: PlanDefinition;
  rootJurisdictionId: string;
  currentParentId: string | undefined;
  currentChildren: TreeNode[];
  serviceClass: typeof OpenSRPService;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
}

const defaultProps = {
  currentChildren: [],
  currentParentId: null,
  currentParentNode: null,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  rootJurisdictionId: '',
  serviceClass: OpenSRPService,
};

const AssignmentMapWrapper = (props: AssignmentMapWrapperProps) => {
  return <div>Null</div>;
};

AssignmentMapWrapper.defaultProps = defaultProps;

export { AssignmentMapWrapper };

/** Connect the component to the store */

/** Map state to props */
type MapStateToProps = Pick<AssignmentMapWrapperProps, 'currentChildren' | 'currentParentId'>;

/** map action creators interface */
type DispatchToProps = Pick<AssignmentMapWrapperProps, 'fetchJurisdictionsActionCreator'>;

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - the props
 */

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: AssignmentMapWrapperProps
): MapStateToProps => {
  return {
    currentChildren: ownProps.currentChildren,
    currentParentId: ownProps.currentParentId,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchJurisdictionsActionCreator: fetchJurisdictions,
};

export const ConnectedAssignmentMapWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignmentMapWrapper);

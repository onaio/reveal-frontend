import { Feature } from '@turf/turf';
import { History } from 'history';
import { EventData, Map } from 'mapbox-gl';
import { AssignmentMapWrapperProps } from '..';
import {
  AUTO_ASSIGN_JURISDICTIONS_URL,
  MANUAL_ASSIGN_JURISDICTIONS_URL,
} from '../../../../constants';
import { SELECTION_REASON } from '../../../../store/ducks/opensrp/hierarchies/constants';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { nodeIsSelected } from '../../../../store/ducks/opensrp/hierarchies/utils';

/**
 * Handler to get current parent id from clicked jurisdiction on map
 * @param props - AssignmentMapWrapper component props
 * @param setMapParent - function to set map parent id to state
 * @param history - history session object
 */

export const onJurisdictionClick = (
  props: AssignmentMapWrapperProps,
  setMapParent: (currentId: string) => void,
  history: History
) => {
  function handleJurisdictionClick(_: Map, e: EventData) {
    // Destructure event data
    const { point, target, originalEvent } = e;
    const {
      currentParentNode,
      rootJurisdictionId,
      selectNodeCreator,
      deselectNodeCreator,
      plan,
      autoSelectionFlow,
      getJurisdictionsMetadata,
    } = props;

    const baseUrl = !autoSelectionFlow
      ? `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`
      : `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootJurisdictionId}`;
    // grab underlying features from map
    const features: Feature[] = target.queryRenderedFeatures(point);
    if (!features.length) {
      return false;
    }
    if (features[0]) {
      const currentId =
        (features[0].id && features[0].id.toString()) ||
        (features[0] && features[0].properties && features[0].properties.externalId);
      if (originalEvent.altKey) {
        let activeCurrentNode: TreeNode | any = {};
        // Handle selection for admin level 0
        if (
          currentParentNode &&
          currentParentNode.model.id === rootJurisdictionId &&
          currentId === currentParentNode.model.id
        ) {
          activeCurrentNode = currentParentNode;
        } else {
          // Handle selection for admin > 0
          activeCurrentNode = currentParentNode.children.find(
            (node: TreeNode) => node.model.id === currentId
          );
        }
        if (
          !nodeIsSelected(
            activeCurrentNode.model.id,
            rootJurisdictionId,
            plan.identifier,
            getJurisdictionsMetadata
          )
        ) {
          selectNodeCreator(
            rootJurisdictionId,
            activeCurrentNode.model.id,
            plan.identifier,
            SELECTION_REASON.USER_CHANGE
          );
        } else {
          deselectNodeCreator(
            rootJurisdictionId,
            activeCurrentNode.model.id,
            plan.identifier,
            SELECTION_REASON.USER_CHANGE
          );
        }
        setMapParent(currentId);
      } else {
        if (currentParentNode.hasChildren()) {
          history.push(`${baseUrl}/${currentId}`);
        }
      }
    }
  }
  return handleJurisdictionClick;
};

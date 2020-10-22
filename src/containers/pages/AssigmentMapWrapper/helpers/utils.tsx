import { Dictionary } from '@onaio/utils';
import { Feature } from '@turf/turf';
import { History } from 'history';
import mapboxgl, { EventData, Map } from 'mapbox-gl';
import { AssignmentMapWrapperProps } from '..';
import { PLAN_TYPES_WITH_MULTI_JURISDICTIONS } from '../../../../configs/env';
import { getPlanType } from '../../../../helpers/utils';
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
      currentChildren,
      plan,
      baseAssignmentURL,
    } = props;
    // grab underlying features from map
    const features: Feature[] = target.queryRenderedFeatures(point);
    if (!features.length) {
      return false;
    }

    for (const feature of features) {
      const activeJurisdictionId =
        (feature && feature.id) ||
        (feature && feature.properties && feature.properties.jurisdiction_id);
      if (activeJurisdictionId) {
        const currentId = activeJurisdictionId;
        let activeCurrentNode: TreeNode | undefined;

        if (currentParentNode) {
          // ensure currentparentnode is not undefined first
          // Handle selection for admin level 0
          if (
            currentParentNode.model.id === rootJurisdictionId &&
            currentId === currentParentNode.model.id
          ) {
            activeCurrentNode = currentParentNode;
          } else {
            // Handle selection for admin level > 0
            activeCurrentNode = currentChildren.find(
              (node: TreeNode) => node.model.id === currentId
            );
          }
        }
        const thePlanType = getPlanType(plan);
        if (
          activeCurrentNode &&
          originalEvent.altKey &&
          PLAN_TYPES_WITH_MULTI_JURISDICTIONS.includes(thePlanType)
        ) {
          if (!nodeIsSelected(activeCurrentNode)) {
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
          if (activeCurrentNode && activeCurrentNode.hasChildren()) {
            history.push(`${baseAssignmentURL}/${currentId}`);
          }
        }
        break;
      }
    }
  }
  return handleJurisdictionClick;
};

/**
 * Map component popup handler
 * @param map - mapbox map instance
 * @param event - map event object
 */

export const buildMouseMoveHandler = (map: Map, event: EventData) => {
  const popup = new mapboxgl.Popup({
    closeButton: false,
  });
  // Added this part to remove duplicate popup containers showing on map when hovering
  const nodes: any = document.getElementsByClassName('mapboxgl-popup');
  let node: HTMLDivElement;
  if (nodes && nodes.length) {
    for (node of nodes) {
      if (node.style) {
        node.style.display = 'none';
      }
    }
  }
  let content: string = '';
  let feature: Feature | any = {};
  popup.remove();
  // grab underlying features from map
  const features: any = event.target.queryRenderedFeatures(event.point) as Dictionary[];
  //
  if (!features.length) {
    return;
  }

  // Change the cursor style to pointer if features exist.
  map.getCanvas().style.cursor = features.length ? 'pointer' : 'grab';

  // loop through features, setting the name property to content var
  for (feature of features) {
    if (feature && feature.properties && feature.properties.name) {
      content += `<div class="jurisdiction-name"><center>${feature.properties.name}</center></div>`;
    }
    /**
     * Break out of loop once content is set
     * This helps in a case where we could have 2 or more identical features
     */
    if (content) {
      break;
    }
  }
  /**
   * Add popup to map after content is set
   */
  if (content.length) {
    popup
      .setLngLat(map.unproject(event.point))
      .setHTML(content)
      .addTo(map);
  } else {
    // clear existing popups if content is empty
    popup.remove();
    return;
  }
  return true;
};

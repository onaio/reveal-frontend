/** Tree view */
import { roundToNearestMinutes } from 'date-fns';
import React from 'react';
import TreeModel from 'tree-model';
import { FlexObject } from '../../helpers/utils';
import { getFilterParams, OpenSRPService } from '../../services/opensrp';
import { OpenSRPAPIResponse } from '../../services/opensrp/tests/fixtures/session';
import { TreeNode } from './TreeNode/';

// each node will have a label and value property, selected.
// clicking a select renders all jurisdictions below as selected

/** interface for jurisdiction options
 * These are received from the OpenSRP API
 */
interface JurisdictionOption {
  id: string;
  properties: {
    status: string;
    name: string;
    geographicLevel: number;
    version: string | number;
  };
  serverVersion: number;
  type: 'Feature';
}

interface NodeState {
  value: string;
  label: string;
  selected: boolean;
}

interface Props {
  params: {
    is_jurisdiction: true;
    return_geometry: false;
  };
}

interface LocationsState {
  locations: FlexObject;
}

export const LocationTreeView: React.FC<Props> = props => {
  const { params } = props;
  const tree = new TreeModel({ childrenPropertyName: 'locations' });
  const [locationState, setLocationState] = React.useState<TreeModel>(tree);
  return <TreeNode />;
};

const formatLocations = (locations: any[]) => {
  return locations.map(location => ({ label: location.properties.name, value: location.id }));
};

// handle on click; clicking a span link; should expand the tree
const loadLocations = async (
  serviceClass: typeof OpenSRPService,
  parentId: string = '',
  params: FlexObject
): void => {
  // should modify state, cause a rerender, leave the rest to the component
  const service = new serviceClass('');
  const propertiesToFilter = {
    ...(parentId === '' && { geographicLevel: 0 }),
    ...(parentId !== '' && { parentId }),
  };
  const paramsToUse = {
    ...params,
    ...(Object.keys(propertiesToFilter).length > 0 && {
      properties_filter: getFilterParams(propertiesToFilter),
    }),
  };
  return await service.list(paramsToUse);
};

const createState = state => {
  // takes the state tree, adds returned locations to that tree.
  // seems like we will have to load data 2 levels deep
  const mutableState = cloneDeep(state);
  const parentId = ''; // arg
  // state should be a tree
  const parentNode = mutableState.first(node => node.model.value === parentId);
  let locations = await loadLocations(); // if loadLocations returns no data for lower level, modify the parent as being the las node
  locations = formatLocations(locations);
  locations.forEach(element => {
    const aNode = TreeModel.parse(element);
    parentNode.addChild(aNode);
  });

  return mutableState;
};

// walk the tree and render the tree nodes.
const root = {};
const walkStrategy = { strategy: 'breadth' };
const step = node => {
  // each node will have selected field
  if (node.locations.length > 1){
    // show as a link, and apply 
  }
  return (
    <ul class="tree-root-ul">
      
      <li>
        <ul className="nested"> </ul>
      </li>
    </ul>
  );
};
root.walk(walkStrategy, step);

// enter data returned from loadLocations into state tree
// const createState = async () => {
//   const parent1 = {};
//   const child = {};

//   const sample = {
//     locations: {
//       parent1Id: {
//         ...parent1,
//         locations: {
//           child1Id: {
//             ...child,
//             locations: {
//               grandChildId: child,
//             },
//           },
//           child2Id: child,
//           child3Id: child,
//           child4Id: child,
//           child5Id: child,
//         },
//       },
//     },
//   };
// };

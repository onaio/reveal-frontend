import { Result } from '@onaio/utils';
import { uniqBy } from 'lodash';
import { failure, success } from '../../helpers/dataLoading/utils';
import { OpenSRPService, URLParams } from '../../services/opensrp';
import { ParsedHierarchySingleNode, TreeNode } from '../../store/ducks/opensrp/hierarchies/types';
import {
  ACTIVE,
  COULDNT_LOAD_PARENTS,
  FEATURE,
  FIND_BY_ID,
  FIND_BY_PROPERTIES,
  LOCATION,
} from './constants';
import { APIEndpoints, OpenSRPJurisdiction, TreeNodeType } from './types';

/** Default params to be used when fetching locations from OpenSRP */
export const defaultLocationParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

/** Default property to be used when fetching locations from OpenSRP */
export const defaultLocationPropertyFilters = {
  status: ACTIVE,
};

/** Nice little object that holds the various endpoint values */
export const locationAPIEndpoints: APIEndpoints = {
  findByJurisdictionIds: FIND_BY_ID,
  findByProperties: FIND_BY_PROPERTIES,
  location: LOCATION,
};

/**
 * Format a jurisdictions tree node into an OpenSRPJurisdiction object
 * @param node - the tree node
 */
export const formatJurisdiction = (node: ParsedHierarchySingleNode): OpenSRPJurisdiction => {
  return {
    id: node.id,
    properties: {
      geographicLevel: node.node.attributes.geographicLevel,
      name: node.label,
      parentId: node.parent,
      status: ACTIVE,
      version: -1,
    },
    serverVersion: -1,
    type: FEATURE,
  };
};

/** Get ancestors of a jurisdiction from OpenSRP
 *
 * This is a recursive function that traverses the OpenSRP jurisdiction tree
 * upwards (i.e. towards the root parent), and returns an array of all the ancestors
 * of the supplied jurisdiction, including the jurisdiction
 *
 * @param jurisdiction - the jurisdiction in question
 * @param path - array of ancestors
 * @param errorMessage - message to show when an error happens
 * @param apiEndpoint - the API endpoint
 * @param serviceClass - the API helper class
 */
export const getAncestors = async (
  jurisdiction: OpenSRPJurisdiction,
  path: OpenSRPJurisdiction[] = [],
  errorMessage: string = COULDNT_LOAD_PARENTS,
  apiEndpoint: string = locationAPIEndpoints.location,
  serviceClass: typeof OpenSRPService = OpenSRPService
): Promise<Result<OpenSRPJurisdiction[]>> => {
  // Add the jurisdiction to the beginning of the array
  if (!path.map(e => e.id).includes(jurisdiction.id)) {
    path.unshift(jurisdiction);
  }

  if (jurisdiction.properties.geographicLevel === 0 || !jurisdiction.properties.parentId) {
    return success(path);
  }

  const service = new serviceClass(apiEndpoint);
  const result = await service
    .read(jurisdiction.properties.parentId, defaultLocationParams)
    .then((response: OpenSRPJurisdiction) => {
      if (response) {
        return success(response);
      }
    })
    .catch((error: Error) => {
      return failure(error);
    });

  if (!result) {
    return failure(Error(errorMessage));
  } else {
    if (result.value !== null) {
      return getAncestors(result.value, path);
    }
    return result;
  }
};

/**
 * Get children of a jurisdiction from an OpenSRP jurisdiction tree
 * @param nodeId - the id of the jurisdiction whose children you want
 * @param tree - the OpenSRP jurisdiction tree
 * @param doFormat - whether to format children into OpenSRPJurisdiction types
 */
export const getChildren = (
  nodeId: string,
  tree: TreeNode,
  doFormat: boolean = true
): Result<TreeNodeType[]> => {
  let children: TreeNode[] = [];
  // if nodeId is not an empty string search for node and return its children
  const nodeFromTree = tree.first(treeNode => treeNode.model.id === nodeId);

  if (nodeFromTree && nodeFromTree.hasChildren()) {
    children = nodeFromTree.children;
  } else {
    children = [];
  }
  // if nodeId was an empty string, set current children to an array of the single node
  if (nodeId === '') {
    children = [tree];
  }
  if (doFormat) {
    const formattedChildren = children.map((nodeModel: TreeNode) =>
      formatJurisdiction(nodeModel.model)
    );
    return success(formattedChildren);
  }
  return success(children);
};

/**
 * Get jurisdictions using their ids
 *
 * Calls the OpenSRP findByJurisdictionIds locations API to get jurisdictions using
 * an array os jurisdiction ids
 *
 * @param jurisdictionIds - array of jurisdiction ids
 * @param params - url params to send with the request
 * @param chunkSize - the max number of jurisdictions to try and get at the same time
 * @param serviceClass - the OpenSRP server service class
 * @param apiEndpoint - the API endpoint
 */
export const getJurisdictions = (
  jurisdictionIds: string[],
  params: URLParams,
  chunkSize: number = 20,
  serviceClass: typeof OpenSRPService = OpenSRPService,
  apiEndpoint: string = locationAPIEndpoints.findByJurisdictionIds
): Promise<Result<OpenSRPJurisdiction[]>> => {
  const promises = [];
  if (jurisdictionIds.length > 0) {
    const service = new serviceClass(apiEndpoint);
    // remove duplicates
    const cleanedIds = Array.from(new Set(jurisdictionIds));
    // cleanedIds may have a huge number of elements and so we need to chunk
    // it so that our URL doesn't get too long
    for (let index = 0, size = cleanedIds.length; index < size; index += chunkSize) {
      params.jurisdiction_ids = cleanedIds.slice(index, index + chunkSize).join(',');
      promises.push(service.list(params));
    }
  }
  if (promises.length > 0) {
    return Promise.all(promises)
      .then(results => {
        // We are concatenating all the resulting arrays so that we return all nodes in one array
        const children = [].concat.apply([], results);
        // then we remove duplicates and return the children
        return success(uniqBy(children, 'id'));
      })
      .catch((error: Error) => {
        return failure(error);
      });
  } else {
    return new Promise(resolve => resolve(success([])));
  }
};

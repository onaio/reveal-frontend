import React, { Fragment, useEffect, useState } from 'react';
import { displayError } from '../../helpers/errors';
import { getFilterParams, OpenSRPService, URLParams } from '../../services/opensrp';
import {
  defaultLocationParams,
  defaultLocationPropertyFilters,
  getAncestors,
  getChildren,
} from './helpers';
import { OpenSRPJurisdiction } from './types';

/** Type def for the TreeWalker component */
export interface TreeWalkerProps {
  LoadingIndicator: React.FC /** Element to show loading indicator */;
  getAncestorsFunc: typeof getAncestors /** function to get ancestors */;
  getChildrenFunc: typeof getChildren /** function to get children */;
  jurisdictionId: string /** jurisdiction id --> used to start walking the tree from a particular point/node */;
  params: URLParams /** URL params to send with the request to the API */;
  propertyFilters: URLParams /** property filters to send with the request to the API */;
  readAPIEndpoint: string /** the API endpoint to get a single object */;
  serviceClass: typeof OpenSRPService /** the API helper class */;
}

/** Defaults for TreeWalker component props */
export const defaultTreeWalkerProps: TreeWalkerProps = {
  LoadingIndicator: () => <Fragment>Loading...</Fragment>,
  getAncestorsFunc: getAncestors,
  getChildrenFunc: getChildren,
  jurisdictionId: '',
  params: defaultLocationParams,
  propertyFilters: defaultLocationPropertyFilters,
  readAPIEndpoint: 'location',
  serviceClass: OpenSRPService,
};

/** Type definition for getChildren function */
type LoadChildrenType = (node: OpenSRPJurisdiction, event: Event | React.MouseEvent) => void;

/** Type def for the WithWalkerProps HoC */
export interface WithWalkerProps extends TreeWalkerProps {
  currentChildren: OpenSRPJurisdiction[] /** array of current children */;
  currentNode: OpenSRPJurisdiction | null /** the currently selected Node */;
  hierarchy: OpenSRPJurisdiction[] /** array of current hierarchy as a path from root to currentNode */;
  loadChildren: LoadChildrenType /** function to get children */;
}

/** Defaults for WithWalker higher order component props */
export const defaultWalkerProps: WithWalkerProps = {
  ...defaultTreeWalkerProps,
  currentChildren: [],
  currentNode: null,
  hierarchy: [],
  loadChildren: (_, __) => null, // dummy function that does nothing
};

/** TreeWalker Higher order Component
 *
 * This function takes in a component and returns the same component wrapped with
 * tree walking super powers.
 *
 * @param WrappedComponent - the component to wrap
 * @typeparam T - the type definition of the wrapped component's props
 */
export function withTreeWalker<T>(WrappedComponent: React.FC<T>) {
  /** The TreeWalker
   * This component adds functionality to traverse down and up a tree.
   */
  const TreeWalker = (props: TreeWalkerProps & T) => {
    const [currentChildren, setCurrentChildren] = useState<OpenSRPJurisdiction[]>([]);
    const [currentNode, setCurrentNode] = useState<OpenSRPJurisdiction | null>(null);
    const [hierarchy, setHierarchy] = useState<OpenSRPJurisdiction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const {
      LoadingIndicator,
      getAncestorsFunc,
      getChildrenFunc,
      jurisdictionId,
      params,
      propertyFilters,
      readAPIEndpoint,
      serviceClass,
    } = props;

    // Set the parentId to be the currentNode's id
    const parentId = currentNode ? currentNode.id : jurisdictionId;

    const propertiesToFilter = {
      ...propertyFilters,
      ...(parentId === '' && { geographicLevel: 0 }),
      ...(parentId !== '' && { parentId }),
    };

    const paramsToUse = {
      ...params,
      ...(Object.keys(propertiesToFilter).length > 0 && {
        properties_filter: getFilterParams(propertiesToFilter),
      }),
    };

    // When the component mounts we check if jurisdictionId is set, because if
    // it is set then we have a situation where we are loading the tree from a certain
    // node that may be a leaf, in the middle or anywhere
    // we therefore:
    //  1. get the object for jurisdictionId and set it as the currentNode
    //  2. get this currentNode's ancestors and add them to the hierarchy
    useEffect(() => {
      if (!currentNode && jurisdictionId !== '') {
        const singleService = new serviceClass(readAPIEndpoint);
        singleService
          .read(jurisdictionId, params)
          .then((response: OpenSRPJurisdiction) => {
            if (response) {
              setCurrentNode(response);
              getAncestorsFunc(response)
                .then(result => {
                  if (result.value !== null) {
                    setHierarchy(result.value);
                  } else {
                    displayError(result.error);
                  }
                })
                .catch((error: Error) => displayError(error));
            }
          })
          .catch((error: Error) => displayError(error));
      }
    }, []);

    // On component mount or whenever parentId changes, we try and get the currentNode's children
    useEffect(() => {
      getChildrenFunc(paramsToUse, currentNode)
        .then(result => {
          if (result.value !== null) {
            setCurrentChildren(result.value);
          } else {
            displayError(result.error);
          }
        })
        .finally(() => setLoading(false))
        .catch((error: Error) => displayError(error));
    }, [parentId]);

    if (loading === true) {
      return <LoadingIndicator />;
    }

    /** Function to get children of the currentNode
     *
     * This function is passed to the wrapped component and is supposed to be
     * called from there (a click or something usually).  When run, it sets the
     * currentNode to the clicked node, and adds it to the hierarchy
     *
     * @param node - the clicked node
     * @param event - the Mouse Event
     */
    const loadChildren = (node: OpenSRPJurisdiction, _: Event | React.MouseEvent) => {
      if (!hierarchy.includes(node)) {
        hierarchy.push(node);
      } else {
        // remove all elements in the array that come after node
        // hierarchy should include elements only up to the current node
        hierarchy.length = hierarchy.indexOf(node) + 1;
      }
      setHierarchy(hierarchy);
      setCurrentNode(node);
    };

    // get the props to pass down to the wrapped component
    const wrappedProps = {
      ...props,
      currentChildren,
      currentNode,
      hierarchy,
      loadChildren,
    };

    // return the wrapped component, passing all WalkerProps
    return <WrappedComponent {...wrappedProps} />;
  };

  // Set the default Props
  TreeWalker.defaultProps = {
    ...defaultWalkerProps,
  };

  return TreeWalker;
}

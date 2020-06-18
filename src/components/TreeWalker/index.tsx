import React, { Fragment, useEffect, useState } from 'react';
import { displayError } from '../../helpers/errors';
import { getFilterParams, OpenSRPService, URLParams } from '../../services/opensrp';
import { defaultLocationParams, getAncestors } from './helpers';
import { OpenSRPJurisdiction } from './types';

export interface TreeWalkerProps {
  apiEndpoint: string;
  jurisdictionId: string;
  params: URLParams;
  serviceClass: typeof OpenSRPService;
}

export const defaultTreeWalkerProps: TreeWalkerProps = {
  apiEndpoint: 'location/findByProperties',
  jurisdictionId: '',
  params: defaultLocationParams,
  serviceClass: OpenSRPService,
};

export interface WithWalkerProps extends TreeWalkerProps {
  current: OpenSRPJurisdiction[];
  hierarchy: OpenSRPJurisdiction[];
  loadMore: any;
  selectedJurisdiction: OpenSRPJurisdiction | null;
}

export const defaultWalkerProps: WithWalkerProps = {
  ...defaultTreeWalkerProps,
  current: [],
  hierarchy: [],
  loadMore: null,
  selectedJurisdiction: null,
};

// This function takes a component...
export function withTreeWalker<T>(WrappedComponent: React.FC<T>) {
  // ...and returns another component...
  const TreeWalker = (props: TreeWalkerProps & T) => {
    const [current, setCurrent] = useState<OpenSRPJurisdiction[]>([]);
    const [selectedJurisdiction, setSelectedJurisdiction] = useState<OpenSRPJurisdiction | null>(
      null
    );
    const [hierarchy, setHierarchy] = useState<OpenSRPJurisdiction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { apiEndpoint, jurisdictionId, params, serviceClass } = props;

    const service = new serviceClass(apiEndpoint);

    const parentId = selectedJurisdiction ? selectedJurisdiction.id : jurisdictionId;

    const propertiesToFilter = {
      status: 'Active',
      ...(parentId === '' && { geographicLevel: 0 }),
      ...(parentId !== '' && { parentId }),
    };

    const paramsToUse = {
      ...params,
      ...(Object.keys(propertiesToFilter).length > 0 && {
        properties_filter: getFilterParams(propertiesToFilter),
      }),
    };

    useEffect(() => {
      if (!selectedJurisdiction && jurisdictionId !== '') {
        const singleService = new OpenSRPService('location');
        singleService
          .read(jurisdictionId, params)
          .then((response: OpenSRPJurisdiction) => {
            if (response) {
              setSelectedJurisdiction(response);
              getAncestors(response)
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

    useEffect(() => {
      service
        .list(paramsToUse)
        .then((response: OpenSRPJurisdiction[]) => {
          if (response) {
            setCurrent(response);
          }
        })
        .finally(() => setLoading(false))
        .catch((error: Error) => displayError(error));
    }, [parentId]);

    if (loading === true) {
      return <Fragment>Loading...</Fragment>;
    }

    const loadMore = (item: OpenSRPJurisdiction, _: Event | React.MouseEvent) => {
      if (!hierarchy.includes(item)) {
        hierarchy.push(item);
      } else {
        // remove all elements in the array that come after item
        // hierarchy should include elements only up to the current item
        hierarchy.length = hierarchy.indexOf(item) + 1;
      }
      setHierarchy(hierarchy);
      setSelectedJurisdiction(item);
    };

    const wrappedProps = {
      ...props,
      current,
      hierarchy,
      loadMore,
      selectedJurisdiction,
    };

    return <WrappedComponent {...wrappedProps} />;
  };

  TreeWalker.defaultProps = {
    ...defaultTreeWalkerProps,
    ...defaultWalkerProps,
  };

  return TreeWalker;
}

// interface BaseProps extends WithWalkerProps {
//   smile: string;
// }

// const Base = (props: BaseProps) => {
//   const { current, hierarchy, loadMore, selectedJurisdiction, smile } = props;

//   if (current.length > 0 || selectedJurisdiction !== null) {
//     return (
//       <Fragment>
//         {selectedJurisdiction && (
//           <Fragment>
//             <h4>Currently Selected {smile}</h4>
//             <span>{selectedJurisdiction.properties.name}</span>
//           </Fragment>
//         )}
//         <h4>Path</h4>
//         {hierarchy.map((item: OpenSRPJurisdiction, index: number) => (
//           <span key={`jzz-${index}`} onClick={e => loadMore(item, e)}>
//             {' '}
//             {item.properties.name}
//             {'>> '}
//           </span>
//         ))}
//         <h4>Current children</h4>
//         <ul>
//           {current.map((item: OpenSRPJurisdiction, index: number) => (
//             <li key={`jxx-${index}`} onClick={e => loadMore(item, e)}>
//               {item.properties.name}
//             </li>
//           ))}
//         </ul>
//         ;
//       </Fragment>
//     );
//   } else {
//     return <Fragment>No Options</Fragment>;
//   }
// };

// const xxx: BaseProps = {
//   ...defaultTreeWalkerProps,
//   ...defaultWalkerProps,
//   smile: ":=)"
// };

// Base.defaultProps = xxx;

// const Simple = withTreeWalker<BaseProps>(Base);

// Simple.defaultProps = {
//   ...Simple.defaultProps,
//   // smile: ":=)"
// }

// export { Simple };

import ListView from '@onaio/list-view';
import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { ASSIGN_PLANS, HOME, NO_ROWS_FOUND } from '../../../configs/lang';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../constants';
import { LoadOpenSRPHierarchy } from '../../../helpers/dataLoading/jurisdictions';
import { OpenSRPService } from '../../../services/opensrp';
import { generateJurisdictionTree } from './utils';

interface JurisdictionSelectorTableProps {
  rootJurisdictionId: string;
  serviceClass: typeof OpenSRPService;
}

/** Route params interface */
export interface RouteParams {
  jurisdictionId: string;
  planId: string;
}

// TODO - use url to store state of currentParentId
// export type JurisdictionTableProps = RouteComponentProps<RouteParams> & BaseJurisdictionTableProps;

/** JurisdictionTable responsibilities,
 * 1). get location hierarchy from api
 *    - for this we only need the root jurisdiction
 * 2). drilling down
 */
const JurisdictionTable = (props: JurisdictionSelectorTableProps) => {
  // const { currentChildren, currentNode, hierarchy, limits, plan } = props;
  const [tree, setTree] = React.useState<any>(undefined);
  const [currentParentNode, setCurrentParent] = React.useState<any>(undefined);
  const [currentChildren, setCurrentChildren] = React.useState<any>(undefined);

  // this would be the rootJurisdiction id
  const { rootJurisdictionId } = props;

  React.useEffect(() => {
    // fetch jurisdiction hierarchy
    // TODO - define this data fetcher function : LoadOpenSRPHierarchy
    LoadOpenSRPHierarchy(rootJurisdictionId)
      .then((apiResponse: any) => {
        // create parseable tree
        const theTree = generateJurisdictionTree(apiResponse);
        setTree(theTree);
      })
      .catch(err => {
        // TODO - set page broken here.
      });

    // if currentParentNode is undefined we will set the currentChildren array to be the the root node
    if (!currentParentNode) {
      setCurrentChildren(tree.model);
    }
    // if currentParentNode is defined we will set the currentChildren array to be the currentParentNodes children
    if (currentParentNode) {
      setCurrentChildren(currentParentNode.children);
    }
  }, []);

  // do we really need the plan here
  // if (!plan) {
  //   return null;
  // }

  // TODO - fill this in
  const pageTitle = 'Jurisdictioning';
  const baseUrl = `${ASSIGN_PLAN_URL}/${'No plan survives enemy contact'}`;

  const breadcrumbProps = {
    currentPage: {
      // TODO - what should this be
      label: false ? 'loading...' : pageTitle,
      url: baseUrl,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: ASSIGN_PLANS,
        url: ASSIGN_PLAN_URL,
      },
    ],
  };

  // if (currentNode) {
  //   breadcrumbProps.pages.push({
  //     label: pageTitle,
  //     url: baseUrl,
  //   });
  // }

  // for (let index = 0; index < hierarchy.length; index++) {
  //   const element = hierarchy[index];
  //   if (index < hierarchy.length - 1) {
  //     breadcrumbProps.pages.push({
  //       label: element.properties.name,
  //       url: `${baseUrl}/${element.id}`,
  //     });
  //   } else {
  //     breadcrumbProps.currentPage = {
  //       label: element.properties.name,
  //       url: `${baseUrl}/${element.id}`,
  //     };
  //   }
  // }

  const data = currentChildren.map((node: any) => {
    return [
      <p
        key={`${node.id}-jurisdiction`}
        // node={node}
        // url={`${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${node.id}`}
        // tslint:disable-next-line: jsx-no-lambda
        onClick={e => setCurrentParent(node)}
      >
        {' '}
        {node.model.label}
      </p>,
    ];
  });
  const headerItems = ['Name'];
  const tableClass = 'table table-bordered';

  const listViewProps = {
    data,
    headerItems,
    tableClass,
  };

  return (
    <Fragment>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <ListView {...listViewProps} />
      {!data.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_ROWS_FOUND}
          <hr />
        </div>
      )}
    </Fragment>
  );
};

const defaultProps: JurisdictionSelectorTableProps = {
  rootJurisdictionId: '',
  serviceClass: OpenSRPService,
};

JurisdictionTable.defaultProps = defaultProps;

export { JurisdictionTable };

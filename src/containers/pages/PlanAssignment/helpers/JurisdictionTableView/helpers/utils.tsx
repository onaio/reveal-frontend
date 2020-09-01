import { ASSIGN_PLANS, HOME } from '../../../../../../configs/lang';
import { PlanDefinition } from '../../../../../../configs/settings';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../../../../constants';
import { TreeNode } from '../../../../../../store/ducks/opensrp/hierarchies/types';
import { JurisdictionTableListViewPropTypes } from '../../JurisdictionTableListView';

/**
 * Util function to build out pages for header breadcrumb component
 * @param props - props required to build out pages
 */
interface Pages {
  label: string;
  url: string;
}
export const pagesBuilder = (props: Partial<JurisdictionTableListViewPropTypes>) => {
  const { plan } = props;
  const pageTitle = (plan as PlanDefinition).title;
  const baseUrl = `${ASSIGN_PLAN_URL}/${(plan as PlanDefinition).identifier}`;

  const initialCurrentPage = {
    label: pageTitle,
    url: baseUrl,
  };
  const hierarchy = props.hierarchy as TreeNode[];
  let currentPage: Pages = initialCurrentPage;
  const pages: Pages[] = [
    {
      label: HOME,
      url: HOME_URL,
    },
    {
      label: ASSIGN_PLANS,
      url: ASSIGN_PLAN_URL,
    },
  ];

  // create breadcrumb props.
  if (props.match && props.match.params.jurisdictionId) {
    const path = [...hierarchy];
    const lastNode = path.pop();

    pages.push(initialCurrentPage);

    path.forEach(nd => {
      pages.push({
        label: nd.model.label,
        url: `${baseUrl}/${nd.model.id}`,
      });
    });

    currentPage = {
      label: (lastNode as TreeNode).model.label,
      url: `${baseUrl}/${(lastNode as TreeNode).model.id}`,
    };
  }
  return { currentPage, pages };
};

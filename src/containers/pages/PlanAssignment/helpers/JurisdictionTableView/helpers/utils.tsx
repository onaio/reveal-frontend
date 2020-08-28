import { ASSIGN_PLANS, HOME } from '../../../../../../configs/lang';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../../../../constants';
import { TreeNode } from '../../../../../../store/ducks/opensrp/hierarchies/types';

/**
 * Util function to build out pages for header breadcrumb component
 * @param props - props required to build out pages
 */
export const pagesBuilder = (props: any) => {
  const { plan } = props;
  const pageTitle = plan.title;
  const baseUrl = `${ASSIGN_PLAN_URL}/${plan.identifier}`;

  const initialCurrentPage = {
    label: pageTitle,
    url: baseUrl,
  };
  const hierarchy = props.hierarchy as TreeNode[];
  let currentPage = initialCurrentPage;
  const pages = [
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
  if (props.match.params.jurisdictionId) {
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

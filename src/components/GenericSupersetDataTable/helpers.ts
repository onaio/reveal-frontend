import { REPORT_MDA_POINT_PLAN_URL } from '../../constants';
import { GenericJurisdiction } from '../../store/ducks/generic/jurisdictions';
import { Page } from '../page/HeaderBreadcrumb/HeaderBreadcrumb';

/**
 * Build bread crumbs from jurisdiction data
 * @param {GenericJurisdiction[][]} jurisdictions
 * @param {string} planId
 * @param {string} jurisdictionId
 * @param {Page[]} prevPages
 * @param {string | null} pTitle
 */
export const buildBreadCrumbs = (
  jurisdictions: GenericJurisdiction[][],
  planId: string,
  jurisdictionId: string,
  prevPages: Page[] = [],
  pTitle: string | null = null
) => {
  let parentId = null;
  let parentName = null;
  let parentJurisId: string | null = null;
  jurisdictions.forEach(juris =>
    juris.forEach(jur => {
      if (jur.jurisdiction_id === jurisdictionId && jur.plan_id === planId) {
        parentId = jur.jurisdiction_path.length ? [...jur.jurisdiction_path].pop() : null;
        parentName = jur.jurisdiction_name_path.length
          ? [...jur.jurisdiction_name_path].pop()
          : null;
        pTitle = pTitle || jur.jurisdiction_name;
        parentJurisId = jur.jurisdiction_parent_id;
      }
    })
  );
  if (parentId && parentName) {
    prevPages.unshift({
      label: parentName,
      url: `${REPORT_MDA_POINT_PLAN_URL}/${planId}/${parentId}`,
    });
    if (parentJurisId) {
      buildBreadCrumbs(jurisdictions, planId, parentJurisId, prevPages, pTitle);
    }
  }

  return {
    pTitle,
    prevPages,
  };
};

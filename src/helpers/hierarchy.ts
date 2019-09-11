import { ChildrenByParentId, Jurisdiction } from '../store/ducks/jurisdictions';

/** getDescendantJurisdictionIds - recursive hierarchy util to get all ancestors of certain Jurisdictions
 * @param {string[]} ChildIds - jurisdiction_ids of the child jurisdictions for which to find ancestors
 * @param {Jurisdiction[] | {[key:string]:Jurisdiction}} jurisdictions- list or key/value map of Jurisdictions through which to search for descendants
 * @param {boolean} doIncludeChildIds - to determine whether or not to include ChildId strings in returned list
 * @returns {string[]} list of jurisdiction_ids of all ancestors
 */
export const getAncestorJurisdictionIds = (
  ChildIds: string[],
  jurisdictions: Jurisdiction[] | { [key: string]: Jurisdiction },
  doIncludeChildIds: boolean = true
): string[] => {
  let ancestorIds: string[] = [];
  const childIds: string[] = [...ChildIds];

  let jurisdictionsById: { [key: string]: Jurisdiction } = {};
  if (Array.isArray(jurisdictions)) {
    for (const jurisdiction of jurisdictions) {
      jurisdictionsById[jurisdiction.jurisdiction_id] = jurisdiction;
    }
  } else {
    jurisdictionsById = { ...jurisdictions };
  }
  if (!Object.keys(jurisdictionsById).length) {
    return doIncludeChildIds ? childIds : [];
  }

  for (const childId of childIds) {
    if (doIncludeChildIds) {
      ancestorIds.push(childId);
    }
    if (jurisdictionsById[childId]) {
      const { parent_id: parentId } = jurisdictionsById[childId];
      if (parentId && parentId !== 'null' && parentId.length) {
        const parentIds = getAncestorJurisdictionIds(
          [parentId],
          jurisdictionsById,
          doIncludeChildIds
        );
        ancestorIds = [...ancestorIds, ...parentIds];
      }
    }
  }

  return Array.from(new Set(ancestorIds));
};

/** getChildrenByParentId - utility to decendant jurisdictions, jurisdictionsArray MUST be sorted by geographic_level from high to low
 * @param {Jurisdiction[]} jurisdictionsArray - the sorted list of all jurisdictions
 * @returns {ChildrenByParentId} - object with references to all parent:child relationships
 */
export const getChildrenByParentId = (jurisdictionsArray: Jurisdiction[]): ChildrenByParentId => {
  const childrenByParentId: { [key: string]: string[] } = {};
  for (const j of jurisdictionsArray) {
    if (j.parent_id) {
      if (!childrenByParentId[j.parent_id]) {
        childrenByParentId[j.parent_id] = [];
      }
      childrenByParentId[j.parent_id].push(j.jurisdiction_id);
      if (childrenByParentId[j.jurisdiction_id]) {
        childrenByParentId[j.parent_id] = childrenByParentId[j.parent_id].concat(
          childrenByParentId[j.jurisdiction_id]
        );
      }
    }
  }
  return childrenByParentId;
};

/** getChildlessChildrenIds - hierarchy util to get all childless descendants of certain Jurisdictions
 * @param {Jurisdiction[]} filteredJurisdictions - list of Jurisdictions of which to find the childless descendants
 * @returns {string[]} list of jurisdiction_ids of childless descendants
 */
export const getChildlessChildrenIds = (filteredJurisdictions: Jurisdiction[]): string[] => {
  const childlessChildrenIds = filteredJurisdictions.map(j => j.jurisdiction_id);
  let jndex = 0;

  for (const jurisdiction of filteredJurisdictions) {
    if (jurisdiction && jurisdiction.parent_id) {
      jndex = childlessChildrenIds.indexOf(jurisdiction.parent_id);
      if (jndex !== -1) {
        childlessChildrenIds.splice(jndex, 1);
      }
    }
  }

  return childlessChildrenIds;
};

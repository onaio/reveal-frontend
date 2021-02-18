import { JurisdictionOption } from '../JurisdictionSelect';

export interface JurisdictionTree {
  id: string;
  key: string;
  label: string;
  node: JurisdictionTree[];
  parentId: string;
}
export const buildLocationTree = (
  jurisdictions: JurisdictionOption[],
  parentId: string
): JurisdictionTree[] => {
  const tree: JurisdictionTree[] = jurisdictions.map(jur => ({
    id: jur.id,
    key: jur.id,
    label: jur.properties.name,
    node: [],
    parentId,
  }));
  return tree;
};

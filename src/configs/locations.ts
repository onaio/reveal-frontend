/** Interface that describes location itsm */
export interface LocationItem {
  identifier: string;
  name: string;
}

/** Location item hierarchy
 * This is a list of locations starting from the largest hierarchical unit to
 * the smallest.
 */
export const locationHierarchy: LocationItem[] = [
  {
    identifier: 'province',
    name: 'Province',
  },
  {
    identifier: 'district',
    name: 'District',
  },
  {
    identifier: 'canton',
    name: 'Canton',
  },
  {
    identifier: 'village',
    name: 'Village',
  },
];

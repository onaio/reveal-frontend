// eslint-disable-next-line import/prefer-default-export
export const indicatorRows = [
  {
    accessor: 'treatment_coverage',
    denominator: 'official_population',
    description: '',
    numerator: 'total_all_genders',
    title: 'Treatment Coverage (Census)',
    unit: 'People',
  },
  {
    accessor: 'other_pop_coverage',
    denominator: 'other_pop_target',
    description: '',
    numerator: 'total_all_genders',
    title: 'Other Pop Coverage (Unofficial)',
    unit: 'People',
  },
  {
    accessor: 'total_all_genders',
    listDisplay: true,
    title: 'Total Treated',
    unit: 'People',
  },
  {
    accessor: 'adminstered',
    listDisplay: true,
    title: 'Drugs Administered',
    unit: 'Tablets',
  },
  {
    accessor: 'damaged',
    listDisplay: true,
    title: 'Drugs Damaged',
    unit: 'Tablets',
  },
];

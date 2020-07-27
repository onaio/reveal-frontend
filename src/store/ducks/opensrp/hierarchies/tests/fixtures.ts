// tslint:disable: object-literal-sort-keys
import { RawOpenSRPHierarchy } from '../types';

export const sampleHierarchy: RawOpenSRPHierarchy = {
  locationsHierarchy: {
    map: {
      '2942': {
        id: '2942',
        label: 'Lusaka',
        node: {
          locationId: '2942',
          name: 'Lusaka',
          attributes: {
            geographicLevel: 0,
          },
          voided: false,
        },
        children: {
          '3019': {
            id: '3019',
            label: 'Mtendere',
            node: {
              locationId: '3019',
              name: 'Mtendere',
              parentLocation: {
                locationId: '2942',
                voided: false,
              },
              attributes: {
                structureCount: 1,
                geographicLevel: 1,
              },
              voided: false,
            },
            children: {
              '3951': {
                id: '3951',
                label: 'Akros_1',
                node: {
                  locationId: '3951',
                  name: 'Akros_1',
                  parentLocation: {
                    locationId: '3019',
                    voided: false,
                  },
                  attributes: {
                    structureCount: 159,
                    geographicLevel: 2,
                  },
                  voided: false,
                },
                parent: '3019',
              },
            },
            parent: '2942',
          },
        },
      },
    },
    parentChildren: {
      '2942': ['3019'],
      '3019': ['3951'],
    },
  },
};

export const anotherHierarchy: RawOpenSRPHierarchy = {
  locationsHierarchy: {
    map: {
      '1337': {
        id: '1337',
        label: 'Lusaka',
        node: {
          locationId: '1337',
          name: 'Lusaka',
          attributes: {
            geographicLevel: 0,
          },
          voided: false,
        },
        children: {
          '7331': {
            id: '7331',
            label: 'Mtendere',
            node: {
              locationId: '7331',
              name: 'Mtendere',
              parentLocation: {
                locationId: '1337',
                voided: false,
              },
              attributes: {
                structureCount: 1,
                geographicLevel: 1,
              },
              voided: false,
            },
            parent: '1337',
          },
        },
      },
    },
    parentChildren: {
      '1337': ['7331'],
    },
  },
};

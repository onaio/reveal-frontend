// tslint:disable: object-literal-sort-keys
import { RawOpenSRPHierarchy } from '../types';

// tslint:disable-next-line: no-var-requires
export const zambiaHierarchy = require('./ZambiaHierarchy.json');

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
            structureCount: 159,
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
                structureCount: 159,
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

export const sampleHierarchyWithoutStructures: RawOpenSRPHierarchy = {
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

export const raZambiaHierarchy: RawOpenSRPHierarchy = {
  locationsHierarchy: {
    map: {
      '0ddd9ad1-452b-4825-a92a-49cb9fc82d18': {
        id: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
        label: 'ra Zambia',
        node: {
          locationId: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
          name: 'ra Zambia',
          attributes: {
            structureCount: 13,
            geographicLevel: 0,
          },
          voided: false,
        },
        children: {
          '2942': {
            id: '2942',
            label: 'Lusaka',
            node: {
              locationId: '2942',
              name: 'Lusaka',
              parentLocation: {
                locationId: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
                voided: false,
              },
              attributes: {
                structureCount: 13,
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
                    structureCount: 13,
                    geographicLevel: 1,
                  },
                  voided: false,
                },
                children: {
                  '1337': {
                    id: '1337',
                    label: 'REVEAL TEST',
                    node: {
                      locationId: '1337',
                      name: 'REVEAL TEST',
                      parentLocation: {
                        locationId: '3019',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 2,
                      },
                      voided: false,
                    },
                    parent: '3019',
                  },
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
                        structureCount: 13,
                        geographicLevel: 2,
                      },
                      voided: false,
                    },
                    parent: '3019',
                  },
                  '3952': {
                    id: '3952',
                    label: 'Akros_2',
                    node: {
                      locationId: '3952',
                      name: 'Akros_2',
                      parentLocation: {
                        locationId: '3019',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 2,
                      },
                      voided: false,
                    },
                    parent: '3019',
                  },
                  '45017166-cc14-4f2f-b83f-4a72ce17bf91': {
                    id: '45017166-cc14-4f2f-b83f-4a72ce17bf91',
                    label: 'Akros_3',
                    node: {
                      locationId: '45017166-cc14-4f2f-b83f-4a72ce17bf91',
                      name: 'Akros_3',
                      parentLocation: {
                        locationId: '3019',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 2,
                      },
                      voided: false,
                    },
                    parent: '3019',
                  },
                },
                parent: '2942',
              },
              '16b09bff-3293-4863-b7a5-bb852b7df69f': {
                id: '16b09bff-3293-4863-b7a5-bb852b7df69f',
                label: 'Lusaka District',
                node: {
                  locationId: '16b09bff-3293-4863-b7a5-bb852b7df69f',
                  name: 'Lusaka District',
                  parentLocation: {
                    locationId: '2942',
                    voided: false,
                  },
                  attributes: {
                    structureCount: 0,
                    geographicLevel: 1,
                  },
                  voided: false,
                },
                parent: '2942',
              },
            },
            parent: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
          },
          '615dcd30-cc67-4f6b-812f-90da37f4a911': {
            id: '615dcd30-cc67-4f6b-812f-90da37f4a911',
            label: 'ra Eastern',
            node: {
              locationId: '615dcd30-cc67-4f6b-812f-90da37f4a911',
              name: 'ra Eastern',
              parentLocation: {
                locationId: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
                voided: false,
              },
              attributes: {
                structureCount: 0,
                geographicLevel: 1,
              },
              voided: false,
            },
            children: {
              'd7d22c6d-f02f-4631-bebd-21fecc111ddc': {
                id: 'd7d22c6d-f02f-4631-bebd-21fecc111ddc',
                label: 'ra Chadiza',
                node: {
                  locationId: 'd7d22c6d-f02f-4631-bebd-21fecc111ddc',
                  name: 'ra Chadiza',
                  parentLocation: {
                    locationId: '615dcd30-cc67-4f6b-812f-90da37f4a911',
                    voided: false,
                  },
                  attributes: {
                    structureCount: 0,
                    geographicLevel: 2,
                  },
                  voided: false,
                },
                children: {
                  'a185de87-b77b-4b8a-9570-0cb3843fafde': {
                    id: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                    label: 'ra Chadiza RHC',
                    node: {
                      locationId: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                      name: 'ra Chadiza RHC',
                      parentLocation: {
                        locationId: 'd7d22c6d-f02f-4631-bebd-21fecc111ddc',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      'fa351dc7-478c-4be9-be60-de05827dba8e': {
                        id: 'fa351dc7-478c-4be9-be60-de05827dba8e',
                        label: 'ra_CDZ_139g',
                        node: {
                          locationId: 'fa351dc7-478c-4be9-be60-de05827dba8e',
                          name: 'ra_CDZ_139g',
                          parentLocation: {
                            locationId: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                      },
                      'c3ab6b62-48da-42d1-9952-83c8d30e87da': {
                        id: 'c3ab6b62-48da-42d1-9952-83c8d30e87da',
                        label: 'ra_CDZ_139e',
                        node: {
                          locationId: 'c3ab6b62-48da-42d1-9952-83c8d30e87da',
                          name: 'ra_CDZ_139e',
                          parentLocation: {
                            locationId: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                      },
                      'f094e646-cb70-4f76-a451-ab9d24e61405': {
                        id: 'f094e646-cb70-4f76-a451-ab9d24e61405',
                        label: 'ra_CDZ_139f',
                        node: {
                          locationId: 'f094e646-cb70-4f76-a451-ab9d24e61405',
                          name: 'ra_CDZ_139f',
                          parentLocation: {
                            locationId: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                      },
                      '122adc11-e7ab-4fe8-84dd-9853c5587456': {
                        id: '122adc11-e7ab-4fe8-84dd-9853c5587456',
                        label: 'ra_CDZ_139b',
                        node: {
                          locationId: '122adc11-e7ab-4fe8-84dd-9853c5587456',
                          name: 'ra_CDZ_139b',
                          parentLocation: {
                            locationId: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                      },
                      'cd5ec29e-6be9-41a2-9b88-bc81fbc691c6': {
                        id: 'cd5ec29e-6be9-41a2-9b88-bc81fbc691c6',
                        label: 'ra_CDZ_139a',
                        node: {
                          locationId: 'cd5ec29e-6be9-41a2-9b88-bc81fbc691c6',
                          name: 'ra_CDZ_139a',
                          parentLocation: {
                            locationId: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: 'a185de87-b77b-4b8a-9570-0cb3843fafde',
                      },
                    },
                    parent: 'd7d22c6d-f02f-4631-bebd-21fecc111ddc',
                  },
                },
                parent: '615dcd30-cc67-4f6b-812f-90da37f4a911',
              },
              '3b383ab0-58f0-49e9-bc2c-04f64ead38d3': {
                id: '3b383ab0-58f0-49e9-bc2c-04f64ead38d3',
                label: 'ra Sinda',
                node: {
                  locationId: '3b383ab0-58f0-49e9-bc2c-04f64ead38d3',
                  name: 'ra Sinda',
                  parentLocation: {
                    locationId: '615dcd30-cc67-4f6b-812f-90da37f4a911',
                    voided: false,
                  },
                  attributes: {
                    structureCount: 0,
                    geographicLevel: 2,
                  },
                  voided: false,
                },
                children: {
                  '3f1c681d-fb4d-4b9c-9304-653ae8c30763': {
                    id: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                    label: 'ra Sinda RHC',
                    node: {
                      locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      name: 'ra Sinda RHC',
                      parentLocation: {
                        locationId: '3b383ab0-58f0-49e9-bc2c-04f64ead38d3',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      '43d7bc64-9a09-4f86-8fab-0932d91a90da': {
                        id: '43d7bc64-9a09-4f86-8fab-0932d91a90da',
                        label: 'ra_SND_46',
                        node: {
                          locationId: '43d7bc64-9a09-4f86-8fab-0932d91a90da',
                          name: 'ra_SND_46',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      'b8ba9743-839d-49d0-9717-668e42dae76d': {
                        id: 'b8ba9743-839d-49d0-9717-668e42dae76d',
                        label: 'ra_SND_16',
                        node: {
                          locationId: 'b8ba9743-839d-49d0-9717-668e42dae76d',
                          name: 'ra_SND_16',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      'e072f6fe-6cbc-498b-a9d8-48c11756cf3a': {
                        id: 'e072f6fe-6cbc-498b-a9d8-48c11756cf3a',
                        label: 'ra_SND_40',
                        node: {
                          locationId: 'e072f6fe-6cbc-498b-a9d8-48c11756cf3a',
                          name: 'ra_SND_40',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '7fcadf7a-5c5f-4103-956f-159107464901': {
                        id: '7fcadf7a-5c5f-4103-956f-159107464901',
                        label: 'ra_SND_49',
                        node: {
                          locationId: '7fcadf7a-5c5f-4103-956f-159107464901',
                          name: 'ra_SND_49',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '8a89f423-5ff2-4410-b18c-6bf19be62ca9': {
                        id: '8a89f423-5ff2-4410-b18c-6bf19be62ca9',
                        label: 'ra_SND_48',
                        node: {
                          locationId: '8a89f423-5ff2-4410-b18c-6bf19be62ca9',
                          name: 'ra_SND_48',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '732f0521-0d19-4b18-8be8-32cb1f6fee81': {
                        id: '732f0521-0d19-4b18-8be8-32cb1f6fee81',
                        label: 'ra_SND_41',
                        node: {
                          locationId: '732f0521-0d19-4b18-8be8-32cb1f6fee81',
                          name: 'ra_SND_41',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      'c0c3d28c-2bb7-499c-95bb-532f7ce0e9ca': {
                        id: 'c0c3d28c-2bb7-499c-95bb-532f7ce0e9ca',
                        label: 'ra_SND_36',
                        node: {
                          locationId: 'c0c3d28c-2bb7-499c-95bb-532f7ce0e9ca',
                          name: 'ra_SND_36',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      'bf656324-52c1-406d-9ce8-5ed86dd92068': {
                        id: 'bf656324-52c1-406d-9ce8-5ed86dd92068',
                        label: 'ra_SND_43',
                        node: {
                          locationId: 'bf656324-52c1-406d-9ce8-5ed86dd92068',
                          name: 'ra_SND_43',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '75891988-0f54-4a08-8d25-fcf7ce4f6bfe': {
                        id: '75891988-0f54-4a08-8d25-fcf7ce4f6bfe',
                        label: 'ra_SND_38',
                        node: {
                          locationId: '75891988-0f54-4a08-8d25-fcf7ce4f6bfe',
                          name: 'ra_SND_38',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '621f83ee-9f74-41be-9eb1-54637bcb5764': {
                        id: '621f83ee-9f74-41be-9eb1-54637bcb5764',
                        label: 'ra_SND_44',
                        node: {
                          locationId: '621f83ee-9f74-41be-9eb1-54637bcb5764',
                          name: 'ra_SND_44',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '5c8cdeac-cd87-48a8-a15a-8dc7b85a7f0c': {
                        id: '5c8cdeac-cd87-48a8-a15a-8dc7b85a7f0c',
                        label: 'ra_SND_50',
                        node: {
                          locationId: '5c8cdeac-cd87-48a8-a15a-8dc7b85a7f0c',
                          name: 'ra_SND_50',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '6144fdc0-3e6d-4ada-b066-a013e9e03a8a': {
                        id: '6144fdc0-3e6d-4ada-b066-a013e9e03a8a',
                        label: 'ra_SND_34',
                        node: {
                          locationId: '6144fdc0-3e6d-4ada-b066-a013e9e03a8a',
                          name: 'ra_SND_34',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '68be6cee-883c-4b26-8624-0c970c08c340': {
                        id: '68be6cee-883c-4b26-8624-0c970c08c340',
                        label: 'ra_SND_47',
                        node: {
                          locationId: '68be6cee-883c-4b26-8624-0c970c08c340',
                          name: 'ra_SND_47',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      '95b2d613-7281-41f6-be4b-214490138362': {
                        id: '95b2d613-7281-41f6-be4b-214490138362',
                        label: 'ra_SND_51',
                        node: {
                          locationId: '95b2d613-7281-41f6-be4b-214490138362',
                          name: 'ra_SND_51',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                      'dbf0b4c0-2c06-41de-968c-18111f31b7c7': {
                        id: 'dbf0b4c0-2c06-41de-968c-18111f31b7c7',
                        label: 'ra_SND_35',
                        node: {
                          locationId: 'dbf0b4c0-2c06-41de-968c-18111f31b7c7',
                          name: 'ra_SND_35',
                          parentLocation: {
                            locationId: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3f1c681d-fb4d-4b9c-9304-653ae8c30763',
                      },
                    },
                    parent: '3b383ab0-58f0-49e9-bc2c-04f64ead38d3',
                  },
                },
                parent: '615dcd30-cc67-4f6b-812f-90da37f4a911',
              },
              '4f39cd47-c548-4934-976e-b82b20d5ad94': {
                id: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                label: 'ra Chipata_Training',
                node: {
                  locationId: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                  name: 'ra Chipata_Training',
                  parentLocation: {
                    locationId: '615dcd30-cc67-4f6b-812f-90da37f4a911',
                    voided: false,
                  },
                  attributes: {
                    structureCount: 0,
                    geographicLevel: 2,
                  },
                  voided: false,
                },
                children: {
                  '1f42b054-67ee-4514-b0a2-19bd4592981c': {
                    id: '1f42b054-67ee-4514-b0a2-19bd4592981c',
                    label: 'ra Urban Health Centre',
                    node: {
                      locationId: '1f42b054-67ee-4514-b0a2-19bd4592981c',
                      name: 'ra Urban Health Centre',
                      parentLocation: {
                        locationId: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      '585150ca-3cf5-42eb-baba-edef50b4f7b2': {
                        id: '585150ca-3cf5-42eb-baba-edef50b4f7b2',
                        label: 'ra uhc_4',
                        node: {
                          locationId: '585150ca-3cf5-42eb-baba-edef50b4f7b2',
                          name: 'ra uhc_4',
                          parentLocation: {
                            locationId: '1f42b054-67ee-4514-b0a2-19bd4592981c',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '1f42b054-67ee-4514-b0a2-19bd4592981c',
                      },
                    },
                    parent: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                  },
                  '3da74c5a-ae66-4cf2-b62a-11ac97225be4': {
                    id: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                    label: 'ra Walela',
                    node: {
                      locationId: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                      name: 'ra Walela',
                      parentLocation: {
                        locationId: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      'eb01ce8d-d9e3-4425-82a5-c5ca31abe37e': {
                        id: 'eb01ce8d-d9e3-4425-82a5-c5ca31abe37e',
                        label: 'ra wll_5',
                        node: {
                          locationId: 'eb01ce8d-d9e3-4425-82a5-c5ca31abe37e',
                          name: 'ra wll_5',
                          parentLocation: {
                            locationId: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                      },
                      '41ce8608-60c9-4a22-bccb-20a9e24439f7': {
                        id: '41ce8608-60c9-4a22-bccb-20a9e24439f7',
                        label: 'ra wll_10',
                        node: {
                          locationId: '41ce8608-60c9-4a22-bccb-20a9e24439f7',
                          name: 'ra wll_10',
                          parentLocation: {
                            locationId: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                      },
                      '276e1c5c-599e-47b9-8fc8-c5d5c9879fac': {
                        id: '276e1c5c-599e-47b9-8fc8-c5d5c9879fac',
                        label: 'ra wll_7',
                        node: {
                          locationId: '276e1c5c-599e-47b9-8fc8-c5d5c9879fac',
                          name: 'ra wll_7',
                          parentLocation: {
                            locationId: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
                      },
                    },
                    parent: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                  },
                  'eb36c9ab-a686-4cfc-8781-06c45b8a3226': {
                    id: 'eb36c9ab-a686-4cfc-8781-06c45b8a3226',
                    label: 'ra Kapata',
                    node: {
                      locationId: 'eb36c9ab-a686-4cfc-8781-06c45b8a3226',
                      name: 'ra Kapata',
                      parentLocation: {
                        locationId: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      'd041cc6a-4428-4789-afe8-2b644e6d637e': {
                        id: 'd041cc6a-4428-4789-afe8-2b644e6d637e',
                        label: 'ra_kpt_5',
                        node: {
                          locationId: 'd041cc6a-4428-4789-afe8-2b644e6d637e',
                          name: 'ra_kpt_5',
                          parentLocation: {
                            locationId: 'eb36c9ab-a686-4cfc-8781-06c45b8a3226',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: 'eb36c9ab-a686-4cfc-8781-06c45b8a3226',
                      },
                    },
                    parent: '4f39cd47-c548-4934-976e-b82b20d5ad94',
                  },
                },
                parent: '615dcd30-cc67-4f6b-812f-90da37f4a911',
              },
            },
            parent: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
          },
          'cec79f21-33c3-43f5-a8af-59a47aa61b84': {
            id: 'cec79f21-33c3-43f5-a8af-59a47aa61b84',
            label: 'ra Luapula',
            node: {
              locationId: 'cec79f21-33c3-43f5-a8af-59a47aa61b84',
              name: 'ra Luapula',
              parentLocation: {
                locationId: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
                voided: false,
              },
              attributes: {
                structureCount: 0,
                geographicLevel: 1,
              },
              voided: false,
            },
            children: {
              'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63': {
                id: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
                label: 'ra Nchelenge',
                node: {
                  locationId: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
                  name: 'ra Nchelenge',
                  parentLocation: {
                    locationId: 'cec79f21-33c3-43f5-a8af-59a47aa61b84',
                    voided: false,
                  },
                  attributes: {
                    structureCount: 0,
                    geographicLevel: 2,
                  },
                  voided: false,
                },
                children: {
                  '8d44d54e-8b4c-465c-9e93-364a25739a6d': {
                    id: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                    label: 'ra Kashikishi HAHC',
                    node: {
                      locationId: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                      name: 'ra Kashikishi HAHC',
                      parentLocation: {
                        locationId: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      'c138d117-bf30-48b2-804e-964b4891ea51': {
                        id: 'c138d117-bf30-48b2-804e-964b4891ea51',
                        label: 'ra_ksh_5',
                        node: {
                          locationId: 'c138d117-bf30-48b2-804e-964b4891ea51',
                          name: 'ra_ksh_5',
                          parentLocation: {
                            locationId: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                      },
                      'fca0d71d-0410-45d3-8305-a9f092a150b8': {
                        id: 'fca0d71d-0410-45d3-8305-a9f092a150b8',
                        label: 'ra_ksh_2',
                        node: {
                          locationId: 'fca0d71d-0410-45d3-8305-a9f092a150b8',
                          name: 'ra_ksh_2',
                          parentLocation: {
                            locationId: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                      },
                      'f08c0535-0837-4813-8b5b-3c9f8c223879': {
                        id: 'f08c0535-0837-4813-8b5b-3c9f8c223879',
                        label: 'ra_ksh_3',
                        node: {
                          locationId: 'f08c0535-0837-4813-8b5b-3c9f8c223879',
                          name: 'ra_ksh_3',
                          parentLocation: {
                            locationId: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
                      },
                    },
                    parent: 'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63',
                  },
                },
                parent: 'cec79f21-33c3-43f5-a8af-59a47aa61b84',
              },
            },
            parent: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
          },
          '344db33a-06c1-423b-8499-34c9afc0dbbd': {
            id: '344db33a-06c1-423b-8499-34c9afc0dbbd',
            label: 'ra Lusaka',
            node: {
              locationId: '344db33a-06c1-423b-8499-34c9afc0dbbd',
              name: 'ra Lusaka',
              parentLocation: {
                locationId: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
                voided: false,
              },
              attributes: {
                structureCount: 0,
                geographicLevel: 1,
              },
              voided: false,
            },
            children: {
              'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92': {
                id: 'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92',
                label: 'Lusaka_Test',
                node: {
                  locationId: 'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92',
                  name: 'Lusaka_Test',
                  parentLocation: {
                    locationId: '344db33a-06c1-423b-8499-34c9afc0dbbd',
                    voided: false,
                  },
                  attributes: {
                    structureCount: 0,
                    geographicLevel: 2,
                  },
                  voided: false,
                },
                children: {
                  '72b1d831-ecae-485c-8e2b-dca21320cc12': {
                    id: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                    label: 'Lusaka SE HFC',
                    node: {
                      locationId: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                      name: 'Lusaka SE HFC',
                      parentLocation: {
                        locationId: 'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      '23ecae4b-0254-4001-849b-b4a68b7f6f6c': {
                        id: '23ecae4b-0254-4001-849b-b4a68b7f6f6c',
                        label: 'NMEP_1',
                        node: {
                          locationId: '23ecae4b-0254-4001-849b-b4a68b7f6f6c',
                          name: 'NMEP_1',
                          parentLocation: {
                            locationId: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                      },
                      '32efe2aa-a138-427d-8612-99eb6cebe6d6': {
                        id: '32efe2aa-a138-427d-8612-99eb6cebe6d6',
                        label: 'Chifwema',
                        node: {
                          locationId: '32efe2aa-a138-427d-8612-99eb6cebe6d6',
                          name: 'Chifwema',
                          parentLocation: {
                            locationId: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                      },
                      'd9a5b7f3-84d0-4e02-9c30-25bfe02e2158': {
                        id: 'd9a5b7f3-84d0-4e02-9c30-25bfe02e2158',
                        label: 'NMEP_2',
                        node: {
                          locationId: 'd9a5b7f3-84d0-4e02-9c30-25bfe02e2158',
                          name: 'NMEP_2',
                          parentLocation: {
                            locationId: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                      },
                      'bdb31192-4418-462e-98ea-39dbfe327e53': {
                        id: 'bdb31192-4418-462e-98ea-39dbfe327e53',
                        label: 'Leopards Rock',
                        node: {
                          locationId: 'bdb31192-4418-462e-98ea-39dbfe327e53',
                          name: 'Leopards Rock',
                          parentLocation: {
                            locationId: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                      },
                      '2c5b48ed-55a0-46f2-b1ee-7a2dad9e81f6': {
                        id: '2c5b48ed-55a0-46f2-b1ee-7a2dad9e81f6',
                        label: 'Mwambula Village',
                        node: {
                          locationId: '2c5b48ed-55a0-46f2-b1ee-7a2dad9e81f6',
                          name: 'Mwambula Village',
                          parentLocation: {
                            locationId: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                      },
                      '91404f45-5961-42c7-8daa-7ab15e10741c': {
                        id: '91404f45-5961-42c7-8daa-7ab15e10741c',
                        label: 'NMEP_3',
                        node: {
                          locationId: '91404f45-5961-42c7-8daa-7ab15e10741c',
                          name: 'NMEP_3',
                          parentLocation: {
                            locationId: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '72b1d831-ecae-485c-8e2b-dca21320cc12',
                      },
                    },
                    parent: 'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92',
                  },
                  '12837b88-eb07-4d94-90cd-93e641cbc42f': {
                    id: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                    label: 'Lusaka HFC',
                    node: {
                      locationId: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                      name: 'Lusaka HFC',
                      parentLocation: {
                        locationId: 'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92',
                        voided: false,
                      },
                      attributes: {
                        structureCount: 0,
                        geographicLevel: 3,
                      },
                      voided: false,
                    },
                    children: {
                      'e451cf65-969f-4622-8f91-14e7292bf632': {
                        id: 'e451cf65-969f-4622-8f91-14e7292bf632',
                        label: 'Ibex_1',
                        node: {
                          locationId: 'e451cf65-969f-4622-8f91-14e7292bf632',
                          name: 'Ibex_1',
                          parentLocation: {
                            locationId: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                      },
                      '96c02ef3-e157-4c41-a97d-4e8cef68801e': {
                        id: '96c02ef3-e157-4c41-a97d-4e8cef68801e',
                        label: 'Akros 3',
                        node: {
                          locationId: '96c02ef3-e157-4c41-a97d-4e8cef68801e',
                          name: 'Akros 3',
                          parentLocation: {
                            locationId: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                      },
                      '84bb9e5a-6c68-4e70-a083-b63cf050dd0f': {
                        id: '84bb9e5a-6c68-4e70-a083-b63cf050dd0f',
                        label: 'Bauleni Settlement',
                        node: {
                          locationId: '84bb9e5a-6c68-4e70-a083-b63cf050dd0f',
                          name: 'Bauleni Settlement',
                          parentLocation: {
                            locationId: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                      },
                      '965583fd-0dd8-4a76-903c-509e9c2c3f10': {
                        id: '965583fd-0dd8-4a76-903c-509e9c2c3f10',
                        label: 'Akros_2',
                        node: {
                          locationId: '965583fd-0dd8-4a76-903c-509e9c2c3f10',
                          name: 'Akros_2',
                          parentLocation: {
                            locationId: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                      },
                      '67a6f711-41f0-4fd1-8f01-4acc4bbaa9bb': {
                        id: '67a6f711-41f0-4fd1-8f01-4acc4bbaa9bb',
                        label: 'Kalikiliki Settlement',
                        node: {
                          locationId: '67a6f711-41f0-4fd1-8f01-4acc4bbaa9bb',
                          name: 'Kalikiliki Settlement',
                          parentLocation: {
                            locationId: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                      },
                      'ac48eb49-876c-41e7-9642-97600698c3a8': {
                        id: 'ac48eb49-876c-41e7-9642-97600698c3a8',
                        label: 'Helen Kaunda Settlement',
                        node: {
                          locationId: 'ac48eb49-876c-41e7-9642-97600698c3a8',
                          name: 'Helen Kaunda Settlement',
                          parentLocation: {
                            locationId: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                            voided: false,
                          },
                          attributes: {
                            structureCount: 0,
                            geographicLevel: 4,
                          },
                          voided: false,
                        },
                        parent: '12837b88-eb07-4d94-90cd-93e641cbc42f',
                      },
                    },
                    parent: 'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92',
                  },
                },
                parent: '344db33a-06c1-423b-8499-34c9afc0dbbd',
              },
            },
            parent: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
          },
        },
      },
    },
    parentChildren: {
      '0ddd9ad1-452b-4825-a92a-49cb9fc82d18': [
        '2942',
        '615dcd30-cc67-4f6b-812f-90da37f4a911',
        'cec79f21-33c3-43f5-a8af-59a47aa61b84',
        '344db33a-06c1-423b-8499-34c9afc0dbbd',
      ],
      '8d44d54e-8b4c-465c-9e93-364a25739a6d': [
        'c138d117-bf30-48b2-804e-964b4891ea51',
        'fca0d71d-0410-45d3-8305-a9f092a150b8',
        'f08c0535-0837-4813-8b5b-3c9f8c223879',
      ],
      '3da74c5a-ae66-4cf2-b62a-11ac97225be4': [
        'eb01ce8d-d9e3-4425-82a5-c5ca31abe37e',
        '41ce8608-60c9-4a22-bccb-20a9e24439f7',
        '276e1c5c-599e-47b9-8fc8-c5d5c9879fac',
      ],
      '72b1d831-ecae-485c-8e2b-dca21320cc12': [
        '23ecae4b-0254-4001-849b-b4a68b7f6f6c',
        '32efe2aa-a138-427d-8612-99eb6cebe6d6',
        'd9a5b7f3-84d0-4e02-9c30-25bfe02e2158',
        'bdb31192-4418-462e-98ea-39dbfe327e53',
        '2c5b48ed-55a0-46f2-b1ee-7a2dad9e81f6',
        '91404f45-5961-42c7-8daa-7ab15e10741c',
      ],
      'dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63': ['8d44d54e-8b4c-465c-9e93-364a25739a6d'],
      '344db33a-06c1-423b-8499-34c9afc0dbbd': ['cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92'],
      'a185de87-b77b-4b8a-9570-0cb3843fafde': [
        'fa351dc7-478c-4be9-be60-de05827dba8e',
        'c3ab6b62-48da-42d1-9952-83c8d30e87da',
        'f094e646-cb70-4f76-a451-ab9d24e61405',
        '122adc11-e7ab-4fe8-84dd-9853c5587456',
        'cd5ec29e-6be9-41a2-9b88-bc81fbc691c6',
      ],
      '1f42b054-67ee-4514-b0a2-19bd4592981c': ['585150ca-3cf5-42eb-baba-edef50b4f7b2'],
      'd7d22c6d-f02f-4631-bebd-21fecc111ddc': ['a185de87-b77b-4b8a-9570-0cb3843fafde'],
      '3019': ['1337', '3951', '3952', '45017166-cc14-4f2f-b83f-4a72ce17bf91'],
      '4f39cd47-c548-4934-976e-b82b20d5ad94': [
        '1f42b054-67ee-4514-b0a2-19bd4592981c',
        '3da74c5a-ae66-4cf2-b62a-11ac97225be4',
        'eb36c9ab-a686-4cfc-8781-06c45b8a3226',
      ],
      '3b383ab0-58f0-49e9-bc2c-04f64ead38d3': ['3f1c681d-fb4d-4b9c-9304-653ae8c30763'],
      '2942': ['3019', '16b09bff-3293-4863-b7a5-bb852b7df69f'],
      'cf73cddf-8d36-4b3c-af7b-4d5e2cd80c92': [
        '72b1d831-ecae-485c-8e2b-dca21320cc12',
        '12837b88-eb07-4d94-90cd-93e641cbc42f',
      ],
      '615dcd30-cc67-4f6b-812f-90da37f4a911': [
        'd7d22c6d-f02f-4631-bebd-21fecc111ddc',
        '3b383ab0-58f0-49e9-bc2c-04f64ead38d3',
        '4f39cd47-c548-4934-976e-b82b20d5ad94',
      ],
      'eb36c9ab-a686-4cfc-8781-06c45b8a3226': ['d041cc6a-4428-4789-afe8-2b644e6d637e'],
      '12837b88-eb07-4d94-90cd-93e641cbc42f': [
        'e451cf65-969f-4622-8f91-14e7292bf632',
        '96c02ef3-e157-4c41-a97d-4e8cef68801e',
        '84bb9e5a-6c68-4e70-a083-b63cf050dd0f',
        '965583fd-0dd8-4a76-903c-509e9c2c3f10',
        '67a6f711-41f0-4fd1-8f01-4acc4bbaa9bb',
        'ac48eb49-876c-41e7-9642-97600698c3a8',
      ],
      '3f1c681d-fb4d-4b9c-9304-653ae8c30763': [
        '43d7bc64-9a09-4f86-8fab-0932d91a90da',
        'b8ba9743-839d-49d0-9717-668e42dae76d',
        'e072f6fe-6cbc-498b-a9d8-48c11756cf3a',
        '7fcadf7a-5c5f-4103-956f-159107464901',
        '8a89f423-5ff2-4410-b18c-6bf19be62ca9',
        '732f0521-0d19-4b18-8be8-32cb1f6fee81',
        'c0c3d28c-2bb7-499c-95bb-532f7ce0e9ca',
        'bf656324-52c1-406d-9ce8-5ed86dd92068',
        '75891988-0f54-4a08-8d25-fcf7ce4f6bfe',
        '621f83ee-9f74-41be-9eb1-54637bcb5764',
        '5c8cdeac-cd87-48a8-a15a-8dc7b85a7f0c',
        '6144fdc0-3e6d-4ada-b066-a013e9e03a8a',
        '68be6cee-883c-4b26-8624-0c970c08c340',
        '95b2d613-7281-41f6-be4b-214490138362',
        'dbf0b4c0-2c06-41de-968c-18111f31b7c7',
      ],
      'cec79f21-33c3-43f5-a8af-59a47aa61b84': ['dfb858b5-b3e5-4871-9d1c-ae2f3fa83b63'],
    },
  },
};

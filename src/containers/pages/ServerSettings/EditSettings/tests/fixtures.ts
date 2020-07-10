export const locHierarchy = {
  locationsHierarchy: {
    map: {
      '75af7700-a6f2-448c-a17d-816261a7749a': {
        children: {
          '8400d475-3187-46e4-8980-7c6f0a243495': {
            children: {
              'f4d22dad-f211-4476-bdf0-09fb20f7f64f': {
                id: 'f4d22dad-f211-4476-bdf0-09fb20f7f64f',
                label: 'Outreach',
                node: {
                  locationId: 'f4d22dad-f211-4476-bdf0-09fb20f7f64f',
                  name: 'Outreach',
                  parentLocation: {
                    locationId: '8400d475-3187-46e4-8980-7c6f0a243495',
                    name: 'Lobi',
                    parentLocation: {
                      locationId: '75af7700-a6f2-448c-a17d-816261a7749a',
                      name: 'ME',
                      voided: false,
                    },
                    voided: false,
                  },
                  voided: false,
                },
                parent: '8400d475-3187-46e4-8980-7c6f0a243495',
              },
            },
            id: '8400d475-3187-46e4-8980-7c6f0a243495',
            label: 'Lobi',
            node: {
              locationId: '8400d475-3187-46e4-8980-7c6f0a243495',
              name: 'Lobi',
              parentLocation: {
                locationId: '75af7700-a6f2-448c-a17d-816261a7749a',
                name: 'ME',
                voided: false,
              },
              voided: false,
            },
            parent: '75af7700-a6f2-448c-a17d-816261a7749a',
          },
        },
        id: '75af7700-a6f2-448c-a17d-816261a7749a',
        label: 'ME',
        node: {
          locationId: '75af7700-a6f2-448c-a17d-816261a7749a',
          name: 'ME',
          tags: ['Country'],
          voided: false,
        },
      },
    },
    parentChildren: {
      '75af7700-a6f2-448c-a17d-816261a7749a': ['8400d475-3187-46e4-8980-7c6f0a243495'],
      '8400d475-3187-46e4-8980-7c6f0a243495': ['f4d22dad-f211-4476-bdf0-09fb20f7f64f'],
    },
  },
};

export const allSettings = [
  {
    description:
      'The proportion of women in the adult population (18 years or older), with a BMI less than 18.5, is 20% or higher.',
    documentId: 'e79b139c-3a20-4656-b684-d2d9ed83c94e',
    inheritedFrom: '',
    key: 'pop_undernourish',
    label: 'Undernourished prevalence 20% or higher',
    locationId: '02ebbc84-5e29-4cd5-9b79-c594058923e9',
    resolveSettings: false,
    serverVersion: 1590644327306,
    settingIdentifier: 'population_characteristics',
    settingMetadataId: '5',
    settingsId: '2',
    type: 'Setting',
    uuid: '96475904-0b13-4a31-a59b-807b7b445897',
    v1Settings: false,
    value: 'false',
  },
  {
    description:
      'The proportion of pregnant women in the population with anaemia (haemoglobin level less than 11 g/dl) is 40% or higher.',
    documentId: 'e79b139c-3a20-4656-b684-d2d9ed83c94e',
    inheritedFrom: '',
    key: 'pop_anaemia_40',
    label: 'Anaemia prevalence 40% or higher',
    locationId: '02ebbc84-5e29-4cd5-9b79-c594058923e9',
    resolveSettings: false,
    serverVersion: 1590644327306,
    settingIdentifier: 'population_characteristics',
    settingMetadataId: '6',
    settingsId: '2',
    type: 'Setting',
    uuid: '90e45492-1eeb-49a9-a510-0f53f563f044',
    v1Settings: false,
    value: true,
  },
];

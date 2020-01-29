import * as globalFixtures from '../../../../../../store/ducks/tests/fixtures';

/** the existing state for the test case: selectors get called with correct arguments
 * relies on the passed props.
 */
export const existingState = {
  gatekeeper: { result: {}, success: null },
  goals: {
    currentGoal: null,
    goalsById: { '19b86421-3cb2-5698-9f11-c1bdafbe5e6d': globalFixtures.goal3 },
  },
  jurisdictions: {
    allJurisdictionIds: {
      '450fc15b-5bd2-468a-927a-49cb10d3bcac': {
        id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        isLoaded: true,
      },
    },
    jurisdictionsById: {
      '450fc15b-5bd2-468a-927a-49cb10d3bcac': globalFixtures.jurisdiction1,
    },
  },
  plans: {
    planRecordsById: {},
    plansById: {
      'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f': globalFixtures.plan1,
    },
  },
  router: {
    action: 'POP',
    location: { hash: '', pathname: '/', search: '', state: undefined },
  },
  session: {
    authenticated: false,
    extraData: {},
    user: { email: '', gravatar: '', name: '', username: '' },
  },
  structures: { structuresById: {} },
  superset: { authorized: null },
  tasks: {
    tasksById: {
      '01d0b84c-df06-426c-a272-6858e84fea31': globalFixtures.task4,
      '03458d28-af61-4f70-b110-73a3429ada2d': globalFixtures.task2,
      'e3e1f2a7-4c53-4059-ab81-0811539e0c5e': globalFixtures.task3,
      'e652f8b2-b884-42d5-832a-86009c10a812': globalFixtures.task1,
    },
  },
};

// tslint:disable object-literal-sort-keys
export const structures = [
  {
    id: '90ac3202-6e7c-449b-8555-9640d4804035',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '90ac3202-6e7c-449b-8555-9640d4804035',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [98.420925756882, 17.1019111524589],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Pending Review',
        version: 0,
        server_version: 1570616378990,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 0,
        effective_end_data: null,
        effective_start_date: null,
      },
    },
  },
  {
    id: '85ecfa3f-146f-4f98-a06b-cd8c939c0bbb',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '85ecfa3f-146f-4f98-a06b-cd8c939c0bbb',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [98.4202760925857, 17.10324421982],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Pending Review',
        version: 0,
        server_version: 1566453083059,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 0,
        effective_end_data: null,
        effective_start_date: null,
      },
    },
  },
  {
    id: '580edf9d-1b91-48d9-aedd-6d675af42bc9',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '580edf9d-1b91-48d9-aedd-6d675af42bc9',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [98.4198805975802, 17.1023527881308],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Pending Review',
        version: 0,
        server_version: 1566453219298,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 0,
        effective_end_data: null,
        effective_start_date: null,
      },
    },
  },
  {
    id: '630a4bae-4122-4a1f-94d1-0d92fe7a74c8',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '630a4bae-4122-4a1f-94d1-0d92fe7a74c8',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [98.4164667269838, 17.1049454034914],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Pending Review',
        version: 0,
        server_version: 1566453617330,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 0,
        effective_end_date: null,
        effective_start_date: null,
      },
    },
  },
  {
    id: '29392be5-34d5-46cc-b8ae-c53c25362ef5',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '29392be5-34d5-46cc-b8ae-c53c25362ef5',
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [98.4197601, 17.1046228],
              [98.419819, 17.1046009],
              [98.4197911, 17.1045323],
              [98.4197322, 17.1045542],
              [98.4197601, 17.1046228],
            ],
          ],
        ],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Active',
        version: 0,
        server_version: 1565908631340,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 6,
        effective_end_data: null,
        effective_start_date: null,
      },
    },
  },
  {
    id: '752acb0c-e340-403a-979c-4ccb095f7eb3',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '752acb0c-e340-403a-979c-4ccb095f7eb3',
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [98.4205088, 17.1020634],
              [98.4205677, 17.1020415],
              [98.4205398, 17.1019729],
              [98.4204809, 17.1019948],
              [98.4205088, 17.1020634],
            ],
          ],
        ],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Active',
        version: 0,
        server_version: 1565908631308,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 6,
        effective_end_data: null,
        effective_start_date: null,
      },
    },
  },
  {
    id: '96bf681a-2438-42f7-9d88-f742ecb8734f',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '96bf681a-2438-42f7-9d88-f742ecb8734f',
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [98.4200517, 17.1038184],
              [98.4201106, 17.1037965],
              [98.4200827, 17.1037279],
              [98.4200238, 17.1037497],
              [98.4200517, 17.1038184],
            ],
          ],
        ],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Active',
        version: 0,
        server_version: 1565908631380,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 6,
        effective_end_data: null,
        effective_start_date: null,
      },
    },
  },
  {
    id: '1e98bd77-8fd5-44d6-937e-d620fa7b6c33',
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    geojson: {
      id: '1e98bd77-8fd5-44d6-937e-d620fa7b6c33',
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [98.4210954, 17.1028532],
              [98.4211784, 17.1028411],
              [98.4211667, 17.1027678],
              [98.4210836, 17.10278],
              [98.4210954, 17.1028532],
            ],
          ],
        ],
      },
      properties: {
        uid: 'a',
        code: 'null',
        name: 'b',
        type: 'Feature',
        status: 'Active',
        version: 0,
        server_version: 1565908631279,
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        geographic_level: 6,
        effective_end_data: null,
        effective_start_date: null,
      },
    },
  },
];
// tslint:enable object-literal-sort-keys

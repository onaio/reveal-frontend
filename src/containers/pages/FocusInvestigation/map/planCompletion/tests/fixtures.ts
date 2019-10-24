export const payload = {
  body: {
    action: [
      {
        code: 'Case Confirmation',
        description: 'Confirm the index case',
        goalId: 'Case_Confirmation',
        identifier: '79556121-104f-43c9-b95b-eb9af99c4c12',
        prefix: 1,
        reason: 'Investigation',
        subjectCodableConcept: {
          text: 'Person',
        },
        taskTemplate: 'Case_Confirmation',
        timingPeriod: {
          end: '2019-06-19',
          start: '2019-06-18',
        },
        title: 'Case Confirmation',
      },
      {
        code: 'RACD Register Family',
        description:
          'Register all families & famiy members in all residential structures enumerated (100%) within the operational area',
        goalId: 'RACD_register_all_families',
        identifier: '50034336-6116-4d59-8063-c088b31a3fa4',
        prefix: 2,
        reason: 'Investigation',
        subjectCodableConcept: {
          text: 'Residential_Structure',
        },
        taskTemplate: 'RACD_register_families',
        timingPeriod: {
          end: '2019-06-27',
          start: '2019-06-18',
        },
        title: 'Family Registration',
      },
      {
        code: 'Blood Screening',
        description:
          'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
        goalId: 'RACD_blood_screening_1km_radius',
        identifier: '962c12eb-2ba7-4cac-bea9-8047e76c7eb3',
        prefix: 3,
        reason: 'Investigation',
        subjectCodableConcept: {
          text: 'Person',
        },
        taskTemplate: 'RACD_Blood_Screening',
        timingPeriod: {
          end: '2019-07-26',
          start: '2019-06-18',
        },
        title: 'RACD Blood screening',
      },
      {
        code: 'Larval Dipping',
        description: 'Perform a minimum of three larval dipping activities in the operational area',
        goalId: 'Larval_Dipping_Min_3_Sites',
        identifier: '65a96d56-2cc6-4de0-969e-58e33470322c',
        prefix: 4,
        reason: 'Investigation',
        subjectCodableConcept: {
          text: 'Breeding_Site',
        },
        taskTemplate: 'Larval_Dipping',
        timingPeriod: {
          end: '2019-07-10',
          start: '2019-06-18',
        },
        title: 'Larval Dipping',
      },
      {
        code: 'Mosquito Collection',
        description:
          'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
        goalId: 'Mosquito_Collection_Min_3_Traps',
        identifier: '63ea7027-1296-4db1-80b4-4b700a0f0004',
        prefix: 5,
        reason: 'Investigation',
        subjectCodableConcept: {
          text: 'Mosquito_Collection_Point',
        },
        taskTemplate: 'Mosquito_Collection_Point',
        timingPeriod: {
          end: '2019-07-09',
          start: '2019-06-18',
        },
        title: 'Mosquito Collection',
      },
    ],
    date: '2019-06-18',
    effectivePeriod: {
      end: '2019-07-30',
      start: '2019-06-18',
    },
    goal: [
      {
        description: 'Confirm the index case',
        id: 'Case_Confirmation',
        priority: 'medium-priority',
        target: [
          {
            detail: {
              detailQuantity: {
                comparator: '>=',
                unit: 'form(s)',
                value: 1,
              },
            },
            due: '2019-06-19',
            measure: 'Number of case confirmation forms complete',
          },
        ],
      },
      {
        description:
          'Register all families and family members in all residential structures enumerated or added (100%) within operational area',
        id: 'RACD_register_all_families',
        priority: 'medium-priority',
        target: [
          {
            detail: {
              detailQuantity: {
                comparator: '>=',
                unit: 'Percent',
                value: 100,
              },
            },
            due: '2019-06-27',
            measure: 'Percent of residential structures with full family registration',
          },
        ],
      },
      {
        description:
          'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
        id: 'RACD_blood_screening_1km_radius',
        priority: 'medium-priority',
        target: [
          {
            detail: {
              detailQuantity: {
                comparator: '>=',
                unit: 'person(s)',
                value: 50,
              },
            },
            due: '2019-07-26',
            measure: 'Number of registered people tested',
          },
        ],
      },
      {
        description: 'Perform a minimum of three larval dipping activities in the operational area',
        id: 'Larval_Dipping_Min_3_Sites',
        priority: 'medium-priority',
        target: [
          {
            detail: {
              detailQuantity: {
                comparator: '>=',
                unit: 'form(s)',
                value: 3,
              },
            },
            due: '2019-07-10',
            measure: 'Number of larval dipping forms submitted',
          },
        ],
      },
      {
        description:
          'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
        id: 'Mosquito_Collection_Min_3_Traps',
        priority: 'medium-priority',
        target: [
          {
            detail: {
              detailQuantity: {
                comparator: '>=',
                unit: 'form(s)',
                value: 3,
              },
            },
            due: '2019-07-09',
            measure: 'Number of mosquito collection forms submitted',
          },
        ],
      },
    ],
    identifier: '0e85c238-39c1-4cea-a926-3d89f0c98427',
    jurisdiction: [
      {
        code: 'd4b0c760-0711-40bc-b417-9c810184131c',
      },
    ],
    name: 'A1-KUM_BANG-Focus_01',
    serverVersion: 1563303122515,
    status: 'complete',
    title: 'A1 - KUM BANG - Focus 01',
    useContext: [
      {
        code: 'interventionType',
        valueCodableConcept: 'FI',
      },
      {
        code: 'fiStatus',
        valueCodableConcept: 'B1',
      },
      {
        code: 'fiReason',
        valueCodableConcept: 'Case Triggered',
      },
    ],
    version: '1',
  },
};

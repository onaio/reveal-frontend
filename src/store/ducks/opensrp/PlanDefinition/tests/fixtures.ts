export const plan1 = {
  identifier: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
  version: '1',
  // tslint:disable-next-line: object-literal-sort-keys
  name: 'A2-Lusaka_Akros_Focus_2',
  title: 'A2-Lusaka Akros Test Focus 2',
  status: 'active',
  date: '2019-05-19',
  effectivePeriod: {
    start: '2019-05-20',
    // tslint:disable-next-line: object-literal-sort-keys
    end: '2019-08-30',
  },
  useContext: [
    {
      code: 'interventionType',
      valueCodableConcept: 'FI',
    },
    {
      code: 'fiStatus',
      valueCodableConcept: 'A2',
    },
    {
      code: 'fiReason',
      valueCodableConcept: 'Case-triggered',
    },
  ],
  jurisdiction: [
    {
      code: '3952',
    },
  ],
  serverVersion: 1563303150422,
  goal: [
    {
      id: 'Case_Confirmation',
      // tslint:disable-next-line: object-literal-sort-keys
      description: 'Confirm the index case',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Number of case confirmation forms complete',
          // tslint:disable-next-line: object-literal-sort-keys
          detail: {
            detailQuantity: {
              value: 1,
              // tslint:disable-next-line: object-literal-sort-keys
              comparator: '>=',
              unit: 'form(s)',
            },
          },
          due: '2019-05-21',
        },
      ],
    },
    {
      id: 'RACD_register_all_families',
      // tslint:disable-next-line: object-literal-sort-keys
      description:
        'Register all families and family members in all residential structures enumerated or added (100%) within operational area',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Percent of residential structures with full family registration',
          // tslint:disable-next-line: object-literal-sort-keys
          detail: {
            detailQuantity: {
              value: 100,
              // tslint:disable-next-line: object-literal-sort-keys
              comparator: '>=',
              unit: 'Percent',
            },
          },
          due: '2019-08-30',
        },
      ],
    },
    {
      id: 'RACD_bednet_dist_1km_radius',
      // tslint:disable-next-line: object-literal-sort-keys
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Percent of residential structures received nets',
          detail: {
            detailQuantity: {
              value: 100,
              comparator: '>=',
              unit: 'Percent',
            },
          },
          due: '2019-08-30',
        },
      ],
    },
    {
      id: 'RACD_blood_screening_1km_radius',
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Percent of registered people tested',
          detail: {
            detailQuantity: {
              value: 100,
              comparator: '>=',
              unit: 'Percent',
            },
          },
          due: '2019-05-28',
        },
      ],
    },
    {
      id: 'Larval_Dipping_Min_3_Sites',
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Number of larval dipping forms submitted',
          detail: {
            detailQuantity: {
              value: 3,
              comparator: '>=',
              unit: 'form(s)',
            },
          },
          due: '2019-05-28',
        },
      ],
    },
    {
      id: 'Mosquito_Collection_Min_3_Traps',
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Number of mosquito collection forms submitted',
          detail: {
            detailQuantity: {
              value: 3,
              comparator: '>=',
              unit: 'form(s)',
            },
          },
          due: '2019-05-28',
        },
      ],
    },
    {
      id: 'BCC_Focus',
      description: 'Complete at least 1 BCC activity for the operational area',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Number of BCC forms submitted',
          detail: {
            detailQuantity: {
              value: 1,
              comparator: '>=',
              unit: 'form(s)',
            },
          },
          due: '2019-06-21',
        },
      ],
    },
  ],
  action: [
    {
      identifier: 'c711ae51-6432-4b68-84c3-d2b5b1fd1948',
      prefix: 1,
      title: 'Case Confirmation',
      description: 'Confirm the index case',
      code: 'Case Confirmation',
      timingPeriod: {
        start: '2019-05-21',
        end: '2019-05-24',
      },
      reason: 'Investigation',
      goalId: 'Case_Confirmation',
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'Case_Confirmation',
    },
    {
      identifier: '402b8c13-6774-4515-929f-48e71a61a379',
      prefix: 2,
      title: 'Family Registration',
      description:
        'Register all families & famiy members in all residential structures enumerated (100%) within the operational area',
      code: 'RACD Register Family',
      timingPeriod: {
        start: '2019-05-21',
        end: '2019-08-30',
      },
      reason: 'Investigation',
      goalId: 'RACD_register_all_families',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'RACD_register_families',
    },
    {
      identifier: '1bd830ea-50e3-44dc-b855-9d5e9339e2be',
      prefix: 3,
      title: 'Bednet Distribution',
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      code: 'Bednet Distribution',
      timingPeriod: {
        start: '2019-05-21',
        end: '2019-08-30',
      },
      reason: 'Routine',
      goalId: 'RACD_bednet_dist_1km_radius',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'ITN_Visit_Structures',
    },
    {
      identifier: '2303a70e-4e3f-4fb9-a430-f0476010bfb5',
      prefix: 4,
      title: 'RACD Blood screening',
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      code: 'Blood Screening',
      timingPeriod: {
        start: '2019-05-21',
        end: '2019-05-28',
      },
      reason: 'Investigation',
      goalId: 'RACD_blood_screening_1km_radius',
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'RACD_Blood_Screening',
    },
    {
      identifier: '2482dfd7-8284-43c6-bea1-a03dcda71ff4',
      prefix: 5,
      title: 'Larval Dipping',
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      code: 'Larval Dipping',
      timingPeriod: {
        start: '2019-05-21',
        end: '2019-05-28',
      },
      reason: 'Investigation',
      goalId: 'Larval_Dipping_Min_3_Sites',
      subjectCodableConcept: {
        text: 'Breeding_Site',
      },
      taskTemplate: 'Larval_Dipping',
    },
    {
      identifier: '423f6665-5367-40be-855e-7c5e6941a0c3',
      prefix: 6,
      title: 'Mosquito Collection',
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      code: 'Mosquito Collection',
      timingPeriod: {
        start: '2019-05-21',
        end: '2019-05-28',
      },
      reason: 'Investigation',
      goalId: 'Mosquito_Collection_Min_3_Traps',
      subjectCodableConcept: {
        text: 'Mosquito_Collection_Point',
      },
      taskTemplate: 'Mosquito_Collection_Point',
    },
    {
      identifier: 'c8fc89a9-cdd2-4746-8272-650883ae380e',
      prefix: 7,
      title: 'Behaviour Change Communication',
      description: 'Conduct BCC activity',
      code: 'BCC',
      timingPeriod: {
        start: '2019-05-21',
        end: '2019-06-21',
      },
      reason: 'Investigation',
      goalId: 'BCC_Focus',
      subjectCodableConcept: {
        text: 'Operational_Area',
      },
      taskTemplate: 'BCC_Focus',
    },
  ],
};

export const plansJSON =
  '[{"identifier":"356b6b84-fc36-4389-a44a-2b038ed2f38d","version":"1","name":"A2-Lusaka_Akros_Focus_2","title":"A2-Lusaka Akros Test Focus 2","status":"active","date":"2019-05-19","effectivePeriod":{"start":"2019-05-20","end":"2019-08-30"},"useContext":[{"code":"interventionType","valueCodableConcept":"FI"},{"code":"fiStatus","valueCodableConcept":"A2"},{"code":"fiReason","valueCodableConcept":"Routine"}],"jurisdiction":[{"code":"3952"}],"serverVersion":1563303150422,"goal":[{"id":"Case_Confirmation","description":"Confirm the index case","priority":"medium-priority","target":[{"measure":"Number of case confirmation forms complete","detail":{"detailQuantity":{"value":1,"comparator":">=","unit":"form(s)"}},"due":"2019-05-21"}]},{"id":"RACD_register_all_families","description":"Register all families and family members in all residential structures enumerated or added (100%) within operational area","priority":"medium-priority","target":[{"measure":"Percent of residential structures with full family registration","detail":{"detailQuantity":{"value":100,"comparator":">=","unit":"Percent"}},"due":"2019-08-30"}]},{"id":"RACD_bednet_dist_1km_radius","description":"Visit 100% of residential structures in the operational area and provide nets","priority":"medium-priority","target":[{"measure":"Percent of residential structures received nets","detail":{"detailQuantity":{"value":100,"comparator":">=","unit":"Percent"}},"due":"2019-08-30"}]},{"id":"RACD_blood_screening_1km_radius","description":"Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person","priority":"medium-priority","target":[{"measure":"Percent of registered people tested","detail":{"detailQuantity":{"value":100,"comparator":">=","unit":"Percent"}},"due":"2019-05-28"}]},{"id":"Larval_Dipping_Min_3_Sites","description":"Perform a minimum of three larval dipping activities in the operational area","priority":"medium-priority","target":[{"measure":"Number of larval dipping forms submitted","detail":{"detailQuantity":{"value":3,"comparator":">=","unit":"form(s)"}},"due":"2019-05-28"}]},{"id":"Mosquito_Collection_Min_3_Traps","description":"Set a minimum of three mosquito collection traps and complete the mosquito collection process","priority":"medium-priority","target":[{"measure":"Number of mosquito collection forms submitted","detail":{"detailQuantity":{"value":3,"comparator":">=","unit":"form(s)"}},"due":"2019-05-28"}]},{"id":"BCC_Focus","description":"Complete at least 1 BCC activity for the operational area","priority":"medium-priority","target":[{"measure":"Number of BCC forms submitted","detail":{"detailQuantity":{"value":1,"comparator":">=","unit":"form(s)"}},"due":"2019-06-21"}]}],"action":[{"identifier":"c711ae51-6432-4b68-84c3-d2b5b1fd1948","prefix":1,"title":"Case Confirmation","description":"Confirm the index case","code":"Case Confirmation","timingPeriod":{"start":"2019-05-21","end":"2019-05-24"},"reason":"Investigation","goalId":"Case_Confirmation","subjectCodableConcept":{"text":"Person"},"taskTemplate":"Case_Confirmation"},{"identifier":"402b8c13-6774-4515-929f-48e71a61a379","prefix":2,"title":"Family Registration","description":"Register all families & famiy members in all residential structures enumerated (100%) within the operational area","code":"RACD Register Family","timingPeriod":{"start":"2019-05-21","end":"2019-08-30"},"reason":"Investigation","goalId":"RACD_register_all_families","subjectCodableConcept":{"text":"Residential_Structure"},"taskTemplate":"RACD_register_families"},{"identifier":"1bd830ea-50e3-44dc-b855-9d5e9339e2be","prefix":3,"title":"Bednet Distribution","description":"Visit 100% of residential structures in the operational area and provide nets","code":"Bednet Distribution","timingPeriod":{"start":"2019-05-21","end":"2019-08-30"},"reason":"Routine","goalId":"RACD_bednet_dist_1km_radius","subjectCodableConcept":{"text":"Residential_Structure"},"taskTemplate":"ITN_Visit_Structures"},{"identifier":"2303a70e-4e3f-4fb9-a430-f0476010bfb5","prefix":4,"title":"RACD Blood screening","description":"Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person","code":"Blood Screening","timingPeriod":{"start":"2019-05-21","end":"2019-05-28"},"reason":"Investigation","goalId":"RACD_blood_screening_1km_radius","subjectCodableConcept":{"text":"Person"},"taskTemplate":"RACD_Blood_Screening"},{"identifier":"2482dfd7-8284-43c6-bea1-a03dcda71ff4","prefix":5,"title":"Larval Dipping","description":"Perform a minimum of three larval dipping activities in the operational area","code":"Larval Dipping","timingPeriod":{"start":"2019-05-21","end":"2019-05-28"},"reason":"Investigation","goalId":"Larval_Dipping_Min_3_Sites","subjectCodableConcept":{"text":"Breeding_Site"},"taskTemplate":"Larval_Dipping"},{"identifier":"423f6665-5367-40be-855e-7c5e6941a0c3","prefix":6,"title":"Mosquito Collection","description":"Set a minimum of three mosquito collection traps and complete the mosquito collection process","code":"Mosquito Collection","timingPeriod":{"start":"2019-05-21","end":"2019-05-28"},"reason":"Investigation","goalId":"Mosquito_Collection_Min_3_Traps","subjectCodableConcept":{"text":"Mosquito_Collection_Point"},"taskTemplate":"Mosquito_Collection_Point"},{"identifier":"c8fc89a9-cdd2-4746-8272-650883ae380e","prefix":7,"title":"Behaviour Change Communication","description":"Conduct BCC activity","code":"BCC","timingPeriod":{"start":"2019-05-21","end":"2019-06-21"},"reason":"Investigation","goalId":"BCC_Focus","subjectCodableConcept":{"text":"Operational_Area"},"taskTemplate":"BCC_Focus"}]},{"identifier":"8fa7eb32-99d7-4b49-8332-9ecedd6d51ae","version":"1","name":"TwoTwoOne_01_IRS_2019-07-10","title":"TwoTwoOne_01 IRS 2019-07-10","status":"active","date":"2019-07-10","effectivePeriod":{"start":"2019-07-10","end":"2019-07-30"},"useContext":[{"code":"interventionType","valueCodableConcept":"IRS"}],"jurisdiction":[{"code":"35968df5-f335-44ae-8ae5-25804caa2d86"},{"code":"3952"},{"code":"ac7ba751-35e8-4b46-9e53-3cbaad193697"}],"serverVersion":1563303151426,"goal":[{"id":"BCC_complete","description":"Complete BCC for the operational area","priority":"medium-priority","target":[{"measure":"Number of BCC communication activities that happened","detail":{"detailQuantity":{"value":1,"comparator":">=","unit":"each"}},"due":"2019-07-10"}]},{"id":"90_percent_of_structures_sprayed","description":"Spray 90 % of structures in the operational area","priority":"medium-priority","target":[{"measure":"Percent of structures sprayed","detail":{"detailQuantity":{"value":90,"comparator":">=","unit":"percent"}},"due":"2019-07-30"}]}],"action":[{"identifier":"3f2eef38-38fe-4108-abb3-4e896b880302","prefix":1,"title":"Perform BCC","description":"Perform BCC for the operational area","code":"BCC","timingPeriod":{"start":"2019-07-10","end":"2019-07-30"},"reason":"Routine","goalId":"BCC_complete","subjectCodableConcept":{"text":"Operational_Area"},"taskTemplate":"Action1_Perform_BCC"},{"identifier":"95a5a00f-a411-4fe5-bd9c-460a856239c9","prefix":2,"title":"Spray Structures","description":"Visit each structure in the operational area and attempt to spray","code":"IRS","timingPeriod":{"start":"2019-07-10","end":"2019-07-30"},"reason":"Routine","goalId":"90_percent_of_structures_sprayed","subjectCodableConcept":{"text":"Residential_Structure"},"taskTemplate":"Action2_Spray_Structures"}]},{"identifier":"f0558ad1-396d-4d97-9fff-c46cf92b6ce6","version":"1","name":"A1-TwoTwoTwo_03-2019-07-18","title":"A1 - TwoTwoTwo_03 - 2019-07-18","status":"active","date":"2019-07-18","effectivePeriod":{"start":"2019-07-18","end":"2019-08-07"},"useContext":[{"code":"interventionType","valueCodableConcept":"FI"},{"code":"fiStatus","valueCodableConcept":"A1"},{"code":"fiReason","valueCodableConcept":"Case Triggered"},{"code":"caseNum","valueCodableConcept":"1"},{"code":"opensrpEventId","valueCodableConcept":"1"},{"code":"taskGenerationStatus","valueCodableConcept":"True"}],"jurisdiction":[{"code":"ac7ba751-35e8-4b46-9e53-3cbaad193697"}],"serverVersion":1563494230144,"goal":[{"id":"Case_Confirmation","description":"Confirm the index case","priority":"medium-priority","target":[{"measure":"Number of case confirmation forms complete","detail":{"detailQuantity":{"value":1,"comparator":"u003eu003d","unit":"form(s)"}},"due":"2019-07-28"}]},{"id":"RACD_register_all_families","description":"Register all families and family members in all residential structures enumerated or added (100%) within operational area","priority":"medium-priority","target":[{"measure":"Percent of residential structures with full family registration","detail":{"detailQuantity":{"value":100,"comparator":"u003eu003d","unit":"Percent"}},"due":"2019-08-07"}]},{"id":"RACD_blood_screening_1km_radius","description":"Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person","priority":"medium-priority","target":[{"measure":"Number of registered people tested","detail":{"detailQuantity":{"value":50,"comparator":"u003eu003d","unit":"person(s)"}},"due":"2019-08-07"}]},{"id":"RACD_bednet_dist_1km_radius","description":"Visit 100% of residential structures in the operational area and provide nets","priority":"medium-priority","target":[{"measure":"Percent of residential structures received nets","detail":{"detailQuantity":{"value":90,"comparator":"u003eu003d","unit":"Percent"}},"due":"2019-08-07"}]},{"id":"Larval_Dipping_Min_3_Sites","description":"Perform a minimum of three larval dipping activities in the operational area","priority":"medium-priority","target":[{"measure":"Number of larval dipping forms submitted","detail":{"detailQuantity":{"value":3,"comparator":"u003eu003d","unit":"form(s)"}},"due":"2019-08-07"}]},{"id":"Mosquito_Collection_Min_3_Traps","description":"Set a minimum of three mosquito collection traps and complete the mosquito collection process","priority":"medium-priority","target":[{"measure":"Number of mosquito collection forms submitted","detail":{"detailQuantity":{"value":3,"comparator":"u003eu003d","unit":"form(s)"}},"due":"2019-08-07"}]},{"id":"BCC_Focus","description":"Complete at least 1 BCC activity for the operational area","priority":"medium-priority","target":[{"measure":"Number of BCC forms submitted","detail":{"detailQuantity":{"value":1,"comparator":"u003eu003d","unit":"form(s)"}},"due":"2019-08-07"}]}],"action":[{"identifier":"031f3d7f-e222-459e-9fcc-da63d04dba4b","prefix":1,"title":"Case Confirmation","description":"Confirm the index case","code":"Case Confirmation","timingPeriod":{"start":"2019-07-18","end":"2019-07-28"},"reason":"Investigation","goalId":"Case_Confirmation","subjectCodableConcept":{"text":"Operational Area"},"taskTemplate":"Case_Confirmation"},{"identifier":"6729612a-9e83-4d72-a8c6-da518e530190","prefix":2,"title":"Family Registration","description":"Register all families u0026 family members in all residential structures enumerated (100%) within the operational area","code":"RACD Register Family","timingPeriod":{"start":"2019-07-18","end":"2019-08-07"},"reason":"Investigation","goalId":"RACD_register_all_families","subjectCodableConcept":{"text":"Residential_Structure"},"taskTemplate":"RACD_register_families"},{"identifier":"6c3637dd-b36d-4137-8df2-1efc6d8d858f","prefix":3,"title":"Blood screening","description":"Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person","code":"Blood Screening","timingPeriod":{"start":"2019-07-18","end":"2019-08-07"},"reason":"Investigation","goalId":"RACD_blood_screening_1km_radius","subjectCodableConcept":{"text":"Person"},"taskTemplate":"RACD_Blood_Screening"},{"identifier":"eb85377d-9333-407c-88de-155410fbfd88","prefix":4,"title":"Bednet Distribution","description":"Visit 100% of residential structures in the operational area and provide nets","code":"Bednet Distribution","timingPeriod":{"start":"2019-07-18","end":"2019-08-07"},"reason":"Routine","goalId":"RACD_bednet_dist_1km_radius","subjectCodableConcept":{"text":"Residential_Structure"},"taskTemplate":"ITN_Visit_Structures"},{"identifier":"01369e56-7e72-4b2e-9f4e-9e3c2beda706","prefix":5,"title":"Larval Dipping","description":"Perform a minimum of three larval dipping activities in the operational area","code":"Larval Dipping","timingPeriod":{"start":"2019-07-18","end":"2019-08-07"},"reason":"Investigation","goalId":"Larval_Dipping_Min_3_Sites","subjectCodableConcept":{"text":"Breeding_Site"},"taskTemplate":"Larval_Dipping"},{"identifier":"6bd72f5b-1043-4905-bcf2-ef62c34f606f","prefix":6,"title":"Mosquito Collection","description":"Set a minimum of three mosquito collection traps and complete the mosquito collection process","code":"Mosquito Collection","timingPeriod":{"start":"2019-07-18","end":"2019-08-07"},"reason":"Investigation","goalId":"Mosquito_Collection_Min_3_Traps","subjectCodableConcept":{"text":"Mosquito_Collection_Point"},"taskTemplate":"Mosquito_Collection_Point"},{"identifier":"40b046a5-18bd-4f26-b3aa-87a0d3787377","prefix":7,"title":"Behaviour Change Communication","description":"Conduct BCC activity","code":"BCC","timingPeriod":{"start":"2019-07-18","end":"2019-08-07"},"reason":"Investigation","goalId":"BCC_Focus","subjectCodableConcept":{"text":"Operational_Area"},"taskTemplate":"BCC_Focus"}]},{"identifier":"0e85c238-39c1-4cea-a926-3d89f0c98429","name":"mosh-test","title":"A Test By Mosh","status":"draft","date":"2019-05-19","effectivePeriod":{"start":"2019-05-20","end":"2019-08-30"},"useContext":[{"code":"interventionType","valueCodableConcept":"FI"},{"code":"fiStatus","valueCodableConcept":"A2"},{"code":"fiReason","valueCodableConcept":"Routine"}],"jurisdiction":[{"code":"3952"}],"serverVersion":1563807467576,"goal":[],"action":[]}]';

export const plans = JSON.parse(plansJSON);

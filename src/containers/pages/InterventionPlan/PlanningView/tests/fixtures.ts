import { Jurisdiction } from '../../../../../store/ducks/jurisdictions';
import { InterventionType, PlanRecord, PlanStatus } from '../../../../../store/ducks/plans';

export const irsPlanDefinition1 = {
  action: [
    {
      code: 'IRS',
      description: 'Visit each structure in the operational area and attempt to spray',
      goalId: 'IRS',
      identifier: '79255d56-9190-578d-8452-fc8520f24f2b',
      prefix: 1,
      reason: 'Routine',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'Spray_Structures',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Spray Structures',
    },
  ],
  date: '2019-08-09',
  effectivePeriod: {
    end: '2019-08-29',
    start: '2019-08-09',
  },
  goal: [
    {
      description: 'Spray structures in the operational area',
      id: 'IRS',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'Percent',
              value: 90,
            },
          },
          due: '2019-08-16',
          measure: 'Percent of structures sprayed',
        },
      ],
    },
  ],
  identifier: '0230f9e8-1f30-5e91-8693-4c993661785e',
  jurisdiction: [
    {
      code: '3952',
    },
  ],
  name: 'IRS-2019-08-09',
  status: 'draft',
  title: 'IRS 2019-08-09',
  useContext: [
    {
      code: 'interventionType',
      valueCodableConcept: 'IRS',
    },
    {
      code: 'taskGenerationStatus',
      valueCodableConcept: 'False',
    },
  ],
  version: '1',
};

export const irsPlanRecord1: PlanRecord = {
  id: '0230f9e8-1f30-5e91-8693-4c993661785e',
  plan_date: '2019-08-09',
  plan_effective_period_end: '2019-08-29',
  plan_effective_period_start: '2019-08-09',
  plan_fi_reason: '',
  plan_fi_status: '',
  plan_id: '0230f9e8-1f30-5e91-8693-4c993661785e',
  plan_intervention_type: InterventionType.IRS,
  plan_jurisdictions_ids: ['3952'],
  plan_status: PlanStatus.DRAFT,
  plan_title: 'IRS 2019-08-09',
  plan_version: '1',
};

export const irsPlanRecordResponse1 = {
  date: '2019-08-09',
  effective_period_end: '2019-08-29',
  effective_period_start: '2019-08-09',
  fi_reason: '',
  fi_status: '',
  identifier: '0230f9e8-1f30-5e91-8693-4c993661785e',
  intervention_type: InterventionType.IRS,
  jurisdictions: ['3952'],
  name: 'IRS 2019-08-09',
  status: PlanStatus.DRAFT,
  title: 'IRS 2019-08-09',
  version: '1',
};

export const jurisdiction1: Jurisdiction = {
  jurisdiction_id: '3952',
};
export const jurisdictionsById: { [key: string]: Jurisdiction } = {
  '0': { geographic_level: 0, jurisdiction_id: '0', name: '0' },
  '1A': { geographic_level: 1, jurisdiction_id: '1A', name: '1A', parent_id: '0' },
  '1Aa': { geographic_level: 2, jurisdiction_id: '1Aa', name: '1Aa', parent_id: '1A' },
  '1Ab': { geographic_level: 2, jurisdiction_id: '1Ab', name: '1Ab', parent_id: '1A' },
  '1B': { geographic_level: 1, jurisdiction_id: '1B', name: '1B', parent_id: '0' },
  '1Ba': { geographic_level: 2, jurisdiction_id: '1Ba', name: '1Ba', parent_id: '1B' },
  '1Bb': { geographic_level: 2, jurisdiction_id: '1Bb', name: '1Bb', parent_id: '1B' },
  '3952': { geographic_level: 2, jurisdiction_id: '3952', name: '1B - 3952', parent_id: '1B' },
};

export const jurisdictionsArray: Jurisdiction[] = [
  jurisdictionsById['0'],
  jurisdictionsById['1A'],
  jurisdictionsById['1B'],
  jurisdictionsById['1Aa'],
  jurisdictionsById['1Ab'],
  jurisdictionsById['1Ba'],
  jurisdictionsById['1Bb'],
  jurisdictionsById['3952'],
];

export const childrenByParentId = {
  '0': ['1A', '1B', '1Aa', '1Ab', '1Ba', '1Bb', '3952'],
  '1A': ['1Aa', '1Ab'],
  '1B': ['1Ba', '1Bb', '3952'],
};

export const jurisdictionIdsByPlanId = {
  [irsPlanRecord1.id]: ['1A', '1B', '1Aa', '1Ab', '1Ba', '1Bb', '3952'],
};

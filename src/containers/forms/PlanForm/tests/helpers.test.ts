import { PropertyName } from 'lodash';
import {
  actionReasons,
  FIReasons,
  goalPriorities,
  PlanActionCodes,
} from '../../../../configs/settings';
import { DATE, IS, NAME, REQUIRED } from '../../../../constants';
import { FlexObject } from '../../../../helpers/utils';
import { InterventionType, PlanStatus } from '../../../../store/ducks/plans';
import { ActivitiesSchema, fiStatusCodes, JurisdictionSchema, PlanSchema } from '../helpers';
import MockDate from 'mockdate';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import {
  doesFieldHaveErrors,
  extractActivitiesFromPlanForm,
  extractActivityForForm,
  generatePlanDefinition,
  getFormActivities,
  getNameTitle,
  getPlanFormValues,
  PlanFormFields,
} from '../helpers';
import {
  activities,
  event,
  event2,
  event3,
  expectedActivity,
  expectedActivityEmptyField,
  expectedExtractActivityFromPlanformResult,
  expectedPlanDefinition,
  extractedActivitiesFromForms,
  planActivities,
  planActivityWithEmptyfields,
  planFormValues,
  planFormValues2,
  values,
  values2,
  valuesWithJurisdiction,
} from './fixtures';

describe('containers/forms/PlanForm/helpers', () => {
  it('check extractActivityForForm returns the correct value for BCC', () => {
    expect(extractActivityForForm(planActivities.BCC)).toEqual(expectedActivity.BCC);
    expect(extractActivityForForm(planActivityWithEmptyfields.BCC)).toEqual(
      expectedActivityEmptyField.BCC
    );
  });

  it('check extractActivityForForm returns the correct value for IRS', () => {
    expect(extractActivityForForm(planActivities.bednetDistribution)).toEqual(
      expectedActivity.bednetDistribution
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.bednetDistribution)).toEqual(
      expectedActivityEmptyField.bednetDistribution
    );
  });

  it('check extractActivityForForm returns the correct value for bloodScreening', () => {
    expect(extractActivityForForm(planActivities.bloodScreening)).toEqual(
      expectedActivity.bloodScreening
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.bloodScreening)).toEqual(
      expectedActivityEmptyField.bloodScreening
    );
  });

  it('check extractActivityForForm returns the correct value for caseConfirmation', () => {
    expect(extractActivityForForm(planActivities.caseConfirmation)).toEqual(
      expectedActivity.caseConfirmation
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.caseConfirmation)).toEqual(
      expectedActivityEmptyField.caseConfirmation
    );
  });

  it('check extractActivityForForm returns the correct value for larvalDipping', () => {
    expect(extractActivityForForm(planActivities.larvalDipping)).toEqual(
      expectedActivity.larvalDipping
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.larvalDipping)).toEqual(
      expectedActivityEmptyField.larvalDipping
    );
  });

  it('check extractActivityForForm returns the correct value for familyRegistration', () => {
    expect(extractActivityForForm(planActivities.familyRegistration)).toEqual(
      expectedActivity.familyRegistration
    );
  });

  it('check extractActivityForForm returns the correct value for mosquitoCollection', () => {
    expect(extractActivityForForm(planActivities.mosquitoCollection)).toEqual(
      expectedActivity.mosquitoCollection
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.mosquitoCollection)).toEqual(
      expectedActivityEmptyField.mosquitoCollection
    );
  });

  it('check getFormActivities returns the correct value', () => {
    expect(JSON.stringify(getFormActivities(planActivities))).toEqual(
      JSON.stringify(extractedActivitiesFromForms)
    );
  });

  it('check doesFieldHaveErrors returns the correct value', () => {
    let errors = [
      {
        id: 'Required',
      },
    ];
    let field = 'id';
    let index = 0;
    expect(doesFieldHaveErrors(field, index, errors)).toBe(true);
    field = '';
    index = NaN;
    errors = [];
    expect(doesFieldHaveErrors(field, index, errors)).toBe(false);
  });

  it('check extractActivitiesFromPlanForm returns the correct value', () => {
    MockDate.set('1/30/2000', 0);
    expect(extractActivitiesFromPlanForm(activities)).toEqual(
      expectedExtractActivityFromPlanformResult
    );
    MockDate.reset();
  });

  it('check getNameTitle returns the correct value when Focus Investigation(FI) is selected', () => {
    expect(getNameTitle(event, values)).toEqual(['A1--2019-08-09', 'A1  2019-08-09']);
    expect(getNameTitle(event, valuesWithJurisdiction)).toEqual([
      'A1-TLv2_01-2019-08-09',
      'A1 TLv2_01 2019-08-09',
    ]);
  });

  it('check getNameTitle returns the correct value when IRS is selected', () => {
    expect(getNameTitle(event2, values)).toEqual(['IRS-2019-08-09', 'IRS 2019-08-09']);
    expect(getNameTitle(event2, valuesWithJurisdiction)).toEqual([
      'IRS-2019-08-09',
      'IRS 2019-08-09',
    ]);
  });

  it('check getNameTitle returns the correct value when nothing is selected', () => {
    expect(getNameTitle(event3, values)).toEqual(['IRS-2019-08-09', 'IRS 2019-08-09']);
    expect(getNameTitle(event3, valuesWithJurisdiction)).toEqual([
      'IRS-2019-08-09',
      'IRS 2019-08-09',
    ]);
  });

  it('check generatePlanDefinition returns the correct value', () => {
    MockDate.set('1/30/2000', 0);
    expect(generatePlanDefinition(values2)).toEqual(expectedPlanDefinition);
    MockDate.reset();
  });

  it('getPlanFormValues can get original planForm', () => {
    const planForm = planFormValues as PlanFormFields;

    const generatedPlan = generatePlanDefinition(planForm);
    const generatedPlanForm = getPlanFormValues(generatedPlan);

    expect(planForm).toEqual({
      ...generatedPlanForm,
      jurisdictions: [
        {
          id: '3952',
          name: 'Akros_2', // getPlanFormValues does not have access to the name
        },
      ],
      version: '1', // the version is updated so we change it back
    });
  });

  it('generatePlanDefinition can get original planDefinition', () => {
    const plan = plans[2];

    const generatedPlanForm = getPlanFormValues(plan);
    const generatedPlan = generatePlanDefinition(generatedPlanForm, plan);

    expect(plan).toEqual({
      ...generatedPlan,
      serverVersion: 1563494230144,
      version: '1',
    });
  });

  it('getPlanFormValues returns the correct value', () => {
    expect(getPlanFormValues(plans[0])).toEqual(planFormValues2);

    const plan = getPlanFormValues(plans[2]);
    // caseNum and opensrpEventId and taskGenerationStatus are gotten right
    expect(plan.caseNum).toEqual('1');
    expect(plan.opensrpEventId).toEqual('1');
    expect(plan.taskGenerationStatus).toEqual('True');
    // multiple jurisdictions are gotten right
    expect(getPlanFormValues(plans[1]).jurisdictions).toEqual([
      { id: '35968df5-f335-44ae-8ae5-25804caa2d86', name: '35968df5-f335-44ae-8ae5-25804caa2d86' },
      { id: '3952', name: '3952' },
      { id: 'ac7ba751-35e8-4b46-9e53-3cbaad193697', name: 'ac7ba751-35e8-4b46-9e53-3cbaad193697' },
    ]);

/** Answers : among the validation errors raised, is there an error obj
 * associated with the given property resulting from that property having
 * the given error message.
 *
 * @param {any} errors - list of errors thrown by the validator
 * @param {string} propertyName - name of the plan property under investigation
 * @param {string} errorMessage - validation errorMessage PS: the essential part of it
 */
const isPropertyErrorPresent = (
  errors: any,
  propertyName: string,
  errorMessage: string = REQUIRED
): boolean => {
  const errMessageRegex = new RegExp(errorMessage);
  const propertyAssociatedErrors = errors.inner.filter(
    (err: any) => err.path === propertyName && errMessageRegex.test(err.message)
  );
  return !!propertyAssociatedErrors.length;
};

/** Matches that the truthy value got from inspecting errors generated
 * by validating the object , is as expected
 *
 * @param {FlexObject} object  - object to validate using planSchema
 * @param {PropertyName} propertyName - name of the plan property under investigation
 * @param {string} errorMessage - validation errorMessage
 * @param {string} expected - whether an error bound by above args is expected
 * @param {any} schema - schema to use for validation
 */
const testRunner = (
  object: FlexObject,
  propertyName: string,
  errorMessage: string,
  expected: boolean,
  schema: any = PlanSchema
) => {
  try {
    schema.validateSync(object, { abortEarly: false });
  } catch (errors) {
    const got = isPropertyErrorPresent(errors, propertyName, errorMessage);
    expect(got).toEqual(expected);
    return;
  }
  expect.assertions(1);
};

describe('./isPropertyPresent', () => {
  it('works correctly for valid data; clean test', () => {
    const path = 'caseNum';
    const message = REQUIRED;
    // error should be termed as present if both the propertyName and
    // the error Mesage matchup
    let validationErrors = { inner: [{ path, message }, { path: 'random', message }] };
    let got = isPropertyErrorPresent(validationErrors, 'caseNum');
    expect(got).toBeTruthy();
    validationErrors = { inner: [{ path: 'name', message: '' }] };
    got = isPropertyErrorPresent(validationErrors, 'name');
    expect(got).toBeFalsy();
    validationErrors = { inner: [{ path: 'someOtherProperty', message }] };
    got = isPropertyErrorPresent(validationErrors, 'name');
    expect(got).toBeFalsy();
  });
});

describe('src/containers/forms/PlanForm.PlanSchema.caseNum', () => {
  /** Case Num requireability is dependent on whether the
   * Intervention Type value is FI
   */
  it('validationError if Intervention is FI && no caseNum', () => {
    const propertyName = 'caseNum';
    const errorMessage = REQUIRED;
    const shouldFail = true;

    const badCaseNum = {
      interventionType: InterventionType.FI,
    };

    testRunner(badCaseNum, propertyName, errorMessage, shouldFail);
  });

  it('No validationError if Intervention is FI && caseNum present', () => {
    const propertyName = 'caseNum';
    const errorMessage = REQUIRED;
    const shouldFail = false;

    const goodCaseNum = {
      caseNum: 'Case Num',
      interventionType: InterventionType.FI,
    };

    testRunner(goodCaseNum, propertyName, errorMessage, shouldFail);
  });

  it('No validationError if Intervention is IRS and no caseNum', () => {
    const propertyName = 'caseNum';
    const errorMessage = REQUIRED;
    const shouldFail = false;

    const goodCaseNum = {
      interventionType: InterventionType.IRS,
    };

    testRunner(goodCaseNum, propertyName, errorMessage, shouldFail);
  });
});

describe('src/containers/forms/PlanForm.PlanSchema.date', () => {
  it('yup validates date as date', () => {
    expect.assertions(1);
  });

  it('date validation passes for valid date', () => {
    const propertyName = 'date';
    const errorMessage = `${DATE} ${IS} ${REQUIRED}`;
    const shouldFail = false;

    const goodDatePlan = { date: 'Not a date' };

    testRunner(goodDatePlan, propertyName, errorMessage, shouldFail);
  });

  it('date validation fails for invalid date', () => {
    const propertyName = 'date';
    const errorMessage = `${DATE} ${IS} ${REQUIRED}`;
    const shouldFail = true;

    const badDatePlan = {
      date: '',
    };

    testRunner(badDatePlan, propertyName, errorMessage, shouldFail);
  });
});

describe('Schema validation behavior for missing property"s', () => {
  /** Structure => [object, propertyName, errorMessage, ifshouldFail, schema(default: PlanSchema)] */
  [
    [{}, 'end', REQUIRED, true],
    [{}, 'identifier', REQUIRED, false],
    [{}, 'interventionType', REQUIRED, true],
    [{}, 'name', `${NAME} ${IS} ${REQUIRED}`, true],
    [{}, 'opensrpEventId', '', false],
    [{}, 'start', REQUIRED, true],
    [{}, 'status', REQUIRED, true],
    [{}, 'title', REQUIRED, true],
    [{}, 'version', REQUIRED, false],
    [{}, 'actionDescription', REQUIRED, true, ActivitiesSchema],
    [{}, 'actionIdentifier', REQUIRED, false, ActivitiesSchema],
    [{}, 'actionReason', REQUIRED, true, ActivitiesSchema],
    [{}, 'actionTitle', REQUIRED, true, ActivitiesSchema],
    [{}, 'goalDescription', REQUIRED, true, ActivitiesSchema],
    [{}, 'goalDue', REQUIRED, true, ActivitiesSchema],
    [{}, 'goalPriority', REQUIRED, true, ActivitiesSchema],
    [{}, 'goalValue', REQUIRED, true, ActivitiesSchema],
    [{}, 'timingPeriodEnd', REQUIRED, true, ActivitiesSchema],
    [{}, 'timingPeriodStart', REQUIRED, true, ActivitiesSchema],
    [{}, 'id', REQUIRED, true, JurisdictionSchema],
    [{}, 'name', REQUIRED, false, JurisdictionSchema],
  ].forEach(e => {
    it(`validation ${e[3] ? 'fails' : 'passes'} if ${e[1]} is missing`, () => {
      testRunner(e[0], e[1] as string, e[2] as string, e[3] as boolean);
    });
  });

  /** For some of this propertyNames, the values are really not valid, its just that
   * we are checking their validity based on a single check in this case; whether
   * they are required or not.
   */
  [
    [{ end: 'not a date' }, 'end', REQUIRED, false],
    [{ identifier: 'this guy' }, 'identifier', REQUIRED, false],
    [{ interventionType: 'FI' }, 'interventionType', REQUIRED, false],
    [{ name: 'Joey Tribbiani' }, 'name', `${NAME} ${IS} ${REQUIRED}`, false],
    [{ opensrpEventId: '1.234' }, 'opensrpEventId', '', false],
    [{ start: '2019 AD' }, 'start', REQUIRED, false],
    [{ status: 'active' }, 'status', REQUIRED, false],
    [{ title: 'Some string' }, 'title', REQUIRED, false],
    [{ version: 'v1' }, 'version', REQUIRED, false],
    [{ actionDescription: 'aString' }, 'actionDescription', REQUIRED, false, ActivitiesSchema],
    [{ actionIdentifier: 'aString' }, 'actionIdentifier', REQUIRED, false, ActivitiesSchema],
    [{ actionReason: 'someString' }, 'actionReason', REQUIRED, false, ActivitiesSchema],
    [{ actionTitle: 'someString' }, 'actionTitle', REQUIRED, false, ActivitiesSchema],
    [{ goalDescription: 'someString' }, 'goalDescription', REQUIRED, false, ActivitiesSchema],
    [{ goalDue: 'notADate' }, 'goalDue', REQUIRED, false, ActivitiesSchema],
    [{ goalPriority: 'someString' }, 'goalPriority', REQUIRED, false, ActivitiesSchema],
    [{ goalValue: 'shouldbeInt' }, 'goalValue', REQUIRED, false, ActivitiesSchema],
    [{ timingPeriodEnd: 'shouldbeDate' }, 'timingPeriodEnd', REQUIRED, false, ActivitiesSchema],
    [{ timingPeriodStart: 'shouldbeDate' }, 'timingPeriodStart', REQUIRED, false, ActivitiesSchema],
    [{ id: 'someId' }, 'id', REQUIRED, false, JurisdictionSchema],
    [{}, 'name', REQUIRED, false, JurisdictionSchema],
  ].forEach(e => {
    it(`validation ${e[3] ? 'fails' : 'passes'} if ${e[1]} is present`, () => {
      testRunner(e[0], e[1] as string, e[2] as string, e[3] as boolean, e[4]);
    });
  });
});

describe('PlanSchema validates correctly based on data types', () => {
  /** Should not throw validation error if property values
   * are of expected data type
   */
  /** Should raise errors if property's values are not of
   * the expected type <-> This will not be exhaustive(logically
   * it cant be.)
   */
  // Apparently anything can be serialized into a string. meaning the
  // yup.string(), is not of much help
});

describe('Schema validation for one of', () => {
  /** validation errors if property value is  not one of specified */
  const fiReasonEnums = FIReasons.join(', ');
  const fiStatusEnums = fiStatusCodes.join(', ');
  const interventionTypeEnums = Object.values(InterventionType).join(', ');
  const statusEnums = Object.values(PlanStatus).join(', ');
  const planActionCodesEnums = PlanActionCodes.join(', ');
  const actionReasonsEnums = actionReasons.join(', ');
  const goalPriorityEnums = goalPriorities.join(', ');
  [
    [{ fiReason: '09fasdf' }, 'fiReason', fiReasonEnums, true],
    [{ fiReason: 'Routine' }, 'fiReason', fiReasonEnums, false],
    [{ fiStatus: 'dontknow' }, 'fiStatus', fiStatusEnums, true],
    [{ fiStatus: 'A1' }, 'fiStatus', fiStatusEnums, false],
    [{ interventionType: 'notType' }, 'interventionType', interventionTypeEnums, true],
    [{ interventionType: 'FI' }, 'interventionType', interventionTypeEnums, false],
    [{ status: 'invalidStatus' }, 'status', statusEnums, true],
    [{ status: 'active' }, 'status', statusEnums, false],
    [
      { actionCode: 'invalidActionCode' },
      'actionCode',
      planActionCodesEnums,
      true,
      ActivitiesSchema,
    ],
    [{ actionCode: 'BCC' }, 'actionCode', planActionCodesEnums, false, ActivitiesSchema],
    [{ actionReason: 'someString' }, 'actionReason', actionReasonsEnums, true, ActivitiesSchema],
    [{ actionReason: 'Routine' }, 'actionReason', actionReasonsEnums, false, ActivitiesSchema],
    [{ goalPriority: 'notPriority' }, 'goalPriority', goalPriorityEnums, true, ActivitiesSchema],
    [{ goalPriority: 'low-priority' }, 'goalPriority', goalPriorityEnums, false, ActivitiesSchema],
  ].forEach(e => {
    it(`validation ${e[3] ? 'fails' : 'passes'} if ${e[1]} is ${
      e[3] ? 'not one' : 'one'
    } of the enumerated values`, () => {
      testRunner(e[0], e[1] as string, e[2] as string, e[3] as boolean, e[4]);
    });
  });
});

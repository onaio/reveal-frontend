import FormikEffect from '@onaio/formik-effect';
import { Dictionary } from '@onaio/utils';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import { xor } from 'lodash';
import moment from 'moment';
import React, { FormEvent, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledCollapse,
} from 'reactstrap';
import { ActionCreator } from 'redux';
import { format } from 'util';
import {
  DATE_FORMAT,
  DEFAULT_PLAN_DURATION_DAYS,
  DEFAULT_PLAN_VERSION,
  ENABLED_FI_REASONS,
  MDA_POINT_FORM_INTERVENTION_TITLE,
  PLAN_TYPES_ALLOWED_TO_CREATE,
  PLAN_TYPES_WITH_MULTI_JURISDICTIONS,
} from '../../../configs/env';
import {
  ACTION,
  ACTIVITIES_LABEL,
  ADD,
  ADD_ACTIVITY,
  ADD_CODED_ACTIVITY,
  AN_ERROR_OCCURRED,
  AND,
  CASE_NUMBER,
  CONDITIONS_LABEL,
  DEFINITION_URI,
  DESCRIPTION_LABEL,
  DYNAMIC_FI_TITLE,
  DYNAMIC_IRS_TITLE,
  DYNAMIC_MDA_TITLE,
  END_DATE,
  FOCUS_AREA_HEADER,
  FOCUS_CLASSIFICATION_LABEL,
  FOCUS_INVESTIGATION,
  FOCUS_INVESTIGATION_STATUS_REASON,
  GOAL_LABEL,
  INTERVENTION_TYPE_LABEL,
  IRS_TITLE,
  LOCATIONS,
  MDA_LITE_TITLE,
  MDA_POINT_TITLE,
  MDA_TITLE,
  PLAN_END_DATE_LABEL,
  PLAN_START_DATE_LABEL,
  PLAN_TITLE_LABEL,
  PLEASE_FIX_THESE_ERRORS,
  PRIORITY_LABEL,
  QUANTITY_LABEL,
  REASON_HEADER,
  RETIRE_PLAN_MESSAGE,
  SAVE_PLAN,
  SAVING,
  SELECT_OPTION,
  SELECT_PLACHOLDER,
  SMC_TITLE,
  START_DATE,
  STATUS_HEADER,
  TRIGGERS_LABEL,
} from '../../../configs/lang';
import {
  actionReasons,
  actionReasonsDisplay,
  FIClassifications,
  FIReasons,
  FIReasonsDisplay,
  goalPriorities,
  goalPrioritiesDisplay,
  goalUnitDisplay,
  planActivities,
  PlanDefinition,
  planStatusDisplay,
} from '../../../configs/settings';
import { MDA_POINT_ADVERSE_EFFECTS_CODE, OPENSRP_PLANS, PLAN_LIST_URL } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { extractPlanRecordResponseFromPlanPayload } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import { addPlanDefinition } from '../../../store/ducks/opensrp/PlanDefinition';
import {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  InterventionType,
  PlanStatus,
} from '../../../store/ducks/plans';
import DatePickerWrapper from '../../DatePickerWrapper';
import JurisdictionSelect from '../JurisdictionSelect';
import { getConditionAndTriggers } from './components/actions';
import { RetirePlanForm, SetSubmittingType } from './components/retirePlanForm';
import {
  displayPlanTypeOnForm,
  doesFieldHaveErrors,
  generatePlanDefinition,
  getFormActivities,
  getGoalUnitFromActionCode,
  getNameTitle,
  isFIOrDynamicFI,
  onSubmitSuccess,
  planActivitiesMap,
  PlanSchema,
  showDefinitionUriFor,
} from './helpers';
import './style.css';
import {
  BeforeSubmit,
  FIReasonType,
  PlanActionCodesType,
  PlanActivityFormFields,
  PlanFormFields,
  PlanJurisdictionFormFields,
} from './types';

/** different titles for MDA point itrevention type */
const MDAPonitInterventionTitles = {
  MDA_POINT_TITLE,
  SMC_TITLE,
} as const;
type MDAPonitInterventionTitles = keyof typeof MDAPonitInterventionTitles;
const MDAPointTitle =
  MDAPonitInterventionTitles[MDA_POINT_FORM_INTERVENTION_TITLE as MDAPonitInterventionTitles] ||
  MDA_POINT_TITLE;

/** initial values for plan jurisdiction forms */
const initialJurisdictionValues: PlanJurisdictionFormFields = {
  id: '',
  name: '',
};

/** default intervention type displayed */
const defaultInterventionType = PLAN_TYPES_ALLOWED_TO_CREATE
  ? (PLAN_TYPES_ALLOWED_TO_CREATE[0] as InterventionType)
  : InterventionType.FI;

/** initial values for plan Form */
export const defaultInitialValues: PlanFormFields = {
  activities: planActivitiesMap[defaultInterventionType],
  caseNum: '',
  date: moment().toDate(),
  end: moment()
    .add(DEFAULT_PLAN_DURATION_DAYS, 'days')
    .toDate(),
  fiReason: FIReasons[0],
  fiStatus: undefined,
  identifier: '',
  interventionType: defaultInterventionType,
  jurisdictions: [initialJurisdictionValues],
  name: '',
  opensrpEventId: undefined,
  start: moment().toDate(),
  status: PlanStatus.DRAFT,
  taskGenerationStatus: 'False',
  teamAssignmentStatus: '',
  title: '',
  version: DEFAULT_PLAN_VERSION,
};

/** render Prop interface for render function that planForm
 * passes to Whatever component that is rendering the jurisdictionNames.
 */
export type LocationChildRenderProp = (
  locationName: string,
  locationId: string,
  index: number
) => JSX.Element;

/** interface for plan form props */
export interface PlanFormProps {
  actionCreator: ActionCreator<FetchPlanRecordsAction>;
  addAndRemoveActivities: boolean /** activate adding and removing activities buttons */;
  allFormActivities: PlanActivityFormFields[] /** the list of all allowed activities */;
  allowMoreJurisdictions: boolean /** should we allow one to add more jurisdictions */;
  autoSelectFIStatus: boolean /** should fi classification be auto selected */;
  cascadingSelect: boolean /** should we use cascading selects for jurisdiction selection */;
  disabledActivityFields: string[] /** activity fields that are disabled */;
  disabledFields: string[] /** fields that are disabled */;
  formHandler: (
    curr: any,
    next: any
  ) => void /** callback to handle form values, used to pass them to parent components */;
  hiddenFields: string[] /** field that are hidden */;
  initialValues: PlanFormFields /** initial values for fields on the form */;
  jurisdictionLabel: string /** the label used for the jurisdiction selection */;
  redirectAfterAction: string /** the url to redirect to after form submission */;
  renderLocationNames?: (
    child?: LocationChildRenderProp /** nested render content for each location name */
  ) => JSX.Element;
  /** a render prop that renders the plan's location names */
  addPlan?: typeof addPlanDefinition /** Add new/update plan to redux store */;
  beforeSubmit: BeforeSubmit /** called before submission starts, return true to proceed with submission */;
}

/** Plan Form component */
const PlanForm = (props: PlanFormProps) => {
  const [areWeDoneHere, setAreWeDoneHere] = useState<boolean>(false);
  const [activityModal, setActivityModal] = useState<boolean>(false);
  const [actionConditions, setActionConditions] = useState<Dictionary>({});
  const [actionTriggers, setActionTriggers] = useState<Dictionary>({});
  const [aboutToRetirePlan, setAboutToRetirePlan] = useState<boolean>(false);
  const [formPayLoad, setFormPayLoad] = useState<PlanDefinition | null>(null);

  const {
    allFormActivities,
    allowMoreJurisdictions,
    cascadingSelect,
    disabledActivityFields,
    disabledFields,
    formHandler,
    initialValues,
    jurisdictionLabel,
    redirectAfterAction,
    addPlan,
    hiddenFields,
    actionCreator,
    addAndRemoveActivities,
    autoSelectFIStatus,
  } = props;

  useEffect(() => {
    const { conditions, triggers } = getConditionAndTriggers(
      initialValues.activities,
      disabledFields.includes('activities')
    );
    setActionConditions(conditions);
    setActionTriggers(triggers);
  }, []);

  const editMode: boolean = initialValues.identifier !== '';

  let filteredFIReasons: FIReasonType[] = [...FIReasons];
  if (ENABLED_FI_REASONS.length && !editMode) {
    filteredFIReasons = FIReasons.filter((reason: FIReasonType) =>
      ENABLED_FI_REASONS.includes(reason)
    );
  }

  const disAllowedStatusChoices: string[] = [];
  if (editMode) {
    // Don't allow setting status back to draft
    if (initialValues.status !== PlanStatus.DRAFT) {
      disAllowedStatusChoices.push(PlanStatus.DRAFT);
    }
    // set these fields to friendly defaults if not set or else the form cant be submitted
    if (
      initialValues.interventionType === InterventionType.FI &&
      (!initialValues.fiReason || !filteredFIReasons.includes(initialValues.fiReason))
    ) {
      initialValues.fiReason = filteredFIReasons[0];
    }
  }

  /** simple function to toggle activity modal */
  function toggleActivityModal() {
    setActivityModal(!activityModal);
  }

  /** get the source list of activities
   * This is used to filter out activities selected but not in the "source"
   * @param {PlanFormFields} values - current form values
   * @param {PlanActivityFormFields[]} initialActivities - activities on initial values
   */
  function getSourceActivities(
    values: PlanFormFields,
    initialActivities?: PlanActivityFormFields[]
  ) {
    if (planActivitiesMap.hasOwnProperty(values.interventionType)) {
      const interventionActivities = planActivitiesMap[values.interventionType];
      if (initialActivities && initialActivities.length) {
        const initialActivitiesCodes = initialActivities.map(e => e.actionCode);
        const missingActivities = interventionActivities.filter(
          e => !initialActivitiesCodes.includes(e.actionCode)
        );
        return [...initialActivities, ...missingActivities];
      }
      return interventionActivities;
    }
    return allFormActivities;
  }

  /** get activity codes which does not exist on the plan template
   *  @param {PlanFormFields} initialFormValues - current form values
   */
  const getAddedActivities = (initialFormValues: PlanFormFields) => {
    const defaultActivityCodes = getSourceActivities(initialFormValues).map(e => e.actionCode);
    return initialFormValues.activities
      .map(e => e.actionCode)
      .filter(e => !defaultActivityCodes.includes(e));
  };

  /**
   * Check if all the source activities have been selected
   * @param {PlanFormFields} values - current form values
   * @param {string[]} extraCodes - activity codes not on plans template activities
   */
  function checkIfAllActivitiesSelected(values: PlanFormFields, extraCodes: string[]) {
    const activeActivityCodes = values.activities.map(e => e.actionCode);
    const AllMissingActivities = xor(
      getSourceActivities(values).map(e => e.actionCode),
      activeActivityCodes
    );
    return extraCodes.length > 0
      ? xor(AllMissingActivities, extraCodes).length === 0
      : AllMissingActivities.length === 0;
  }

  /** if plan is updated or saved redirect to plans page */
  if (areWeDoneHere) {
    return <Redirect to={redirectAfterAction} />;
  }

  /**
   * create or update plan
   * @param {PlanDefinition} payload - data to be submitted
   * @param {SetSubmittingType} setSubmitting - formik set submitting
   */
  const savePlan = (payload: PlanDefinition, setSubmitting: SetSubmittingType) => {
    const apiService = new OpenSRPService(OPENSRP_PLANS);
    if (editMode) {
      apiService
        .update(payload)
        .then(() => {
          onSubmitSuccess(setSubmitting, setAreWeDoneHere, payload, addPlan);
        })
        .catch((e: Error) => {
          setSubmitting(false);
          displayError(e, AN_ERROR_OCCURRED, false);
        });
    } else {
      apiService
        .create(payload)
        .then(() => {
          onSubmitSuccess(setSubmitting, setAreWeDoneHere, payload, addPlan);
          // extracted planRecord from the payload which is the object received from the opensrp service
          const record = extractPlanRecordResponseFromPlanPayload(payload);
          if (record) {
            actionCreator([record]);
          }
        })
        .catch((e: Error) => {
          setSubmitting(false);
          displayError(e, AN_ERROR_OCCURRED, false);
        });
    }
  };

  const cancelCallBack = () => setAboutToRetirePlan(false);

  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        /* tslint:disable-next-line jsx-no-lambda */
        onSubmit={(values, { setSubmitting }) => {
          const payload = generatePlanDefinition(values, null, editMode);
          const continueWithSubmit = props.beforeSubmit(payload);
          if (!continueWithSubmit) {
            setSubmitting(false);
            return;
          }
          if (payload.status === PlanStatus.RETIRED) {
            setFormPayLoad(payload);
            setAboutToRetirePlan(true);
          } else {
            savePlan(payload, setSubmitting);
          }
        }}
        validationSchema={PlanSchema}
      >
        {({
          errors,
          handleChange,
          isSubmitting,
          setSubmitting,
          setFieldValue,
          values,
          touched,
          isValid,
        }) => (
          <Form
            /* tslint:disable-next-line jsx-no-lambda */
            onChange={(e: FormEvent) => {
              const target = e.target as HTMLInputElement;
              const fieldsThatChangePlanTitle = [
                'interventionType',
                'fiStatus',
                'date',
                'jurisdictions[0].id',
              ];
              const nameTitle = getNameTitle(e, values);
              if (
                fieldsThatChangePlanTitle.includes(target.name) ||
                !values.title ||
                values.title === ''
              ) {
                setFieldValue('title', nameTitle[1]);
              }
              setFieldValue('name', nameTitle[0]);
            }}
            className="mb-5"
          >
            {formHandler && <FormikEffect onChange={formHandler} />}
            <FormGroup className="non-field-errors">
              <ErrorMessage
                name="name"
                component="p"
                className="form-text text-danger name-error"
              />
              <ErrorMessage
                name="date"
                component="p"
                className="form-text text-danger date-error"
              />
            </FormGroup>
            <FormGroup hidden={hiddenFields.includes('interventionType')}>
              <Label for="interventionType">{INTERVENTION_TYPE_LABEL}</Label>
              <Field
                required={true}
                component="select"
                name="interventionType"
                id="interventionType"
                disabled={disabledFields.includes('interventionType')}
                /* tslint:disable-next-line jsx-no-lambda */
                onChange={(e: FormEvent) => {
                  const target = e.target as HTMLInputElement;

                  if (planActivitiesMap.hasOwnProperty(target.value)) {
                    setFieldValue('activities', planActivitiesMap[target.value]);
                    const newStuff = getConditionAndTriggers(
                      planActivitiesMap[target.value],
                      disabledFields.includes('activities')
                    );
                    setActionConditions(newStuff.conditions);
                    setActionTriggers(newStuff.triggers);
                  }

                  setFieldValue('jurisdictions', [initialJurisdictionValues]);
                  handleChange(e);
                }}
                className={errors.interventionType ? 'form-control is-invalid' : 'form-control'}
              >
                {displayPlanTypeOnForm(InterventionType.FI, editMode) && (
                  <option value={InterventionType.FI}>{FOCUS_INVESTIGATION}</option>
                )}
                {displayPlanTypeOnForm(InterventionType.IRS, editMode) && (
                  <option value={InterventionType.IRS}>{IRS_TITLE}</option>
                )}
                {displayPlanTypeOnForm(InterventionType.MDA, editMode) && (
                  <option value={InterventionType.MDA}>{MDA_TITLE}</option>
                )}
                {displayPlanTypeOnForm(InterventionType.MDAPoint, editMode) && (
                  <option value={InterventionType.MDAPoint}>{MDAPointTitle}</option>
                )}
                {displayPlanTypeOnForm(InterventionType.MDALite, editMode) && (
                  <option value={InterventionType.MDALite}>{MDA_LITE_TITLE}</option>
                )}
                {displayPlanTypeOnForm(InterventionType.DynamicFI, editMode) && (
                  <option value={InterventionType.DynamicFI}>{DYNAMIC_FI_TITLE}</option>
                )}
                {displayPlanTypeOnForm(InterventionType.DynamicIRS, editMode) && (
                  <option value={InterventionType.DynamicIRS}>{DYNAMIC_IRS_TITLE}</option>
                )}
                {displayPlanTypeOnForm(InterventionType.DynamicMDA, editMode) && (
                  <option value={InterventionType.DynamicMDA}>{DYNAMIC_MDA_TITLE}</option>
                )}
              </Field>
              <ErrorMessage
                name="interventionType"
                component="small"
                className="form-text text-danger interventionType-error"
              />
            </FormGroup>

            <h5 className="mt-5" hidden={hiddenFields.includes('jurisdictions')}>
              {LOCATIONS}
            </h5>

            <FieldArray
              name="jurisdictions"
              /* tslint:disable-next-line jsx-no-lambda */
              render={arrayHelpers => (
                <div>
                  {editMode ? (
                    <div
                      id="jurisdictions-display-container"
                      className="mb-5"
                      hidden={hiddenFields.includes('jurisdictions')}
                    >
                      {props.renderLocationNames &&
                        props.renderLocationNames(
                          (locationName: string, locationId: string, index: number) => (
                            <fieldset>
                              <Field
                                type="hidden"
                                readOnly={true}
                                name={`jurisdictions[${index}].id`}
                                id={`jurisdictions-${index}-id`}
                                value={locationId}
                              />
                              <Field
                                type="hidden"
                                readOnly={true}
                                name={`jurisdictions[${index}].name`}
                                id={`jurisdictions-${index}-name`}
                                value={locationName}
                              />
                            </fieldset>
                          )
                        )}
                    </div>
                  ) : (
                    <div id="jurisdictions-select-container" className="mb-5">
                      {values.jurisdictions.map((_, index) => (
                        <fieldset key={index}>
                          {errors.jurisdictions &&
                            errors.jurisdictions[index] &&
                            touched.jurisdictions &&
                            touched.jurisdictions[index] && (
                              <div className="alert alert-danger" role="alert">
                                <h6 className="alert-heading">{PLEASE_FIX_THESE_ERRORS}</h6>
                                <ul className="list-unstyled">
                                  {Object.entries(errors.jurisdictions[index] || {}).map(
                                    ([key, val]) => (
                                      <li key={key}>
                                        <strong>{jurisdictionLabel}</strong>: {val}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          <div className="jurisdiction-item position-relative">
                            {values.jurisdictions && values.jurisdictions.length > 1 && (
                              <button
                                type="button"
                                className="close position-absolute removeArrItem removeJurisdiction"
                                aria-label="Close"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            )}
                            <FormGroup
                              className={
                                errors.jurisdictions &&
                                touched.jurisdictions &&
                                doesFieldHaveErrors('id', index, errors.jurisdictions)
                                  ? 'is-invalid async-select-container'
                                  : 'async-select-container'
                              }
                            >
                              <Label for={`jurisdictions-${index}-id`}>{jurisdictionLabel}</Label>
                              <Field
                                required={true}
                                component={JurisdictionSelect}
                                cascadingSelect={cascadingSelect}
                                name={`jurisdictions[${index}].id`}
                                id={`jurisdictions-${index}-id`}
                                placeholder={format(SELECT_PLACHOLDER, jurisdictionLabel)}
                                aria-label={format(SELECT_PLACHOLDER, jurisdictionLabel)}
                                disabled={disabledFields.includes('jurisdictions')}
                                className={
                                  errors.jurisdictions &&
                                  doesFieldHaveErrors('id', index, errors.jurisdictions)
                                    ? 'is-invalid async-select'
                                    : 'async-select'
                                }
                                labelFieldName={`jurisdictions[${index}].name`}
                                fiStatusFieldName="fiStatus"
                              />
                              <Field
                                type="hidden"
                                name={`jurisdictions[${index}].name`}
                                id={`jurisdictions-${index}-name`}
                              />

                              {errors.jurisdictions &&
                                errors.jurisdictions[index] &&
                                touched.jurisdictions &&
                                touched.jurisdictions[index] && (
                                  <small className="form-text text-danger jurisdictions-error">
                                    {AN_ERROR_OCCURRED}
                                  </small>
                                )}

                              <ErrorMessage
                                name={`jurisdictions[${index}].id`}
                                component="small"
                                className="form-text text-danger"
                              />
                            </FormGroup>
                          </div>
                        </fieldset>
                      ))}
                      {PLAN_TYPES_WITH_MULTI_JURISDICTIONS.includes(values.interventionType) &&
                        allowMoreJurisdictions === true && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm mb-5 addJurisdiction"
                            onClick={() => arrayHelpers.push(initialJurisdictionValues)}
                          >
                            {ADD} {jurisdictionLabel}
                          </button>
                        )}
                    </div>
                  )}
                </div>
              )}
            />

            {isFIOrDynamicFI(values.interventionType) && (
              <FormGroup hidden={hiddenFields.includes('fiStatus')}>
                <Label for="fiStatus">{FOCUS_CLASSIFICATION_LABEL}</Label>
                <Field
                  required={isFIOrDynamicFI(values.interventionType)}
                  component="select"
                  name="fiStatus"
                  id="fiStatus"
                  disabled={disabledFields.includes('fiStatus') || autoSelectFIStatus}
                  className={errors.fiStatus ? 'form-control is-invalid' : 'form-control'}
                >
                  <option>{SELECT_OPTION}</option>
                  {Object.entries(FIClassifications).map(e => (
                    <option key={e[1].code} value={e[1].code}>
                      {e[1].code} - {e[1].name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="fiStatus"
                  component="small"
                  className="form-text text-danger fiStatus-error"
                />
              </FormGroup>
            )}
            {isFIOrDynamicFI(values.interventionType) && (
              <FormGroup hidden={hiddenFields.includes('fiReason')}>
                <Label for="fiReason">{FOCUS_INVESTIGATION_STATUS_REASON}</Label>
                <Field
                  required={isFIOrDynamicFI(values.interventionType)}
                  component="select"
                  name="fiReason"
                  id="fiReason"
                  disabled={disabledFields.includes('fiReason')}
                  className={errors.fiReason ? 'form-control is-invalid' : 'form-control'}
                >
                  <option>----</option>
                  {filteredFIReasons.map(e => (
                    <option key={e} value={e}>
                      {FIReasonsDisplay[e]}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="fiReason"
                  component="small"
                  className="form-text text-danger fiReason-error"
                />
              </FormGroup>
            )}
            {isFIOrDynamicFI(values.interventionType) && values.fiReason === FIReasons[1] && (
              <FormGroup hidden={hiddenFields.includes('caseNum')}>
                <Label for="caseNum">{CASE_NUMBER}</Label>
                <Field
                  required={
                    isFIOrDynamicFI(values.interventionType) && values.fiReason === FIReasons[1]
                  }
                  type="text"
                  name="caseNum"
                  id="caseNum"
                  disabled={disabledFields.includes('caseNum')}
                  className={errors.caseNum ? 'form-control is-invalid' : 'form-control'}
                />
                <ErrorMessage name="caseNum" component="small" className="form-text text-danger" />

                <Field type="hidden" name="opensrpEventId" id="opensrpEventId" readOnly={true} />
              </FormGroup>
            )}
            <FormGroup hidden={hiddenFields.includes('title')}>
              <Label for="title">{PLAN_TITLE_LABEL}</Label>
              <Field
                required={true}
                type="text"
                name="title"
                id="title"
                disabled={disabledFields.includes('title')}
                className={
                  (errors.name && touched.name) || (errors.title && touched.title)
                    ? 'form-control is-invalid'
                    : 'form-control'
                }
              />
              <ErrorMessage
                name="title"
                component="small"
                className="form-text text-danger title-error"
              />

              <Field type="hidden" name="name" id="name" />
              <Field type="hidden" name="identifier" id="identifier" readOnly={true} />
              <Field type="hidden" name="version" id="version" readOnly={true} />
              <Field
                type="hidden"
                name="taskGenerationStatus"
                id="taskGenerationStatus"
                readOnly={true}
              />
              <Field
                type="hidden"
                name="teamAssignmentStatus"
                id="teamAssignmentStatus"
                readOnly={true}
              />
            </FormGroup>
            <FormGroup>
              <Label for="status">{STATUS_HEADER}</Label>
              <Field
                required={true}
                component="select"
                name="status"
                id="status"
                disabled={disabledFields.includes('status')}
                className={errors.status ? 'form-control is-invalid' : 'form-control'}
              >
                {Object.entries(PlanStatus)
                  .filter(e => !disAllowedStatusChoices.includes(e[1]))
                  .map(e => (
                    <option key={e[0]} value={e[1]}>
                      {planStatusDisplay[e[1]]}
                    </option>
                  ))}
              </Field>
              <ErrorMessage
                name="status"
                component="small"
                className="form-text text-danger status-error"
              />
            </FormGroup>
            <FormGroup>
              <Label for="start">{PLAN_START_DATE_LABEL}</Label>
              <Field
                required={true}
                type="date"
                name="start"
                id="start"
                disabled={disabledFields.includes('start')}
                dateFormat={DATE_FORMAT}
                className={errors.start ? 'form-control is-invalid' : 'form-control'}
                component={DatePickerWrapper}
              />
              <ErrorMessage
                name="start"
                component="small"
                className="form-text text-danger start-error"
              />

              <Field type="hidden" name="date" id="date" />
            </FormGroup>
            <FormGroup>
              <Label for="end">{PLAN_END_DATE_LABEL}</Label>
              <Field
                required={true}
                type="date"
                name="end"
                id="end"
                disabled={disabledFields.includes('end')}
                dateFormat={DATE_FORMAT}
                className={errors.end ? 'form-control is-invalid' : 'form-control'}
                component={DatePickerWrapper}
                minDate={values.start}
              />
              <ErrorMessage
                name="end"
                component="small"
                className="form-text text-danger end-error"
              />
            </FormGroup>
            <h4 className="mt-5">{ACTIVITIES_LABEL}</h4>
            <FieldArray
              name="activities"
              /* tslint:disable-next-line jsx-no-lambda */
              render={arrayHelpers => (
                <div>
                  {values.activities.map((arrItem, index) => (
                    <div className="card mb-3" key={`div${arrItem.actionCode}-${index}`}>
                      <h5 className="card-header position-relative">
                        {values.activities[index].actionTitle}
                        {values.activities &&
                          values.activities.length > 1 &&
                          (!editMode || addAndRemoveActivities) && (
                            <button
                              type="button"
                              className="close position-absolute removeArrItem removeActivity"
                              aria-label="Close"
                              onClick={() => {
                                /** when we remove an item, we want to also remove its value from
                                 * the values object otherwise the Formik state gets out of sync
                                 */
                                arrayHelpers.remove(index);
                                const newActivityValues = getConditionAndTriggers(
                                  values.activities.filter(
                                    e => e.actionCode !== values.activities[index].actionCode
                                  ),
                                  disabledFields.includes('activities')
                                );
                                setActionConditions(newActivityValues.conditions);
                                setActionTriggers(newActivityValues.triggers);
                              }}
                            >
                              <span aria-hidden="true">&times;</span>
                            </button>
                          )}
                      </h5>
                      <div className="card-body">
                        <fieldset key={`fieldset${arrItem.actionCode}-${index}`}>
                          {errors.activities && errors.activities[index] && (
                            <div
                              className={`alert alert-danger activities-${index}-errors`}
                              role="alert"
                            >
                              <h6 className="alert-heading">{PLEASE_FIX_THESE_ERRORS}</h6>
                              <ul className="list-unstyled">
                                {Object.entries(errors.activities[index] || {}).map(
                                  ([key, val]) => (
                                    <li key={key} id={`${key}-${index}-error`}>
                                      <strong>{key}</strong>: {val}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          <FormGroup hidden={hiddenFields.includes('activityActionTitle')}>
                            <Label for={`activities-${index}-actionTitle`}>{ACTION}</Label>
                            <Field
                              type="text"
                              name={`activities[${index}].actionTitle`}
                              id={`activities-${index}-actionTitle`}
                              required={true}
                              disabled={
                                disabledFields.includes('activities') ||
                                disabledActivityFields.includes('actionTitle')
                              }
                              className={
                                errors.activities &&
                                doesFieldHaveErrors('actionTitle', index, errors.activities)
                                  ? 'form-control is-invalid'
                                  : 'form-control'
                              }
                            />
                            <ErrorMessage
                              name={`activities[${index}].actionTitle`}
                              component="small"
                              className="form-text text-danger"
                            />

                            <Field
                              type="hidden"
                              name={`activities[${index}].actionCode`}
                              id={`activities-${index}-actionCode`}
                              value={values.activities[index].actionCode}
                              readOnly={true}
                            />
                            <Field
                              type="hidden"
                              name={`activities[${index}].actionIdentifier`}
                              id={`activities-${index}-actionIdentifier`}
                              value={values.activities[index].actionIdentifier}
                              readOnly={true}
                            />
                          </FormGroup>
                          <FormGroup hidden={hiddenFields.includes('activityActionDescription')}>
                            <Label for={`activities-${index}-actionDescription`}>
                              {DESCRIPTION_LABEL}
                            </Label>
                            <Field
                              component="textarea"
                              name={`activities[${index}].actionDescription`}
                              id={`activities-${index}-actionDescription`}
                              required={true}
                              disabled={
                                disabledFields.includes('activities') ||
                                disabledActivityFields.includes('actionDescription')
                              }
                              className={
                                errors.activities &&
                                doesFieldHaveErrors('actionDescription', index, errors.activities)
                                  ? 'form-control is-invalid'
                                  : 'form-control'
                              }
                            />
                            <ErrorMessage
                              name={`activities[${index}].actionDescription`}
                              component="small"
                              className="form-text text-danger"
                            />
                            <Field
                              type="hidden"
                              name={`activities[${index}].goalDescription`}
                              id={`activities-${index}-goalDescription`}
                              value={values.activities[index].actionDescription}
                            />
                          </FormGroup>
                          <FormGroup hidden={hiddenFields.includes('activityActionReason')}>
                            <Label for={`activities-${index}-actionReason`}>{REASON_HEADER}</Label>
                            <Field
                              component="select"
                              name={`activities[${index}].actionReason`}
                              id={`activities-${index}-actionReason`}
                              required={true}
                              disabled={
                                (disabledFields.includes('activities') ||
                                  disabledActivityFields.includes('actionReason')) &&
                                !addAndRemoveActivities
                              }
                              className={
                                errors.activities &&
                                doesFieldHaveErrors('actionReason', index, errors.activities)
                                  ? 'form-control is-invalid'
                                  : 'form-control'
                              }
                            >
                              {actionReasons.map(e => (
                                <option key={e} value={e}>
                                  {actionReasonsDisplay[e]}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name={`activities[${index}].actionReason`}
                              component="small"
                              className="form-text text-danger"
                            />
                          </FormGroup>
                          {showDefinitionUriFor.includes(values.interventionType) && (
                            <FormGroup
                              hidden={hiddenFields.includes('activityActionDefinitionUri')}
                            >
                              <Label for={`activities-${index}-actionDefinitionUri`}>
                                {DEFINITION_URI}
                              </Label>
                              <Field
                                type="text"
                                name={`activities[${index}].actionDefinitionUri`}
                                id={`activities-${index}-actionDefinitionUri`}
                                required={true}
                                disabled={
                                  disabledFields.includes('activities') ||
                                  disabledActivityFields.includes('actionDefinitionUri')
                                }
                                className={
                                  errors.activities &&
                                  doesFieldHaveErrors(
                                    'actionDefinitionUri',
                                    index,
                                    errors.activities
                                  )
                                    ? 'form-control is-invalid'
                                    : 'form-control'
                                }
                              />
                              <ErrorMessage
                                name={`activities[${index}].actionDefinitionUri`}
                                component="small"
                                className="form-text text-danger"
                              />
                              <Field
                                type="hidden"
                                name={`activities[${index}].goalDefinitionUri`}
                                id={`activities-${index}-goalDefinitionUri`}
                                value={values.activities[index].actionDefinitionUri}
                              />
                            </FormGroup>
                          )}
                          <fieldset>
                            <legend>{GOAL_LABEL}</legend>
                            <FormGroup hidden={hiddenFields.includes('activityGoalValue')}>
                              <Label for={`activities-${index}-goalValue`}>{QUANTITY_LABEL}</Label>
                              <InputGroup id={`activities-${index}-goalValue-input-group`}>
                                <Field
                                  type="number"
                                  name={`activities[${index}].goalValue`}
                                  id={`activities-${index}-goalValue`}
                                  required={true}
                                  disabled={
                                    disabledFields.includes('activities') ||
                                    disabledActivityFields.includes('goalValue') ||
                                    values.activities[index].actionCode ===
                                      MDA_POINT_ADVERSE_EFFECTS_CODE
                                  }
                                  className={
                                    errors.activities &&
                                    doesFieldHaveErrors('goalValue', index, errors.activities)
                                      ? 'form-control is-invalid'
                                      : 'form-control'
                                  }
                                />
                                <InputGroupAddon addonType="append">
                                  <InputGroupText>
                                    {
                                      goalUnitDisplay[
                                        getGoalUnitFromActionCode(
                                          values.activities[index]
                                            .actionCode as PlanActionCodesType,
                                          values.interventionType
                                        )
                                      ]
                                    }
                                  </InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                              <ErrorMessage
                                name={`activities[${index}].goalValue`}
                                component="small"
                                className="form-text text-danger"
                              />
                            </FormGroup>
                            <FormGroup hidden={hiddenFields.includes('activityTimingPeriodStart')}>
                              <Label for={`activities-${index}-timingPeriodStart`}>
                                {START_DATE}
                              </Label>
                              <Field
                                type="date"
                                name={`activities[${index}].timingPeriodStart`}
                                id={`activities-${index}-timingPeriodStart`}
                                required={true}
                                disabled={
                                  disabledFields.includes('activities') ||
                                  disabledActivityFields.includes('timingPeriodStart')
                                }
                                dateFormat={DATE_FORMAT}
                                className={
                                  errors.activities &&
                                  doesFieldHaveErrors('timingPeriodStart', index, errors.activities)
                                    ? 'form-control is-invalid'
                                    : 'form-control'
                                }
                                component={DatePickerWrapper}
                                minDate={values.start}
                                maxDate={values.end}
                              />
                              <ErrorMessage
                                name={`activities[${index}].timingPeriodStart`}
                                component="small"
                                className="form-text text-danger"
                              />
                            </FormGroup>
                            <FormGroup hidden={hiddenFields.includes('activityTimingPeriodEnd')}>
                              <Label for={`activities-${index}-timingPeriodEnd`}>{END_DATE}</Label>
                              <Field
                                type="date"
                                name={`activities[${index}].timingPeriodEnd`}
                                id={`activities-${index}-timingPeriodEnd`}
                                required={true}
                                disabled={
                                  disabledFields.includes('activities') ||
                                  disabledActivityFields.includes('timingPeriodEnd')
                                }
                                dateFormat={DATE_FORMAT}
                                className={
                                  errors.activities &&
                                  doesFieldHaveErrors('timingPeriodEnd', index, errors.activities)
                                    ? 'form-control is-invalid'
                                    : 'form-control'
                                }
                                component={DatePickerWrapper}
                                minDate={values.activities[index].timingPeriodStart}
                                maxDate={values.end}
                              />
                              <ErrorMessage
                                name={`activities[${index}].timingPeriodEnd`}
                                component="small"
                                className="form-text text-danger"
                              />
                              <Field
                                type="hidden"
                                name={`activities[${index}].goalDue`}
                                id={`activities-${index}-goalDue`}
                                value={values.activities[index].timingPeriodEnd || ''}
                              />
                            </FormGroup>
                            <FormGroup hidden={hiddenFields.includes('activityGoalPriority')}>
                              <Label for={`activities-${index}-goalPriority`}>
                                {PRIORITY_LABEL}
                              </Label>
                              <Field
                                component="select"
                                name={`activities[${index}].goalPriority`}
                                id={`activities-${index}-goalPriority`}
                                required={true}
                                disabled={
                                  (disabledFields.includes('activities') ||
                                    disabledActivityFields.includes('goalPriority')) &&
                                  !addAndRemoveActivities
                                }
                                className={
                                  errors.activities &&
                                  doesFieldHaveErrors('goalPriority', index, errors.activities)
                                    ? 'form-control is-invalid'
                                    : 'form-control'
                                }
                              >
                                {goalPriorities.map(e => (
                                  <option key={e} value={e}>
                                    {goalPrioritiesDisplay[e]}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name={`activities[${index}].goalPriority`}
                                component="small"
                                className="form-text text-danger"
                              />
                            </FormGroup>
                          </fieldset>
                          {(actionTriggers.hasOwnProperty(values.activities[index].actionCode) ||
                            actionConditions.hasOwnProperty(
                              values.activities[index].actionCode
                            )) && (
                            <div id={`plan-trigger-conditions-div-${index}`}>
                              <Button
                                className="btn-light btn-block"
                                id={`plan-trigger-conditions-${index}`}
                                hidden={hiddenFields.includes('triggersAndConditions')}
                              >
                                {`${TRIGGERS_LABEL} ${AND} ${CONDITIONS_LABEL}`}
                              </Button>
                              <UncontrolledCollapse toggler={`#plan-trigger-conditions-${index}`}>
                                <Card>
                                  <CardBody>
                                    <React.Fragment>
                                      {actionTriggers.hasOwnProperty(
                                        values.activities[index].actionCode
                                      ) && (
                                        <fieldset className="triggers-fieldset">
                                          <legend>{TRIGGERS_LABEL}</legend>
                                          {actionTriggers[values.activities[index].actionCode]}
                                        </fieldset>
                                      )}
                                      {actionConditions.hasOwnProperty(
                                        values.activities[index].actionCode
                                      ) && (
                                        <fieldset className="conditions-fieldset">
                                          <legend>{CONDITIONS_LABEL}</legend>
                                          {actionConditions[values.activities[index].actionCode]}
                                        </fieldset>
                                      )}
                                    </React.Fragment>
                                  </CardBody>
                                </Card>
                              </UncontrolledCollapse>
                            </div>
                          )}
                        </fieldset>
                      </div>
                    </div>
                  ))}
                  {values.activities &&
                    values.activities.length >= 1 &&
                    !checkIfAllActivitiesSelected(values, getAddedActivities(initialValues)) &&
                    (!editMode || addAndRemoveActivities) && (
                      <div>
                        <Button
                          color="danger"
                          className="add-more-activities"
                          onClick={toggleActivityModal}
                        >
                          {ADD_ACTIVITY}
                        </Button>
                        <Modal
                          backdrop={false}
                          size="lg"
                          isOpen={activityModal}
                          toggle={toggleActivityModal}
                          className="activity-modal"
                        >
                          <ModalHeader toggle={toggleActivityModal}>
                            {ADD_ACTIVITY}
                            <button
                              type="button"
                              className="close"
                              data-dismiss="modal"
                              aria-label="Close"
                              style={{ color: '6c757d', fontSize: '30px' }}
                            >
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </ModalHeader>
                          <ModalBody>
                            {/** we want to allow the user to only add activities that are not already selected */}
                            <ul className="list-unstyled">
                              {getSourceActivities(values, initialValues.activities)
                                .filter(
                                  e =>
                                    !values.activities.map(f => f.actionCode).includes(e.actionCode)
                                )
                                .map(thisActivity => (
                                  <li key={thisActivity.actionCode}>
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm mb-1 addActivity"
                                      onClick={() => {
                                        const newActivities = [...values.activities, thisActivity];
                                        setFieldValue('activities', newActivities);
                                        const newActivityValues = getConditionAndTriggers(
                                          newActivities,
                                          disabledFields.includes('activities')
                                        );
                                        setActionConditions(newActivityValues.conditions);
                                        setActionTriggers(newActivityValues.triggers);
                                      }}
                                    >
                                      {format(ADD_CODED_ACTIVITY, thisActivity.actionCode)}
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </ModalBody>
                        </Modal>
                      </div>
                    )}
                  {/** Turn off modal if all activities selected */}
                  {checkIfAllActivitiesSelected(values, getAddedActivities(initialValues)) &&
                    setActivityModal(false)}
                </div>
              )}
            />
            {aboutToRetirePlan && formPayLoad && (
              <Modal
                backdrop={false}
                size="sm"
                isOpen={true}
                className="align-items-center retire-plans-modal"
              >
                <ModalHeader>{RETIRE_PLAN_MESSAGE}</ModalHeader>
                <ModalBody>
                  <RetirePlanForm
                    {...{
                      cancelCallBack,
                      payload: formPayLoad,
                      savePlan,
                      setSubmittingCallBack: setSubmitting,
                    }}
                  />
                </ModalBody>
              </Modal>
            )}
            <hr className="mb-2" />
            <Button
              type="submit"
              id="planform-submit-button"
              className="btn btn-block"
              color="primary"
              aria-label={SAVE_PLAN}
              disabled={isSubmitting || Object.keys(errors).length > 0 || !isValid}
            >
              {isSubmitting ? SAVING : SAVE_PLAN}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export const defaultProps: PlanFormProps = {
  actionCreator: fetchPlanRecords,
  addAndRemoveActivities: false,
  allFormActivities: getFormActivities(planActivities),
  allowMoreJurisdictions: true,
  autoSelectFIStatus: false,
  beforeSubmit: () => true,
  cascadingSelect: true,
  disabledActivityFields: [],
  disabledFields: [],
  formHandler: (_, __) => void 0,
  hiddenFields: [],
  initialValues: defaultInitialValues,
  jurisdictionLabel: FOCUS_AREA_HEADER,
  redirectAfterAction: PLAN_LIST_URL,
};

/** props for updating plan definition objects
 * We are defining these here to keep things DRY
 */
export const propsForUpdatingPlans = (
  planStatus: string = PlanStatus.DRAFT
): Partial<PlanFormProps> => {
  let disabledFields = [
    'interventionType',
    'fiReason',
    'fiStatus',
    'identifier',
    'name',
    'caseNum',
    'opensrpEventId',
    'jurisdictions',
  ];
  const fieldsForActivePlan = [
    'activities',
    'date',
    'end',
    'fiReason',
    'fiStatus',
    'start',
    'taskGenerationStatus',
    'teamAssignmentStatus',
    'title',
    'version',
  ];
  const fieldsForCompletePlans = ['status'];
  disabledFields =
    planStatus === PlanStatus.ACTIVE ? [...disabledFields, ...fieldsForActivePlan] : disabledFields;
  disabledFields =
    planStatus === PlanStatus.COMPLETE || planStatus === PlanStatus.RETIRED
      ? [...disabledFields, ...fieldsForCompletePlans, ...fieldsForActivePlan]
      : disabledFields;
  return {
    disabledActivityFields: ['actionReason', 'goalPriority'],
    disabledFields,
  };
};

PlanForm.defaultProps = defaultProps;

export default PlanForm;

import { Dictionary } from '@onaio/utils';
import { Field } from 'formik';
import React from 'react';
import { FormGroup, Label } from 'reactstrap';
import { DESCRIPTION_LABEL, EXPRESSION_LABEL, NAME } from '../../../../configs/lang';
import { PlanActivityFormFields } from '../types';

/**
 * Returns form components to render triggers and conditions form fields
 * @param planActivities - activities from the plan form field values
 * @param disabledFields - whether to disable the fields or not
 */
export const getConditionAndTriggers = (
  planActivities: PlanActivityFormFields[],
  disabledFields: boolean = true
) => {
  const conditions: Dictionary = {};
  const triggers: Dictionary = {};
  for (let index = 0; index < planActivities.length; index++) {
    const element = planActivities[index];

    if (element.condition) {
      conditions[element.actionCode] = element.condition.map((item, mapIndex) => {
        return (
          <FormGroup
            className="condition-group"
            row={true}
            key={`${element.actionCode}-condition-${index}-${mapIndex}`}
          >
            {item.expression && (
              <React.Fragment>
                <Label for={`activities[${index}].condition[${mapIndex}].expression`} sm={2}>
                  {EXPRESSION_LABEL}
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].condition[${mapIndex}].expression`}
                  id={`activities[${index}].condition[${mapIndex}].expression`}
                  disabled={disabledFields}
                />
              </React.Fragment>
            )}
            {item.description && (
              <React.Fragment>
                <Label for={`activities[${index}].condition[${mapIndex}].description`} sm={2}>
                  {DESCRIPTION_LABEL}
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].condition[${mapIndex}].description`}
                  id={`activities[${index}].condition[${mapIndex}].description`}
                  disabled={disabledFields}
                />
              </React.Fragment>
            )}
            {item.subjectCodableConceptText && (
              <React.Fragment>
                <Field
                  className="form-control col-sm-10"
                  required={false}
                  component="textarea"
                  name={`activities[${index}].condition[${mapIndex}].subjectCodableConceptText`}
                  id={`activities[${index}].condition[${mapIndex}].subjectCodableConceptText`}
                  disabled={true}
                  hidden={true}
                />
              </React.Fragment>
            )}
          </FormGroup>
        );
      });
    }
    if (element.trigger) {
      triggers[element.actionCode] = element.trigger.map((item, mapIndex) => {
        return (
          <FormGroup
            className="trigger-group"
            row={true}
            key={`${element.actionCode}-trigger-${index}-${mapIndex}`}
          >
            {item.name && (
              <React.Fragment>
                <Label for={`activities[${index}].trigger[${mapIndex}].name`} sm={2}>
                  {NAME}
                </Label>
                <Field
                  className="form-control col-sm-10"
                  sm={10}
                  required={true}
                  type="text"
                  name={`activities[${index}].trigger[${mapIndex}].name`}
                  id={`activities[${index}].trigger[${mapIndex}].name`}
                  disabled={disabledFields}
                />
              </React.Fragment>
            )}
            {item.expression && (
              <React.Fragment>
                <Label for={`activities[${index}].trigger[${mapIndex}].expression`} sm={2}>
                  {EXPRESSION_LABEL}
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].trigger[${mapIndex}].expression`}
                  id={`activities[${index}].trigger[${mapIndex}].expression`}
                  disabled={disabledFields}
                />
              </React.Fragment>
            )}
            {item.description && (
              <React.Fragment>
                <Label for={`activities[${index}].trigger[${mapIndex}].description`} sm={2}>
                  {DESCRIPTION_LABEL}
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={false}
                  component="textarea"
                  name={`activities[${index}].trigger[${mapIndex}].description`}
                  id={`activities[${index}].trigger[${mapIndex}].description`}
                  disabled={disabledFields}
                />
              </React.Fragment>
            )}
          </FormGroup>
        );
      });
    }
  }
  return {
    conditions,
    triggers,
  };
};

import { Dictionary } from '@onaio/utils';
import { Field } from 'formik';
import React from 'react';
import { FormGroup, Label } from 'reactstrap';
import { PlanActivityFormFields } from '../helpers';

export const getConditionAndTriggers = (planActivities: PlanActivityFormFields[]) => {
  // This is still WIP
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
            key={`${element.actionCode}-${index}-condition-${mapIndex}`}
          >
            {item.expression && (
              <React.Fragment>
                <Label for={`activities[${index}].condition[${mapIndex}].expression`} sm={2}>
                  Condition
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].condition[${mapIndex}].expression`}
                  id={`activities[${index}].condition[${mapIndex}].expression`}
                />
              </React.Fragment>
            )}
            {item.description && (
              <React.Fragment>
                <Label for={`activities[${index}].condition[${mapIndex}].description`} sm={2}>
                  Description
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].condition[${mapIndex}].description`}
                  id={`activities[${index}].condition[${mapIndex}].description`}
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
            key={`${element.actionCode}-${index}-trigger-${mapIndex}`}
          >
            {item.name && (
              <React.Fragment>
                <Label for={`activities[${index}].trigger[${mapIndex}].name`} sm={2}>
                  Name
                </Label>
                <Field
                  className="form-control col-sm-10"
                  sm={10}
                  required={true}
                  type="text"
                  name={`activities[${index}].trigger[${mapIndex}].name`}
                  id={`activities[${index}].trigger[${mapIndex}].name`}
                />
              </React.Fragment>
            )}
            {item.description && (
              <React.Fragment>
                <Label for={`activities[${index}].trigger[${mapIndex}].expression`} sm={2}>
                  Condition
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={true}
                  component="textarea"
                  name={`activities[${index}].trigger[${mapIndex}].expression`}
                  id={`activities[${index}].trigger[${mapIndex}].expression`}
                />
              </React.Fragment>
            )}
            {item.expression && (
              <React.Fragment>
                <Label for={`activities[${index}].trigger[${mapIndex}].description`} sm={2}>
                  Description
                </Label>
                <Field
                  className="form-control col-sm-10"
                  required={false}
                  component="textarea"
                  name={`activities[${index}].trigger[${mapIndex}].description`}
                  id={`activities[${index}].trigger[${mapIndex}].description`}
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

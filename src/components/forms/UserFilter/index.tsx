/** dropdown component that shows a list of users and propagates that information
 * to other components through the url
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getUser } from '@onaio/session-reducer';
import queryString from 'query-string';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import { ENABLE_DEFAULT_PLAN_USER_FILTER } from '../../../configs/env';
import { FILTER, SELECT_USERNAME, USER } from '../../../configs/lang';
import { QUERY_PARAM_USER } from '../../../constants';
import { getQueryParams } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import store from '../../../store';
import { DropDownRenderer } from '../../DropDownRenderer';
import UserIdSelect, { OptionTypes } from '../PractitionerForm/UserIdSelect';
import './index.css';

/** props for BaseUserFilter Component */
interface BaseUserSelectFilterProps {
  onChangeHandler?: (option: OptionTypes) => void;
  serviceClass: typeof OpenSRPService;
}

/** the default props */
const defaultProps = {
  serviceClass: OpenSRPService,
};

/** combined props for BaseUserSelectorFilter */
export type BaseUserSelectFilterPropTypes = BaseUserSelectFilterProps & RouteComponentProps;

export const defaultHandler = (option: OptionTypes, props: BaseUserSelectFilterPropTypes) => {
  const allQueryParams = getQueryParams(props.location);
  if (option) {
    const targetValue = option.value;
    // modify just the user query param and leave the rest
    allQueryParams[QUERY_PARAM_USER] = targetValue;
  } else {
    // make sure we do not have this as a search parameter
    delete allQueryParams[QUERY_PARAM_USER];
  }
  props.history.push(`${props.match.url}?${queryString.stringify(allQueryParams)}`);
};

/** presentational component that renders a filter where you can select an user
 * that then filters plans that the user has access to.
 *
 * This component is a wrapper around the UserIdSelect component
 */
export const BaseUserSelectFilter = (props: BaseUserSelectFilterPropTypes) => {
  let defaultUserNameValue = getQueryParams(props.location)[QUERY_PARAM_USER] as string | undefined;
  defaultUserNameValue = defaultUserNameValue ? defaultUserNameValue : SELECT_USERNAME;

  const onChangeHandler = (option: OptionTypes) => {
    // a custom onChangeHandler will override the default implementation
    if (props.onChangeHandler) {
      props.onChangeHandler(option);
      return;
    }
    defaultHandler(option, props);
  };

  useEffect(() => {
    if (!(defaultUserNameValue === SELECT_USERNAME && ENABLE_DEFAULT_PLAN_USER_FILTER)) {
      return;
    }

    const { username } = getUser(store.getState());
    const option = {
      label: username,
      value: username,
    };
    // tslint:disable-next-line: no-unused-expression
    props.onChangeHandler?.(option) ?? defaultHandler(option, props);
  }, []);

  const userIdSelectProps = {
    ReactSelectDefaultValue: { label: defaultUserNameValue, value: defaultUserNameValue },
    onChangeHandler,
    serviceClass: OpenSRPService,
    showPractitioners: true,
    userNameAsValue: true,
  };

  const filterActive = defaultUserNameValue !== SELECT_USERNAME && !!defaultUserNameValue.trim();

  return (
    <DropDownRenderer
      filterActive={filterActive}
      // tslint:disable-next-line:jsx-no-lambda
      renderToggle={() => (
        <>
          <span className="mr-2">{FILTER}</span>
          <FontAwesomeIcon icon="sliders-h" />
        </>
      )}
      // tslint:disable-next-line: jsx-no-lambda
      renderMenu={() => (
        <DropdownMenu className="adhoc-filters">
          <h6>{FILTER}</h6>
          <div className="form-group row">
            <div className="col-sm-4">
              <label>{USER}</label>
            </div>
            <div className="col-sm-8">
              <UserIdSelect {...userIdSelectProps} />
            </div>
          </div>
        </DropdownMenu>
      )}
    />
  );
};

const UserSelectFilter = withRouter(BaseUserSelectFilter);
UserSelectFilter.defaultProps = defaultProps;
export { UserSelectFilter };

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import queryString from 'querystring';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Input } from 'reactstrap';
import { SEARCH } from '../../../configs/lang';
import { QUERY_PARAM_TITLE } from '../../../constants';
import { getQueryParams } from '../../../helpers/utils';
import './index.css';

/** call handler function after this many milliseconds since when it was last invoked */
export const DEBOUNCE_HANDLER_MS = 1000;

/** function type for custom onChangeHandler functions */
export type OnChangeType = (event: React.ChangeEvent<HTMLInputElement>) => void;

/**
 * Interface for SearchForm props
 */
export interface BaseSearchFormProps {
  placeholder: string;
  queryParam: string;
  onChangeHandler?: OnChangeType;
}

/**
 * default props for SerchForm component
 */
export const defaultSearchProps = {
  placeholder: SEARCH,
  queryParam: QUERY_PARAM_TITLE,
};

type SeachInputPropsType = BaseSearchFormProps & RouteComponentProps<{}>;

/** Base SearchForm component */
const BaseSearchForm = (props: SeachInputPropsType) => {
  const { placeholder, queryParam, onChangeHandler } = props;

  const onchangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = event.target.value;
    if (onChangeHandler) {
      onChangeHandler(event);
      return;
    }
    const allQueryParams = getQueryParams(props.location);
    if (targetValue) {
      allQueryParams[queryParam] = targetValue;
    } else {
      delete allQueryParams[queryParam];
    }

    props.history.push(`${props.match.url}?${queryString.stringify(allQueryParams)}`);
  };

  const debouncedOnChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();
    const debouncedFn = debounce(
      (ev: React.ChangeEvent<HTMLInputElement>) => onchangeHandler(ev),
      DEBOUNCE_HANDLER_MS
    );
    debouncedFn(event);
  };

  return (
    <div className="search-input-wrapper">
      <FontAwesomeIcon className="search-icon" icon="search" />
      <Input
        className="form-control search-input"
        type="text"
        name="search"
        placeholder={placeholder}
        onInput={debouncedOnChangeHandler}
      />
    </div>
  );
};

BaseSearchForm.defaultProps = defaultSearchProps;

const SearchForm = withRouter(BaseSearchForm);

export default SearchForm;

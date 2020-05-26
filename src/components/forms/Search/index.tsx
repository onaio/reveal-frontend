import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import queryString from 'querystring';
import React, { ChangeEvent } from 'react';
import { RouteComponentProps } from 'react-router';
import { SEARCH } from '../../../configs/lang';
import { getQueryParams } from '../../../helpers/utils';
import './search.css';

/** call handler function after this many milliseconds since when it was last invoked */
export const DEBOUNCE_HANDLER_MS = 1000;

/** function type for custom onChangeHandler functions */
export type OnChangeType = (event: ChangeEvent<HTMLInputElement>) => void;

/**
 * Interface for SearchForm props
 */
export interface SearchFormProps {
  placeholder: string;
  onChangeHandler: OnChangeType;
}

/**
 * default props for SearchForm component
 */
export const defaultSearchProps = {
  onChangeHandler: () => {
    return;
  },
  placeholder: SEARCH,
};

/** Base SearchForm component */
const SearchForm = (props: SearchFormProps) => {
  const { placeholder, onChangeHandler } = props;

  /** inbuilt default onChangeHandler that debounces the passed changeHandler
   * @param {ChangeEvent<HTMLInputElement>} event - the input event
   */
  const debouncedOnChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    event.persist();
    const debouncedFn = debounce(
      (ev: ChangeEvent<HTMLInputElement>) => onChangeHandler(ev),
      DEBOUNCE_HANDLER_MS
    );
    debouncedFn(event);
  };

  return (
    <div className="search-input-wrapper">
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text bg-transparent border-right-0" id="basic-addon1">
            <FontAwesomeIcon className="search-icon" icon="search" />
          </span>
        </div>
        <input
          type="text"
          className="form-control border-left-0 border search-input"
          aria-label="search"
          aria-describedby="basic-addon1"
          name="search"
          placeholder={placeholder}
          onInput={debouncedOnChangeHandler}
        />
      </div>
    </div>
  );
};

SearchForm.defaultProps = defaultSearchProps;

export { SearchForm };

/** A util that adds reveal domain specific way of handling the input change event
 * in the SearchForm component.
 * @param {string} queryParam - the string to be used as the key when constructing searchParams
 * @param {T} T - the component props; should include RouteComponentProps
 */
export const createChangeHandler = <T extends RouteComponentProps>(
  queryParam: string,
  props: T
) => {
  return (event: ChangeEvent<HTMLInputElement>) => {
    const targetValue = event.target.value;
    const allQueryParams = getQueryParams(props.location);
    if (targetValue) {
      allQueryParams[queryParam] = targetValue;
    } else {
      delete allQueryParams[queryParam];
    }

    props.history.push(`${props.match.url}?${queryString.stringify(allQueryParams)}`);
  };
};

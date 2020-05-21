import { History, Location } from 'history';
import React, { useEffect, useState } from 'react';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { SEARCH } from '../../../configs/lang';
import { QUERY_PARAM_TITLE } from '../../../constants';
import { getQueryParams } from '../../../helpers/utils';

/**
 * Interface for handleSearchChange event handler
 */
export type Change = (event: React.ChangeEvent<HTMLInputElement>) => void;

/**
 * Interface for handleSubmit event handler
 */
export type Submit = (event: React.FormEvent<HTMLFormElement>) => void;

/**
 * Interface for SearchForm props
 */
export interface SearchFormProps {
  history: History;
  location: Location;
  placeholder: string;
}

/**
 * default props for SerchForm component
 */
export const defaultSearchFormProps = {
  placeholder: SEARCH,
};

/** SearchForm component */
export const SearchForm = (props: SearchFormProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery((getQueryParams(props.location)[QUERY_PARAM_TITLE] as string) || '');
  }, []);

  const handleSearchChange: Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit: Submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.history.push({
      search: `?${QUERY_PARAM_TITLE}=${searchQuery}`,
    });
  };

  return (
    <Form inline={true} onSubmit={handleSubmit}>
      <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
        <Input
          type="text"
          name="search"
          placeholder={props.placeholder}
          onChange={handleSearchChange}
          value={searchQuery}
        />
      </FormGroup>
      <Button outline={true} color="success">
        {SEARCH}
      </Button>
    </Form>
  );
};

SearchForm.defaultProps = defaultSearchFormProps;

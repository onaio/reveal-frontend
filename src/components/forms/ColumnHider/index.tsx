import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DrillDownInstanceProps } from '@onaio/drill-down-table';
import React from 'react';
import { DropdownMenu } from 'reactstrap';
import uuid from 'uuid/v1';
import { CUSTOMIZE_COLUMNS, CUSTOMIZE_COLUMNS_FILTER_MESSAGE } from '../../../configs/lang';
import { DropDownRenderer } from '../../DropDownRenderer';
import './index.css';

export const ColumnHider = <T extends object>({ allColumns }: DrillDownInstanceProps<T>) => {
  /** This is where this component might occur more than once in the page, like in FI pages
   * Primarily its to add some noise to the id  for the checkboxes so that they remain unique
   * per page.
   */
  const salt = uuid();
  const anyColumnHidden = allColumns.some(column => !column.isVisible);
  return (
    <>
      <DropDownRenderer
        filterActive={anyColumnHidden}
        // tslint:disable-next-line: jsx-no-lambda
        renderToggle={() => (
          <>
            <span className="mr-2">{CUSTOMIZE_COLUMNS}</span>
            <FontAwesomeIcon icon="cog" />
          </>
        )}
        // tslint:disable-next-line: jsx-no-lambda
        renderMenu={() => (
          <DropdownMenu className="p-3 column-hider" style={{ minWidth: '220px' }}>
            <h6>{CUSTOMIZE_COLUMNS}</h6>
            <p>
              <small>{CUSTOMIZE_COLUMNS_FILTER_MESSAGE}</small>
            </p>
            {allColumns.map((column: any) => (
              <div className="form-check checkbox" key={column.id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  {...column.getToggleHiddenProps()}
                  id={`${salt}-${column.id}`}
                />
                <label className="form-check-label" htmlFor={`${salt}-${column.id}`}>
                  {column.Header}
                </label>
              </div>
            ))}
          </DropdownMenu>
        )}
      />
    </>
  );
};

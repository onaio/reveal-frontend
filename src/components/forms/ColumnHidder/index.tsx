import React from 'react';
import { DropdownMenu } from 'reactstrap';
import { CUSTOMIZE_COLUMNS, CUSTOMIZE_COLUMNS_FILTER_MESSAGE } from '../../../configs/lang';
import { DropDownRenderer } from '../../DropDownRenderer';
import { ActualTableInstanceProps } from '../../Table/DrillDownFilters/components/TableJSX';
import './index.css';

export const ColumnHider = <T extends object>({ allColumns }: ActualTableInstanceProps<T>) => {
  return (
    <>
      <DropDownRenderer
        // tslint:disable-next-line: jsx-no-lambda
        renderToggle={() => CUSTOMIZE_COLUMNS}
        // tslint:disable-next-line: jsx-no-lambda
        renderMenu={() => (
          <DropdownMenu className="p-3" style={{ minWidth: '220px' }}>
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
                  id={column.id}
                />
                <label className="form-check-label" htmlFor={column.id}>
                  {column.id}
                </label>
              </div>
            ))}
          </DropdownMenu>
        )}
      />
    </>
  );
};

import React from 'react';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { CUSTOMIZE_COLUMNS, CUSTOMIZE_COLUMNS_FILTER_MESSAGE } from '../../helpers/constants';
import { ActualTableInstanceProps } from '../TableJSX';
import './index.css';

/** DropDownRenderer props */
export interface DropDownRendererProps {
  renderMenu: () => React.ReactNode;
  renderToggle: () => React.ReactNode;
}

/** default props */
export const defaultDropDownRenderProps = {
  renderMenu: () => null,
  renderToggle: () => null,
};

/** a wrapper used to render filter buttons on the table's filter bar */
export const DropDownRenderer = (props: DropDownRendererProps = defaultDropDownRenderProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <Dropdown
      size="sm"
      className="mr-3 drop-down-container"
      style={{ display: 'inline' }}
      isOpen={isOpen}
      toggle={toggle}
    >
      <DropdownToggle outline={true} className="filter-bar-btns">
        {props.renderToggle()}
      </DropdownToggle>
      {props.renderMenu()}
    </Dropdown>
  );
};

export const ColumnHidder = <T extends object>({ allColumns }: ActualTableInstanceProps<T>) => {
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

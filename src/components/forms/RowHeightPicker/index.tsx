import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import { ROW_HEIGHT } from '../../../configs/lang';
import { rowHeights } from '../../../configs/settings';
import { DropDownRenderer } from '../../DropDownRenderer';
import './index.css';

/** render prop for the call to action button */
export const rowHeightRenderToggle = () => (
  <>
    <span className="mr-2">{ROW_HEIGHT}</span>
    <FontAwesomeIcon icon="text-height" />{' '}
  </>
);

/** props for RowHeightFilter component */
export interface Props {
  changeHandler: (value: string) => void /** callback called when the filter value is changed */;
  rowHeightsConfs: Dictionary<{ label: string; value: string }>;
}

/** default props for RowHeightFilter component */
export const defaultProps = {
  changeHandler: () => {
    return;
  },
  rowHeightsConfs: rowHeights,
};

/** renders a Dropdown ui from which users can customize the density-feel of
 * table rows.
 */
const RowHeightFilter = (props: Props) => {
  const [rowHeight, setRowHeight] = React.useState<string>('');

  const onClickHandler = (value: string) => {
    window.localStorage.setItem('rowHeight', value);
    setRowHeight(value);
    props.changeHandler(value);
  };
  return (
    <DropDownRenderer
      filterActive={!!rowHeight.trim()}
      renderToggle={rowHeightRenderToggle}
      // tslint:disable-next-line: jsx-no-lambda
      renderMenu={() => (
        <>
          <DropdownMenu className="row-height mb-2">
            <h6>{ROW_HEIGHT}</h6>
            {Object.values(props.rowHeightsConfs).map(({ label, value }, index) => {
              return (
                <div key={`row-height-${index}`} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="rowHeight"
                    id={label}
                    value={value}
                    checked={rowHeight === value}
                    onChange={() => onClickHandler(value)}
                  />
                  <label className="form-check-label" htmlFor={label}>
                    {label}
                  </label>
                </div>
              );
            })}
          </DropdownMenu>
        </>
      )}
    />
  );
};

RowHeightFilter.defaultProps = defaultProps;

export { RowHeightFilter };

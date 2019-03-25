import ElementMap from '@onaio/element-map';
import * as React from 'react';
import { CellInfo } from 'react-table';
import { GREEN, ORANGE, RED, YELLOW } from '../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, THRESHOLD_137, YELLOW_THRESHOLD } from '../constants';
import { FlexObject, percentage } from '../helpers/utils';

/** Returns a table cell rendered with different colors based on focus
 * investigation response adherence conditional formatting
 */
export function getFIAdherenceIndicator(cell: CellInfo) {
  return (
    <div
      className="indicator-container"
      style={{
        backgroundColor:
          cell.value >= GREEN_THRESHOLD
            ? GREEN
            : cell.value >= ORANGE_THRESHOLD
            ? ORANGE
            : cell.value >= YELLOW_THRESHOLD
            ? RED
            : YELLOW,
      }}
    >
      {percentage(cell.value)}
    </div>
  );
}

/** Returns a value formatted for Focus Investigation 1-3-7 adherence
 */
export function get137Value(value: number): string {
  if (value < 0) {
    return '<1';
  }
  return `${value}`;
}

/** Returns a table cell rendered with different colors based on focus
 * investigation 1-3-7 adherence conditional formatting
 */
export function get137AdherenceIndicator(cell: CellInfo) {
  return (
    <div
      className="137-container"
      style={{
        color: cell.value > THRESHOLD_137 ? GREEN : cell.value < THRESHOLD_137 ? RED : ORANGE,
      }}
    >
      {cell.value}d to go
    </div>
  );
}

/** Renders a row of Focus Investigation classifications */
export function renderClassificationRow(rowObject: FlexObject) {
  return (
    <tr key={rowObject.code} className="definitions">
      <ElementMap items={[rowObject.code, rowObject.name, rowObject.description]} HTMLTag="td" />
    </tr>
  );
}

import * as React from 'react';
import { CellInfo } from 'react-table';
import { GREEN, ORANGE, RED, YELLOW } from '../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, THRESHOLD_137, YELLOW_THRESHOLD } from '../constants';
import { percentage } from '../helpers/utils';

/** Returns a table cell rendered with different colors based on focus
 * investigation response adherence conditional formatting
 */
export function getFIAdherencendicator(cell: CellInfo) {
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

/** Returns a table cell rendered with different colors based on focus
 * investigation 1-3-7 adherence conditional formatting
 */
export function get137Adherencendicator(cell: CellInfo) {
  return (
    <div
      className="indicator-container"
      style={{
        color: cell.value > THRESHOLD_137 ? GREEN : cell.value < THRESHOLD_137 ? RED : ORANGE,
      }}
    >
      {cell.value}d to go
    </div>
  );
}

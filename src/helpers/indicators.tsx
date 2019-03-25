import * as React from 'react';
import { CellInfo } from 'react-table';
import { GREEN, ORANGE, RED, YELLOW } from '../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, THRESHOLD_137, YELLOW_THRESHOLD } from '../constants';
import { percentage } from '../helpers/utils';

/** Returns a table cell rendered with different colors based on focus
 * investigation response adherence conditional formatting
 */
export function getFIAdherencendicator(row: CellInfo) {
  return (
    <div
      className="indicator-container"
      style={{
        backgroundColor:
          row.value >= GREEN_THRESHOLD
            ? GREEN
            : row.value >= ORANGE_THRESHOLD
            ? ORANGE
            : row.value >= YELLOW_THRESHOLD
            ? RED
            : YELLOW,
      }}
    >
      {percentage(row.value)}
    </div>
  );
}

/** Returns a table cell rendered with different colors based on focus
 * investigation 1-3-7 adherence conditional formatting
 */
export function get137Adherencendicator(row: CellInfo) {
  return (
    <div
      className="indicator-container"
      style={{
        color: row.value > THRESHOLD_137 ? GREEN : row.value < THRESHOLD_137 ? RED : ORANGE,
      }}
    >
      {row.value}d to go
    </div>
  );
}

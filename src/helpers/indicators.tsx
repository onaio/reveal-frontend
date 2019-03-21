import * as React from 'react';
import { CellInfo } from 'react-table';
import { GREEN, ORANGE, RED, YELLOW } from '../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, YELLOW_THRESHOLD } from '../constants';
import { percentage } from '../helpers/utils';

/** Returns a table cell rendered with different colors based on row value */
export function getTableCellIndicator(row: CellInfo) {
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

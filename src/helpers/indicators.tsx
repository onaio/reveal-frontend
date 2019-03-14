import * as React from 'react';
import { CellInfo } from 'react-table';
import {
  GREEN,
  GREEN_THRESHOLD,
  ORANGE,
  ORANGE_THRESHOLD,
  RED,
  YELLOW,
  YELLOW_THRESHOLD,
} from '../constants';

export function getTableCellIndicator(row: CellInfo) {
  return (
    <div
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
      {row.value}
    </div>
  );
}

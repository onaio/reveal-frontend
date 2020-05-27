import React from 'react';
import { CellInfo } from 'react-table-v6';
import * as colors from '../colors';
import {
  GREEN_THRESHOLD,
  IndicatorThresholds,
  ORANGE_THRESHOLD,
  YELLOW_THRESHOLD,
} from '../configs/settings';
import { getThresholdColor } from './indicators';

/** Props for ProgressBar */
interface ProgressBarProps {
  decimalPoints: number;
  height: string;
  indicatorThresholds: IndicatorThresholds | null;
  min: number;
  max: number;
  value: number;
}

/** default props for ProgressBar */
const defaultProgressBarProps: Partial<ProgressBarProps> = {
  decimalPoints: 0,
  height: '10px',
  indicatorThresholds: null,
  max: 100,
  min: 0,
};

/** Displays configurable progress bar */
const ProgressBar = (props: ProgressBarProps) => {
  const { decimalPoints, height, indicatorThresholds, value } = props;
  const max = props.max || 100;
  const min = props.min || 0;
  let range = max - min;
  if (range <= 0) {
    range = 100;
  }
  const decimalValue = value / range;
  const percentValue = decimalValue * 100;
  const percentValueString = percentValue.toFixed(decimalPoints);

  const backgroundColor = indicatorThresholds
    ? getThresholdColor({ value } as CellInfo, indicatorThresholds, true)
    : decimalValue >= GREEN_THRESHOLD
    ? colors.GREEN
    : decimalValue >= ORANGE_THRESHOLD
    ? colors.ORANGE
    : decimalValue >= YELLOW_THRESHOLD
    ? colors.RED
    : colors.YELLOW;

  return (
    <div className="progress" style={{ height, marginBottom: '15px' }}>
      <div
        className={`progress-bar`}
        style={{
          backgroundColor,
          width: `${percentValueString}%`,
        }}
        role="progressbar"
        aria-valuenow={percentValue}
        aria-valuemin={min}
        aria-valuemax={max}
      />
    </div>
  );
};

ProgressBar.defaultProps = defaultProgressBarProps;

export default ProgressBar;

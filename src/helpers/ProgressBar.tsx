import { Color } from 'csstype';
import React from 'react';
import * as colors from '../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, YELLOW_THRESHOLD, ZERO } from '../configs/settings';

/** Marker? - a small vertical line on the progress bar that will visually inform of a certain limit */
interface Marker {
  height?: string /** customizable css style height */;
  width?: string /** how fat do you want it to be */;
  markAt: string /** percentage value as string; from left of progressbar that the marker should appear */;
  color?: Color /** shat color should the marker be */;
  top?: string /** how far up the marker should be rendered relative to top of progressbar */;
}

/** Props for ProgressBar */
interface ProgressBarProps {
  decimalPoints: number;
  height: string;
  min: number;
  max: number;
  value: number;
  marker: Marker | null;
}

/** default props for ProgressBar */
const defaultProgressBarProps: Partial<ProgressBarProps> = {
  decimalPoints: 0,
  height: '10px',
  max: 100,
  min: 0,
};

/** Displays configurable progress bar */
const ProgressBar = (props: ProgressBarProps) => {
  const { decimalPoints, height, value, marker } = props;
  const max = props.max || 100;
  const min = props.min || 0;
  let range = max - min;
  if (range <= 0) {
    range = 100;
  }
  const decimalValue = value / range;
  const percentValue = decimalValue * 100;
  const percentValueString = percentValue.toFixed(decimalPoints);

  return (
    <div className="marked-progress-bar" style={{ position: 'relative' }}>
      {!!marker && (
        <div
          className="marker"
          id="marker"
          style={{
            backgroundColor: marker.color ? marker.color : '#F00',
            height: marker.height ? marker.height : '25px',
            left: marker.markAt,
            position: 'absolute',
            top: marker.top ? marker.top : '-5px',
            width: marker.width ? marker.width : '5px',
            zIndex: 1,
          }}
        >
          &nbsp;
        </div>
      )}
      <div className="progress" style={{ height, marginBottom: '15px', position: 'relative' }}>
        <div
          className={`progress-bar`}
          style={{
            backgroundColor:
              decimalValue >= GREEN_THRESHOLD
                ? colors.GREEN
                : decimalValue >= ORANGE_THRESHOLD
                ? colors.ORANGE
                : decimalValue >= YELLOW_THRESHOLD
                ? colors.RED
                : colors.YELLOW,
            width: `${percentValueString}%`,
          }}
          role="progressbar"
          aria-valuenow={percentValue}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

ProgressBar.defaultProps = defaultProgressBarProps;

export default ProgressBar;

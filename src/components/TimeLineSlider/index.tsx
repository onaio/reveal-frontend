import { findIndex } from 'lodash';
import React from 'react';
import './index.css';

export interface Stop {
  labelInStop: string | number;
  labelBelowStop: string | number;
  keys: Array<string | number> | string | number;
}

export interface TimelineSliderProps {
  stops: Stop[];
  keyOfCurrentStop: number | string;
}

export const getCurrentStopFromKey = (stops: Stop[], currentStopKey: string | number) => {
  return findIndex(stops, (stop: Stop) => {
    const keys = Array.isArray(stop.keys) ? stop.keys : [stop.keys];
    return keys.includes(currentStopKey);
  });
};

export const TimelineSlider = (props: TimelineSliderProps) => {
  const { stops, keyOfCurrentStop } = props;
  // find the stop with the keyOfCurrentStop as part of keys
  const currentStopIndex = getCurrentStopFromKey(stops, keyOfCurrentStop);
  return (
    <>
      <ol className="step-slider">
        {stops.map((stop: Stop, index: number) => {
          return (
            <li
              className={
                index < currentStopIndex
                  ? 'is-complete'
                  : index === currentStopIndex
                  ? 'is-active'
                  : ''
              }
              data-step={`${stop.labelInStop}`}
              key={`${index}-step-slider-stop`}
            >
              {stop.labelBelowStop}
            </li>
          );
        })}
      </ol>
    </>
  );
};

import { DropDownCellProps } from '@onaio/drill-down-table/dist/types';
import ElementMap from '@onaio/element-map';
import { Dictionary } from '@onaio/utils';
import { percentage } from '@onaio/utils';
import { keys } from 'lodash';
import * as React from 'react';
import { Cell } from 'react-table';
import { GREEN, ORANGE, RED, WHITE, YELLOW } from '../colors';
import { PERSONS, STRUCTURES } from '../configs/lang';
import {
  GREEN_THRESHOLD,
  IndicatorThresholds,
  indicatorThresholdsIRS,
  indicatorThresholdsIRSLite,
  ORANGE_THRESHOLD,
  YELLOW_THRESHOLD,
} from '../configs/settings';
import { BLOOD_SCREENING_CODE, CASE_CONFIRMATION_CODE, INHERIT } from '../constants';
import { IndicatorThresholdItemPercentage, roundToPrecision } from '../helpers/utils';
import { Goal } from '../store/ducks/goals';

/** Enum describing operators */
enum Operators {
  Equal = '=',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
}

/** Get the level of achievement towards the goal target as a ratio
 * @param {Goal} goal - the goal
 * @returns {number} ratio Achieved
 */
export function goalRatioAchieved(goal: Goal): number {
  let ratioAchieved: number = 0;
  const achievedValue: number = goal.completed_task_count;
  const totalAttempts: number = goal.task_count;
  let targetValue: number = goal.goal_value;

  // set the actual target value for percentages
  if (goal.goal_unit.toLowerCase() === 'percent') {
    targetValue = roundToPrecision((targetValue * totalAttempts) / 100);
  }

  if (targetValue === 0) {
    return 0; /** Not yet supported */
  }

  // get the completed ratio
  ratioAchieved = roundToPrecision(achievedValue / targetValue, 2);

  if (
    goal.goal_comparator === Operators.LessThan ||
    goal.goal_comparator === Operators.LessThanOrEqual
  ) {
    // in this case we are targeting a reduction
    ratioAchieved = 0; /** Not yet supported */
  }

  return ratioAchieved;
}

/** interface for Goal report */
export interface GoalReport {
  achievedValue: number /** the achieved value */;
  percentAchieved: number /** progress towards goal achievement */;
  prettyPercentAchieved: string | null /** pretty string of percentAchieved */;
  targetValue: number /** the target value */;
  goalUnit: string /** goal_unit */;
}

/** Utility function to get an object containing values for goal indicators
 * @param {Goal} goal - the goal
 * @returns {GoalReport} the Goal Report object
 */
export function getGoalReport(goal: Goal): GoalReport {
  const percentAchieved = goalRatioAchieved(goal);
  let targetValue;
  let goalUnit: string = goal.goal_unit;
  if (goal.goal_unit.toLowerCase() !== 'percent') {
    targetValue = goal.goal_value;
  } else {
    goalUnit =
      [CASE_CONFIRMATION_CODE as string, BLOOD_SCREENING_CODE as string].indexOf(goal.action_code) >
      -1
        ? PERSONS
        : STRUCTURES;
    targetValue = Math.round((goal.goal_value * goal.task_count) / 100);

    /** Use goal.goal_value as target if unit==='Percent' && goal.task_count === 0 */
    targetValue = targetValue === 0 ? goal.goal_value : targetValue;
  }

  return {
    achievedValue: goal.completed_task_count,
    goalUnit,
    percentAchieved,
    prettyPercentAchieved: IndicatorThresholdItemPercentage(percentAchieved),
    targetValue,
  };
}

/** Returns a table cell rendered with different colors based on focus
 * investigation response adherence conditional formatting
 */
export function getFIAdherenceIndicator(cell: Cell) {
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
      {IndicatorThresholdItemPercentage(cell.value)}
    </div>
  );
}

/** Renders a row of Focus Investigation classifications */
export function renderClassificationRow(rowObject: Dictionary) {
  return (
    <tr key={rowObject.code} className="definitions">
      <ElementMap items={[rowObject.code, rowObject.name, rowObject.description]} HTMLTag="td" />
    </tr>
  );
}

/** Determines the color of a indicator based on cell.value and threshold configs
 * @param {Cell} cell - the ReactTable.Cell being rendered in an indicator drill-down table
 * @param {IndicatorThresholds} thresholds - the threshold configuration from settings
 * @param {boolean} doMakeDecimal -  determines if the cell value needs to be divided by 100
 * @returns {string} - the value corresponding the cell.value according to the reporting config
 */
export function getThresholdColor(
  cell: Cell,
  thresholds: IndicatorThresholds,
  doMakeDecimal: boolean = false
) {
  // get the keys of the thresholds and sort them by value
  const thresholdKeys = keys(thresholds).sort((a, b) => thresholds[a].value - thresholds[b].value);
  const value = doMakeDecimal ? cell.value / 100 : cell.value;

  // loop through thresholds and evaluate value against cell.value
  let k: string = '';
  for (k of thresholdKeys) {
    if (thresholds[k].orEquals ? value <= thresholds[k].value : value < thresholds[k].value) {
      return thresholds[k].color;
    }
  }

  // if value is greater than the biggest threshold, assign it the biggest threshold's color
  if (k.length) {
    return thresholds[k].color;
  }

  // fallback to white
  return WHITE;
}

/** Renders an indicator Cell based on cell.value and threshold configs
 * @param {Cell} cell - the ReactTable.Cell being rendered in an indicator drilldown table
 * @param {IndicatorThresholds | null} thresholds - the indicator thresholds
 * @returns {React.ReactElement} - the ReactTable.Cell element to be rendered for the indicator
 */
export function getIRSThresholdAdherenceIndicator(
  cell: Cell,
  thresholds: IndicatorThresholds | null = indicatorThresholdsIRS
) {
  // determine if cell.value is a number
  const isNumber = !Number.isNaN(Number(cell.value));
  // determine cell background color
  const cellColor = isNumber ? (thresholds ? getThresholdColor(cell, thresholds) : WHITE) : INHERIT;

  return (
    <div className="irs-report-indicator-container" style={{ backgroundColor: cellColor }}>
      {isNumber ? IndicatorThresholdItemPercentage(cell.value) : ''}
    </div>
  );
}

/** Renders an indicator Cell based on cell.value and threshold configs
 * @param {Cell} cell - the ReactTable.Cell being rendered in an indicator drilldown table
 * @param {IndicatorThresholds | null} thresholds - the indicator thresholds
 * @returns {React.ReactElement} - the ReactTable.Cell element to be rendered for the indicator
 */
export function getIRSLiteThresholdAdherenceIndicator(
  cell: Cell,
  thresholds: IndicatorThresholds | null = indicatorThresholdsIRSLite
) {
  // determine if cell.value is a number
  const isNumber = !Number.isNaN(Number(cell.value));
  // determine cell background color
  const cellColor = isNumber ? (thresholds ? getThresholdColor(cell, thresholds) : WHITE) : INHERIT;

  return (
    <div className="irs-report-indicator-container" style={{ backgroundColor: cellColor }}>
      {isNumber ? IndicatorThresholdItemPercentage(cell.value) : ''}
    </div>
  );
}

export function renderPercentage(cell: Cell) {
  // determine if cell.value is a number
  const isNumber = !Number.isNaN(Number(cell.value));

  return isNumber ? percentage(cell.value, 2).value : '';
}

/** default drillDown CellComponent for jurisdiction reporting
 * @param {DropDownCellProps} props - the ReactTable.Cell being rendered in an indicator drilldown table
 */
export function DefaultTableCell(props: DropDownCellProps) {
  const { hasChildren, cellValue } = props;
  return (
    <span className={`plan-jurisdiction-name ${hasChildren ? 'btn-link' : ''}`}>{cellValue}</span>
  );
}

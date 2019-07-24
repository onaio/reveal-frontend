import ElementMap from '@onaio/element-map';
import * as React from 'react';
import { CellInfo } from 'react-table';
import { GREEN, ORANGE, RED, YELLOW } from '../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, YELLOW_THRESHOLD, ZERO } from '../configs/settings';
import { BLOOD_SCREENING_CODE, CASE_CONFIRMATION_CODE, PERSONS, STRUCTURES } from '../constants';
import { FlexObject, percentage, roundToPrecision } from '../helpers/utils';
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
  prettyPercentAchieved: string /** pretty string of percentAchieved */;
  targetValue: number /** the target value */;
  goalUnit: string /** goal_unit */;
}

/** Utility function to get an object containing values for goal indicators
 * @param {Goal} goal - the goal
 * @returns {GoalReport} the Goal Report object
 */
export function getGoalReport(goal: Goal): GoalReport {
  const percentAchieved = goalRatioAchieved(goal);
  let targetValue = goal.task_count;
  let goalUnit: string = goal.goal_unit;
  if (goal.goal_unit.toLowerCase() !== 'percent') {
    targetValue = goal.goal_value;
  } else {
    goalUnit =
      [CASE_CONFIRMATION_CODE, BLOOD_SCREENING_CODE].indexOf(goal.action_code) > -1
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
    prettyPercentAchieved: percentage(percentAchieved),
    targetValue,
  };
}

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
        color: cell.value > ZERO ? GREEN : cell.value < ZERO ? RED : ORANGE,
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

import ElementMap from '@onaio/element-map';
import * as React from 'react';
import { CellInfo } from 'react-table';
import { GREEN, ORANGE, RED, YELLOW } from '../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, YELLOW_THRESHOLD, ZERO } from '../configs/settings';
import { FlexObject, percentage } from '../helpers/utils';
import { Goal } from '../store/ducks/goals';

/** Enum describing operators */
enum Operators {
  Equal = '=',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
}

/** Get the level of achievement towards the goal target as a percentage
 * @param {Goal} goal - the goal
 * @returns {number} percentAchieved
 */
export function goalPercentAchieved(goal: Goal): number {
  let percentAchieved: number = 0;
  let achievedValue: number = goal.completed_task_count;
  const totalAttempts: number = goal.task_count;
  const targetValue: number = goal.goal_value;

  // deal with percentages if needed
  if (goal.goal_unit.toLowerCase() === 'percent') {
    if (totalAttempts === 0) {
      achievedValue = 0;
    } else {
      achievedValue = (achievedValue / totalAttempts) * 100;
    }
  }

  if (targetValue === 0) {
    return 0; /** Not yet supported */
  }

  if (achievedValue === targetValue) {
    return achievedValue / targetValue;
  }

  if (
    goal.goal_comparator === Operators.LessThan ||
    goal.goal_comparator === Operators.LessThanOrEqual
  ) {
    // in this case we are targeting a reduction
    percentAchieved = 0; /** Not yet supported */
  } else {
    // in this case we are targeting an increase
    percentAchieved = achievedValue / targetValue;
  }

  return percentAchieved;
}

/** interface for Goal report */
export interface GoalReport {
  achievedValue: number /** the achieved value */;
  percentAchieved: number /** progress towards goal achievement */;
  prettyPercentAchieved: string /** pretty string of percentAchieved */;
  targetValue: number /** the target value */;
}

/** Utility function to get an object containing values for goal indicators
 * @param {Goal} goal - the goal
 * @returns {GoalReport} the Goal Report object
 */
export function getGoalReport(goal: Goal): GoalReport {
  const percentAchieved = goalPercentAchieved(goal);
  let targetValue = goal.task_count;
  if (goal.goal_unit.toLowerCase() !== 'percent') {
    targetValue = goal.goal_value;
  }

  return {
    achievedValue: goal.completed_task_count,
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

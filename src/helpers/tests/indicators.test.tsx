import { map } from 'lodash';
import { Cell } from 'react-table';
import { PERSONS, STRUCTURES } from '../../configs/lang';
import { indicatorThresholdsIRS } from '../../configs/settings';
import { Goal } from '../../store/ducks/goals';
import * as fixtures from '../../store/ducks/tests/fixtures';
import {
  getGoalReport,
  getIRSLiteThresholdAdherenceIndicator,
  getIRSThresholdAdherenceIndicator,
  goalRatioAchieved,
  renderPercentage,
} from '../indicators';

describe('helpers/indicators', () => {
  it('goalPercentAchieved works', () => {
    // returns correct percentage for all goal_unit values
    const expected: number[] = [0, 0, 0, 1, 0.27, 0.36, 0.03];
    const got = map(fixtures.goals, goal => goalRatioAchieved(goal as Goal));
    expect(got).toEqual(expected);
  });

  it('goalPercentAchieved works for reducing goals', () => {
    const goal = {
      action_code: 'Blood Screening',
      action_description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      action_prefix: '4',
      action_reason: 'Investigation',
      action_title: 'RACD Blood screening',
      completed_task_count: 100,
      goal_comparator: '<',
      goal_id: 'RACD_blood_screening_1km_radius',
      goal_unit: 'pints',
      goal_value: 30,
      id: '19b86421-3cb2-5698-9f11-c1bdafbe5e6d',
      jurisdiction_id: '1337',
      measure: 'Percent of registered people tested',
      plan_id: '1337',
      task_business_status_map: {},
      task_count: 100,
    };
    expect(goalRatioAchieved(goal as Goal)).toEqual(0);
  });

  it('goalPercentAchieved works for target that is 0', () => {
    const goal = {
      action_code: 'Blood Screening',
      action_description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      action_prefix: '4',
      action_reason: 'Investigation',
      action_title: 'RACD Blood screening',
      completed_task_count: 100,
      goal_comparator: '<',
      goal_id: 'RACD_blood_screening_1km_radius',
      goal_unit: 'percent',
      goal_value: 0,
      id: '19b86421-3cb2-5698-9f11-c1bdafbe5e6d',
      jurisdiction_id: '1337',
      measure: 'Percent of registered people tested',
      plan_id: '1337',
      task_business_status_map: {},
      task_count: 100,
    };
    expect(goalRatioAchieved(goal as Goal)).toEqual(0);
  });

  it('getGoalReport works', () => {
    expect(getGoalReport(fixtures.goal1 as Goal)).toEqual({
      achievedValue: 0,
      goalUnit: 'each',
      percentAchieved: 0,
      prettyPercentAchieved: '0%',
      targetValue: 1,
    });
    expect(getGoalReport(fixtures.goal2 as Goal)).toEqual({
      achievedValue: 0,
      goalUnit: 'each',
      percentAchieved: 0,
      prettyPercentAchieved: '0%',
      targetValue: 3,
    });
    expect(getGoalReport(fixtures.goal3 as Goal)).toEqual({
      achievedValue: 0,
      goalUnit: PERSONS,
      percentAchieved: 0,
      prettyPercentAchieved: '0%',
      targetValue: 100,
    });
    expect(getGoalReport(fixtures.goal4 as Goal)).toEqual({
      achievedValue: 3,
      goalUnit: 'traps',
      percentAchieved: 1,
      prettyPercentAchieved: '100%',
      targetValue: 3,
    });
    expect(getGoalReport(fixtures.goal5 as Goal)).toEqual({
      achievedValue: 4,
      goalUnit: STRUCTURES,
      percentAchieved: 0.27,
      prettyPercentAchieved: '27%',
      targetValue: 15,
    });
    expect(getGoalReport(fixtures.goal6 as Goal)).toEqual({
      achievedValue: 4,
      goalUnit: STRUCTURES,
      percentAchieved: 0.36,
      prettyPercentAchieved: '36%',
      targetValue: 11,
    });
    expect(getGoalReport(fixtures.goal7 as Goal)).toEqual({
      achievedValue: 3,
      goalUnit: STRUCTURES,
      percentAchieved: 0.6,
      prettyPercentAchieved: '60%',
      targetValue: 5,
    });
  });

  it('getIRSThresholdAdherenceIndicator works', () => {
    expect(
      getIRSThresholdAdherenceIndicator({ value: 0.91 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.91');
    expect(
      getIRSThresholdAdherenceIndicator({ value: 0.81 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.81');
    expect(
      getIRSThresholdAdherenceIndicator({ value: 0.21 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.21');
    expect(
      getIRSThresholdAdherenceIndicator({ value: 0.11 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.11');
    expect(
      getIRSThresholdAdherenceIndicator({ value: ':)' } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('invalid number');
  });

  it('getIRSLiteThresholdAdherenceIndicator works', () => {
    expect(
      getIRSLiteThresholdAdherenceIndicator({ value: 0.91 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.91');
    expect(
      getIRSLiteThresholdAdherenceIndicator({ value: 0.81 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.81');
    expect(
      getIRSLiteThresholdAdherenceIndicator({ value: 0.21 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.21');
    expect(
      getIRSLiteThresholdAdherenceIndicator({ value: 0.11 } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('0.11');
    expect(
      getIRSLiteThresholdAdherenceIndicator({ value: ':)' } as Cell, indicatorThresholdsIRS)
    ).toMatchSnapshot('invalid number');
  });

  it('renderPercentage works', () => {
    expect(renderPercentage({ value: 0.91 } as Cell)).toEqual('91.00%');
    expect(renderPercentage({ value: 0.176666666 } as Cell)).toEqual('17.67%');
    expect(renderPercentage({ value: 1333.37 } as Cell)).toEqual('133337.00%');
    expect(renderPercentage({ value: 'mosh' } as Cell)).toEqual('');
  });
});

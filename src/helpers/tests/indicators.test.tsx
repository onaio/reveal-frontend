import { map } from 'lodash';
import * as fixtures from '../../store/ducks/tests/fixtures';
import { getGoalReport, goalRatioAchieved } from '../indicators';

describe('helpers/indicators', () => {
  it('goalPercentAchieved works', () => {
    // returns correct percentage for all goal_unit values
    const expected: number[] = [0, 0, 0, 1, 0.27, 0.36];
    const got = map(fixtures.goals, goal => goalRatioAchieved(goal));
    expect(got).toEqual(expected);
  });

  it('goalPercentAchieved works for reducing goals', () => {
    const goal = {
      action_code: 'Blood Screening',
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
    expect(goalRatioAchieved(goal)).toEqual(0);
  });

  it('goalPercentAchieved works for target that is 0', () => {
    const goal = {
      action_code: 'Blood Screening',
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
    expect(goalRatioAchieved(goal)).toEqual(0);
  });

  it('getGoalReport works', () => {
    expect(getGoalReport(fixtures.goal1)).toEqual({
      achievedValue: 0,
      percentAchieved: 0,
      prettyPercentAchieved: '0%',
      targetValue: 1,
    });
    expect(getGoalReport(fixtures.goal2)).toEqual({
      achievedValue: 0,
      percentAchieved: 0,
      prettyPercentAchieved: '0%',
      targetValue: 3,
    });
    expect(getGoalReport(fixtures.goal3)).toEqual({
      achievedValue: 0,
      percentAchieved: 0,
      prettyPercentAchieved: '0%',
      targetValue: 0,
    });
    expect(getGoalReport(fixtures.goal4)).toEqual({
      achievedValue: 3,
      percentAchieved: 1,
      prettyPercentAchieved: '100%',
      targetValue: 3,
    });
    expect(getGoalReport(fixtures.goal5)).toEqual({
      achievedValue: 4,
      percentAchieved: 0.27,
      prettyPercentAchieved: '27%',
      targetValue: 15,
    });
    expect(getGoalReport(fixtures.goal6)).toEqual({
      achievedValue: 4,
      percentAchieved: 0.36,
      prettyPercentAchieved: '36%',
      targetValue: 11,
    });
    expect(getGoalReport(fixtures.goal7)).toEqual({
      achievedValue: 3,
      percentAchieved: 0.6,
      prettyPercentAchieved: '60%',
      targetValue: 5,
    });
  });
});

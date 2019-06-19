import * as fixtures from '../../store/ducks/tests/fixtures';
import { getGoalReport, goalPercentAchieved } from '../indicators';

describe('helpers/indicators', () => {
  it('goalPercentAchieved works', () => {
    expect(goalPercentAchieved(fixtures.goal1)).toEqual(0);
    expect(goalPercentAchieved(fixtures.goal4)).toEqual(
      fixtures.goal4.completed_task_count / fixtures.goal4.goal_value
    );
    expect(goalPercentAchieved(fixtures.goal5)).toEqual(
      ((fixtures.goal5.completed_task_count / fixtures.goal5.task_count) * 100) /
        fixtures.goal5.goal_value
    );
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
    expect(goalPercentAchieved(goal)).toEqual(0);
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
    expect(goalPercentAchieved(goal)).toEqual(0);
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
      percentAchieved: 0.26666666666666666,
      prettyPercentAchieved: '27%',
      targetValue: 15,
    });
  });
});

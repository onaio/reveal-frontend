import * as fixtures from '../../store/ducks/tests/fixtures';
import { goalPercentAchieved } from '../indicators';

describe('helpers/indicators', () => {
  it('goalPercentAchieved works', () => {
    // expect(goalPercentAchieved(fixtures.goal1)).toEqual(0);
    expect(goalPercentAchieved(fixtures.goal4)).toEqual(
      fixtures.goal4.completed_task_count / fixtures.goal4.goal_value
    );
    expect(goalPercentAchieved(fixtures.goal5)).toEqual(
      ((fixtures.goal5.completed_task_count / fixtures.goal5.task_count) * 100) /
        fixtures.goal5.goal_value
    );
  });
});

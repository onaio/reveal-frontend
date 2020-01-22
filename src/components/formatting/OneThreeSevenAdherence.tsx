import React from 'react';
import { Table } from 'reactstrap';
import * as colors from '../../colors';
import {
  CONDITIONAL_FORMATTING_TITLE,
  FOCUS_INVESTIGATION_START_TITLE,
  ONE_DAY_TO_GO,
  ZERO_DAYS_TO_GO,
} from '../../configs/lang';
import { GREEN, ORANGE, RED } from '../../constants';

/** Displays conditional formatting guide for Focus Investigation 1-3-7 Adherence */
const OneThreeSevenAdherence: React.ElementType = props => {
  return (
    <div>
      <h5 className="mt-4 mb-3">{CONDITIONAL_FORMATTING_TITLE}</h5>
      <h6 className="mb-3">{FOCUS_INVESTIGATION_START_TITLE}</h6>
      <div className="row">
        <div className="col-3">
          <Table className="text-center">
            <tbody>
              <tr style={{ background: colors.GREEN }}>
                <td>
                  {GREEN} {'>='} {ONE_DAY_TO_GO}
                </td>
              </tr>
              <tr style={{ background: colors.ORANGE }}>
                <td>
                  {ORANGE} {ZERO_DAYS_TO_GO}
                </td>
              </tr>
              <tr style={{ background: colors.RED }}>
                <td>
                  {RED} {'<'} {ZERO_DAYS_TO_GO}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OneThreeSevenAdherence;

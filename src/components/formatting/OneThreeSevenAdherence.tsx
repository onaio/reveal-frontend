import React from 'react';
import { Table } from 'reactstrap';
import * as colors from '../../colors';
import { GREEN, ORANGE, RED, THRESHOLD_137 } from '../../constants';

/** Displays conditional formatting guide for Focus Investigation Response Adherence */
const OneThreeSevenAdherence: React.ElementType = props => {
  return (
    <div>
      <h5 className="mt-4 mb-3">Conditional Formatting</h5>
      <h6 className="mb-3">Focus Investigation Start</h6>
      <div className="row">
        <div className="col-3">
          <Table className="text-center">
            <tbody>
              <tr style={{ background: colors.GREEN }}>
                <td>
                  {GREEN} > {THRESHOLD_137} days to go
                </td>
              </tr>
              <tr style={{ background: colors.ORANGE }}>
                <td>
                  {ORANGE} {THRESHOLD_137} days to go
                </td>
              </tr>
              <tr style={{ background: colors.RED }}>
                <td>
                  {RED} {'<'} {THRESHOLD_137} days to go
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

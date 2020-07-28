/** Resource Calculation component
 * going to be a side panel that calculates the ETA for an available
 * number of teams to be visit a variable number of structures in selected
 * jurisdictions.
 */

import React, { Dispatch, SetStateAction, useState } from 'react';
import { Input } from 'reactstrap';

export interface ResourceCalculationProps {
  structuresCount: number;
}

export const ResourceCalculation = (props: ResourceCalculationProps) => {
  const [numStructures, setNumStructures] = useState<number>(0);
  const [numTeams, setNumTeams] = useState<number>(0);

  const computeEstimate = (structures: number, teams: number) => {
    if (teams === 0) {
      return 0;
    }
    return structures / teams;
  };

  const numDays = computeEstimate(numStructures, numTeams);
  const inputHandlerFactory = (callback: Dispatch<SetStateAction<number>>) => {
    const handler = (event: React.ChangeEvent<HTMLInputElement>) => {
      callback(event.target.value);
    };
    return handler;
  };

  const structuresInputHandler = inputHandlerFactory(setNumStructures);
  const teamsInputHandler = inputHandlerFactory(setNumTeams);

  return (
    <div>
      <p>
        {`${numDays} days`}
        <br />
        at a rate of <Input
          id="r-c-structures"
          type="number"
          onInput={structuresInputHandler}
        />{' '}
        structures per team per day with{' '}
        <Input id="r-c-teams" type="number" onInput={teamsInputHandler} /> teams
      </p>
    </div>
  );
};

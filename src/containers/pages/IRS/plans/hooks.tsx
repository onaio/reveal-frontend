import { SupersetFormData } from '@onaio/superset-connector/dist/types';
import React, { useEffect, useState } from 'react';
import { ActionCreator } from 'redux';
import { SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { displayError } from '../../../../helpers/errors';
import supersetFetch from '../../../../services/superset';

interface AsyncSupersetPlans<TData, TAction> {
  superset: typeof supersetFetch;
  data: TData[];
  fetchPlans: ActionCreator<TAction>;
  supersetSlice: string;
  supersetOptions: SupersetFormData | null;
}

export const useAsyncSupersetPlans = <TData, TAction>({
  superset = supersetFetch,
  data = [],
  fetchPlans,
  supersetSlice = SUPERSET_IRS_REPORTING_PLANS_SLICE,
  supersetOptions = null,
}: AsyncSupersetPlans<TData, TAction>) => {
  const [loading, setLoading] = useState<boolean>(false);
  const mounted = React.useRef<boolean>(false);

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(data.length === 0); // only set loading when there are no plans
      const asyncOperation = supersetOptions
        ? superset(supersetSlice, supersetOptions)
        : superset(supersetSlice);

      await asyncOperation.then((result: TData[]) => fetchPlans(result));
    } catch (e) {
      throw e;
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    loadData().catch(error => displayError(error));
    return () => {
      mounted.current = false;
    };
  }, []);

  return loading;
};

import ListView from '@onaio/list-view';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/page/Loading';
import { NO_ROWS_FOUND } from '../../configs/lang';
import { displayError } from '../../helpers/errors';
import supersetFetch from '../../services/superset';
import {
  FetchMDAPointSchoolReportAction,
  SchoolReport,
} from '../../store/ducks/generic/MDASchoolReport';

export interface GenericSupersetDataTableProps {
  data: React.ReactNode[][];
  fetchItems: typeof FetchMDAPointSchoolReportAction;
  headerItems: React.ReactNode[];
  service: typeof supersetFetch;
  supersetSliceId: string;
  tableClass: string;
}

export const GenericSupersetDataTable = (props: GenericSupersetDataTableProps) => {
  const { supersetSliceId, fetchItems, service, data, headerItems } = props;

  const [loading, setLoading] = useState<boolean>(false);

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(data.length < 1); // only set loading when there are no plans
      await service(supersetSliceId).then((result: SchoolReport[]) => {
        fetchItems(result);
      });
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(error => displayError(error));
  }, []);

  const listViewProps = {
    data,
    headerItems,
    tableClass: 'table table-striped table-bordered plans-list t',
  };

  if (loading === true) {
    return <Loading />;
  }

  return (
    <div>
      <ListView {...listViewProps} />
      {!data.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_ROWS_FOUND}
          <hr />
        </div>
      )}
    </div>
  );
};

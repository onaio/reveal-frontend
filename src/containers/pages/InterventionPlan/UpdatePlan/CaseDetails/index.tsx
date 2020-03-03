/** Accordion like component that can be used on the manage plans
 * page to display case Details
 */
import reducer from '@onaio/gatekeeper/dist/types/ducks/gatekeeper';
import reducerRegistry from '@onaio/redux-reducer-registry/dist/types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle } from 'reactstrap';
import { ActionCreator } from 'redux';
import { OPENSRP_API_BASE_URL } from '../../../../../configs/env';
import { OPENSRP_FIND_EVENTS_ENDPOINT } from '../../../../../constants';
import { growl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import eventReducer, {
  fetchEvents,
  FetchEventsAction,
  getEventById,
  reducerName,
} from '../../../../../store/ducks/opensrp/events';
import { Event, RawEvent } from '../../../../../store/ducks/opensrp/events/utils';

reducerRegistry.register(reducerName, eventReducer);

interface CaseDetailsProps {
  eventId: string;
  service: typeof OpenSRPService;
  event: Event;
  fetchEventsCreator: ActionCreator<FetchEventsAction>;
}

const loadEvent = async (eventId: string, servant: typeof OpenSRPService) => {
  const service = new servant(OPENSRP_FIND_EVENTS_ENDPOINT, OPENSRP_API_BASE_URL);
  return await service.read(eventId);
};

export const CaseDetails: React.FC<CaseDetailsProps> = props => {
  const { eventId, service, event } = props;
  // get the opensrp event id
  // make a call to the events endpoint and get event
  useEffect(() => {
    loadEvent(eventId, service).catch((err: Error) =>
      growl(err.message, { type: toast.TYPE.ERROR })
    );
  }, []);
  // render event.
  return (
    <>
      <h4>{event.caseNumber}</h4>
      <div id="accordion">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Case Details</h5>
          </CardHeader>
          <div id="collapseOne" className="collapse" data-parent="#accordion">
            <CardBody>
              <CardTitle>Card title</CardTitle>
              <CardSubtitle>Card subtitle</CardSubtitle>
              <CardText>
                Some quick example text to build on the card title and make up the bulk of the
                card's content.
              </CardText>
              <Button>Button</Button>
            </CardBody>
          </div>
        </Card>
      </div>
    </>
  );
};

const mapStateToProps = () => ({
  
})

const ConnectedCaseDetails = connect()(CaseDetails);
export default ConnectedCaseDetails;

import { trackedComponent } from '..';
import { GA_ROUTE_COMPONENT, GA_WITH_TRACKER } from '../../../constants';
import WithGATracker from './../../../components/page/GoogleAnalytics/WithGATracker';

describe('/App/helpers/trackedComponent', () => {
  const ComponentMock = () => <div>Is P=NP ?</div>;

  it('returns route component as the default google analytics approach', () => {
    expect(trackedComponent(ComponentMock)).toEqual(ComponentMock);
  });

  it('returns the correct component if google analytics approach is route component', () => {
    expect(trackedComponent(ComponentMock, GA_ROUTE_COMPONENT)).toEqual(ComponentMock);
  });

  it('returns the correct component if google analytics approach is with tracker', () => {
    expect(JSON.stringify(trackedComponent(ComponentMock, GA_WITH_TRACKER))).toEqual(
      JSON.stringify(WithGATracker(ComponentMock))
    );
  });
});

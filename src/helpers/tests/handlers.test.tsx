import { Popup } from 'mapbox-gl';
import { popupHandler } from '../handlers';

window.URL.createObjectURL = jest.fn();

describe('helpers/handlers', () => {
  it('calls queryRenderedFeatures', () => {
    const event = {
      lngLat: {
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      },
      originalEvent: undefined,
      point: {
        x: 463.5,
        y: 477.1875,
      },
      target: {
        queryRenderedFeatures: (e: any) => {
          return [
            {
              geometry: {
                coordinates: [101.17997825145721, 15.065285996883986],
                type: 'Point',
              },
              layer: {
                id: 'x',
                type: 'fill',
              },
              properties: {
                action_code: 'Bednet Distribution',
                color: '#ff3',
                goal_id: 'RACD_bednet_dist_1km_radius',
                jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
                jurisdiction_name: 'TLv1_01',
                jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
                plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
                structure_code: 'f33918f1-7165-4579-b096-165e75f7e1e0',
                structure_id: 'f33918f1-7165-4579-b096-165e75f7e1e0',
                structure_name: 'f33918f1-7165-4579-b096-165e75f7e1e0',
                structure_type: 'Residential Structure',
                task_business_status: 'Not Visited',
                task_execution_end_date: '2019-06-21',
                task_execution_start_date: '2019-06-17',
                task_focus: 'Bednet Distribution',
                task_status: 'Ready',
                task_task_for: 'f33918f1-7165-4579-b096-165e75f7e1e0',
              },
              source: 'RACD_bednet_dist_1km_radius',
              state: {},
              type: 'Feature',
            },
          ];
        },
      },
      type: 'fill',
    };

    const mockedPopup = Popup;
    const addToMock = jest.fn();
    mockedPopup.prototype.setLngLat = (e: any) => {
      expect(e).toEqual({
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      });
      e.setHTML = (f: any) => {
        expect(f).toEqual(
          '<div><p class="heading"> Bednet Distribution</b></p> <p> Not Visited</p><br/><br/></div>'
        );
        e.addTo = addToMock;
        return e;
      };
      return e;
    };

    (global as any).mapboxgl = {
      Popup: mockedPopup,
    };

    popupHandler(event as any);

    expect(addToMock).toHaveBeenCalledWith({ _container: { id: 'map-1' } });
  });
});

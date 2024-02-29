import * as L from 'leaflet'
import { decode } from '@googlemaps/polyline-codec'
import GoogleMapLoader from '../GoogleMap/GoogleMapLoader'
import 'leaflet-routing-machine'
import { TravelMode } from './type'
// L.routing.line
// L.Routing.Control
interface IOption {
  travelMode: TravelMode
  unitSystem?: google.maps.UnitSystem
  provideRouteAlternatives?: boolean

  apiKey: string
}

export class LeafletRoutingGoogle {
  static directionService: google.maps.DirectionsService
  private options: IOption

  private constructor(options: IOption) {
    this.options = options
  }

  static async init(options: IOption) {
    const {
      RoutesLibrary: { DirectionsService }
    } = await GoogleMapLoader.load({ apiKey: options?.apiKey ?? '' })
    LeafletRoutingGoogle.directionService = new DirectionsService()
    return new LeafletRoutingGoogle(options)
  }

  private _flatten(arr: number[][]): number[] {
    return arr.reduce((acc, arr) => acc.concat(arr), [])
  }

  private _sum(arr: number[]): number {
    return arr.reduce((prev, curr) => prev + curr)
  }

  //   private _decodePolyline(geometry: string): google.maps.LatLng[] {
  //     return decode(geometry).map((coord) => new google.maps.LatLng(coord[0], coord[1]))
  //   }

  private _decodePolyline(geometry: string): L.LatLng[] {
    const cs = decode(geometry, 5) // polylinePrecision = 5
    const result = new Array(cs.length)
    for (let i = cs.length - 1; i >= 0; i--) {
      result[i] = L.latLng(cs[i])
    }
    return result
  }

  private _maneuverToInstructionType(maneuver: string): L.Routing.IInstruction['type'] {
    switch (maneuver) {
      case 'turn-right':
        return 'Right'
      case 'turn-slight-right':
      case 'ramp-right':
      case 'fork-right':
        return 'SlightRight'
      case 'turn-sharp-right':
        return 'SharpRight'
      case 'turn-left':
        return 'Left'
      case 'turn-slight-left':
      case 'ramp-left':
      case 'fork-left':
        return 'SlightLeft'
      case 'turn-sharp-left':
        return 'SharpLeft'
      case 'uturn-right':
      case 'uturn-left':
        return 'TurnAround'
      case 'roundabout-left':
      case 'roundabout-right':
        return 'Roundabout'
      default:
        return 'Straight'
    }
  }

  public async route(rawWaypoints: [number, number][]) {
    const waypoints: L.Routing.Waypoint[] = rawWaypoints.map(([lat, lng]) =>
      L.routing.waypoint(L.latLng(lat, lng))
    )

    const waypoint = {
      origin: `${waypoints[0].latLng.lat},${waypoints[0].latLng.lng}`,
      destination: `${waypoints[waypoints.length - 1].latLng.lat},${
        waypoints[waypoints.length - 1].latLng.lng
      }`,
      travelMode: this.options?.travelMode,
      waypoints: waypoints.slice(1, waypoints.length - 1).map((waypoint) => ({
        location: `${waypoint.latLng.lat},${waypoint.latLng.lng}`,
        stopover: false
      }))
    }

    try {
      const { routes } = await LeafletRoutingGoogle.directionService.route(waypoint)
      const ir = this._translateRoutes(routes)
      console.log({ ir })

      //#region  draw lines
      this._routeSelected({ route: ir, alternatives: [] })
      //#endregion
    } catch (e) {
      console.error(e)
    }

    return this
  }

  private _translateRoutes(routes: google.maps.DirectionsRoute[]): L.Routing.IRoute[] {
    return routes.map((route) => {
      const iRoute: L.Routing.IRoute = {
        name: route.summary,
        summary: {
          totalDistance: this._sum(
            this._flatten(
              route.legs.map((leg) => leg.steps.map((step) => step.distance?.value ?? 0))
            )
          ),
          totalTime: this._sum(
            this._flatten(
              route.legs.map((leg) => leg.steps.map((step) => step.duration?.value ?? 0))
            )
          )
        },
        coordinates: [],
        waypoints: [],
        instructions: []
      }
      //   const hasSteps = route.legs[0].steps.length > 0

      for (let i = 0; i < route.legs.length; i++) {
        for (let j = 0; j < route.legs[i].steps.length; j++) {
          const step = route.legs[i].steps[j]

          const points = this._decodePolyline(step.encoded_lat_lngs)
          iRoute.coordinates = [...(iRoute.coordinates ?? []), ...points]

          const type = this._maneuverToInstructionType(step.maneuver)

          iRoute.instructions?.push({
            type,
            distance: step.distance?.value ?? 0,
            time: step.duration?.value ?? 0
          })
        }
      }

      // route.inputWaypoints = inputWaypoints
      // route.waypoints = actualWaypoints
      // route.properties = {
      //   isSimplified: !this.options || !this.options.geometryOnly || this.options.simplifyGeometry
      // }

      return iRoute
    })
  }

  //#region
  _clearLines(): void {
    if (this._line) {
      this._map.removeLayer(this._line);
      delete this._line;
    }
    if (this._alternatives && this._alternatives.length) {
      for (let i = 0; i < this._alternatives.length; i++) {
        this._map.removeLayer(this._alternatives[i]);
      }
      this._alternatives = [];
    }
  }

  _routeSelected (route: L.Routing.IRoute[]) {
      const fitMode = 'smart';
      const fitBounds =
        (fitMode === 'smart' && !this._waypointsVisible()) ||
        (fitMode !== 'smart' && fitMode);
    
      this._updateLines({route: route, alternatives: []});

      if (fitBounds) {
        this._map.fitBounds(this._line.getBounds());
      }
      
      if (this.options.waypointMode === 'snap') {
        this._plan.off('waypointschanged', this._onWaypointsChanged, this);
        this.setWaypoints(route.waypoints);
        this._plan.on('waypointschanged', this._onWaypointsChanged, this);
      }
  }


  
  _waypointsVisible () {
    var wps = this.getWaypoints(),
      mapSize,
      bounds,
      boundsSize,
      i,
      p;

    try {
      mapSize = this._map.getSize();

      for (i = 0; i < wps.length; i++) {
        p = this._map.latLngToLayerPoint(wps[i].latLng);

        if (bounds) {
          bounds.extend(p);
        } else {
          bounds = L.bounds([p]);
        }
      }

      boundsSize = bounds.getSize();
      return (boundsSize.x > mapSize.x / 5 ||
        boundsSize.y > mapSize.y / 5) && this._waypointsInViewport();

    } catch (e) {
      return false;
    }
  },
  //#endregion
}

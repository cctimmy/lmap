import * as L from 'leaflet'
import 'leaflet-routing-machine'

export class LeafletOSRM {
  options: any = {
    fitSelectedRoutes: 'smart',
    routeLine: function (route: any, options: any) {
      return new L.Routing.Line(route, options)
    },
    autoRoute: true,
    routeWhileDragging: false,
    routeDragInterval: 500,
    waypointMode: 'connect',
    showAlternatives: false,
    defaultErrorHandler: function (e: any) {
      console.error('Routing error:', e.error)
    }
  }

  private _line: any
  private _map: any
  private _alternatives: any
  private _router: L.Routing.OSRMv1
  // private _plan: L.Routing.Plan

  constructor(origin: L.LatLngLiteral, destination: L.LatLngLiteral, map: L.Map) {
    this._map = map
    this._router = new L.Routing.OSRMv1()
    const wps = [L.routing.waypoint(L.latLng(origin)), L.routing.waypoint(L.latLng(destination))]
    // this._plan = new L.Routing.Plan(wps, this.options)
    // this._map.addLayer(this._plan)
    this._router.route(wps, this._updateLines.bind(this) as any)
  }

  _updateLines(err: any, route: any) {
    console.log({ err, route })
    if (!route) {
      return
    }

    // const addWaypoints = this.options.addWaypoints !== undefined ? this.options.addWaypoints : true
    // this._clearLines()

    // add alternatives first so they lie below the main route
    // this._alternatives = []
    // if ('alternatives' in routes)
    //   routes.alternatives.forEach( (alt, i) {
    //     this._alternatives[i] = this.options.routeLine(
    //       alt,
    //       L.extend(
    //         {
    //           isAlternative: true
    //         },
    //         this.options.altLineOptions || this.options.lineOptions
    //       )
    //     )
    //     this._alternatives[i].addTo(this._map)
    //     this._hookAltEvents(this._alternatives[i])
    //   }, this)

    this._line = new L.Routing.Line(route[0], {
      missingRouteTolerance: 0,
      extendToWaypoints: true
    })

    console.log('this._line', this._line)

    this._line.addTo(this._map)
    this._hookEvents(this._line)
  }

  _hookEvents(l: any) {
    // l.on('linetouched', (e) => {
    //   this._plan.dragNewWaypoint(e)
    // })
  }

  _hookAltEvents(l: any) {
    // l.on(
    //   'linetouched',
    //   function (e) {
    //     const alts = this._routes.slice()
    //     const selected = alts.splice(e.target._route.routesIndex, 1)[0]
    //     this.fire('routeselected', { route: selected, alternatives: alts })
    //   },
    //   this
    // )
  }

  _clearLines() {
    if (this._line) {
      this._map.removeLayer(this._line)
      delete this._line
    }
    if (this._alternatives && this._alternatives.length) {
      for (const i in this._alternatives) {
        this._map.removeLayer(this._alternatives[i])
      }
      this._alternatives = []
    }
  }
}

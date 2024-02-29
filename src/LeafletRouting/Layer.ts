import * as L from 'leaflet'
import 'leaflet-routing-machine'

const Waypoint = L.Routing.Waypoint
const GeocoderElement = L.Routing.GeocoderElement

export class RouteLayer extends L.Layer {
  includes = (typeof L.Evented !== 'undefined' && L.Evented.prototype) || L.Mixin.Events
  options: any
  _waypoints: L.Routing.Waypoint[]
  _map: L.Map
  _geocoderContainer: any
  _geocoderElems: any[] = []
  _markers: any[] = []
  _newWp: any

  constructor(waypoints: any[], options: any) {
    super()
    this.options = {
      dragStyles: [
        { color: 'black', opacity: 0.15, weight: 9 },
        { color: 'white', opacity: 0.8, weight: 6 },
        { color: 'red', opacity: 1, weight: 2, dashArray: '7,12' }
      ],
      draggableWaypoints: true,
      routeWhileDragging: false,
      addWaypoints: true,
      reverseWaypoints: false,
      addButtonClassName: '',
      language: 'en',
      createGeocoderElement: (wp: any, i: number, nWps: number, plan: any) => {
        return new GeocoderElement(wp, i, nWps, plan)
      },
      createMarker: (i: number, wp: any) => {
        const marker = L.marker(wp.latLng, { draggable: false })

        return marker
      },
      geocodersClassName: ''
    }

    this._map = options.map
    L.Util.setOptions(this, options)
    this._waypoints = []
    this.setWaypoints(waypoints)
  }

  isReady = (): boolean => {
    for (let i = 0; i < this._waypoints.length; i++) {
      if (!this._waypoints[i].latLng) {
        return false
      }
    }

    return true
  }

  getWaypoints = (): any[] => {
    const wps = []

    for (let i = 0; i < this._waypoints.length; i++) {
      wps.push(this._waypoints[i])
    }

    return wps
  }

  setWaypoints = (waypoints: L.Routing.Waypoint[]): this => {
    this.spliceWaypoints(0, this._waypoints.length, ...waypoints)
    return this
  }

  spliceWaypoints(startIdx: number, deleteCnt: number, ...appends: L.Routing.Waypoint[]): void {
    this._waypoints.splice(startIdx, deleteCnt, ...appends)

    while (this._waypoints.length < 2) {
      this.spliceWaypoints(this._waypoints.length, 0)
    }

    this._updateMarkers()
    this._fireChanged(startIdx, deleteCnt, ...appends)
  }

  onAdd(map: L.Map): this {
    this._map = map
    this._updateMarkers()
    return this
  }

  onRemove(): this {
    this._removeMarkers()

    if (this._newWp) {
      for (let i = 0; i < this._newWp.lines.length; i++) {
        this._map.removeLayer(this._newWp.lines[i])
      }
    }

    // delete this._map
    return this
  }

  createGeocoders(): HTMLElement {
    const container = L.DomUtil.create(
      'div',
      `leaflet-routing-geocoders ${this.options.geocodersClassName}`
    )
    const waypoints = this._waypoints
    let addWpBtn: HTMLElement
    let reverseBtn: HTMLElement

    this._geocoderContainer = container
    this._geocoderElems = []

    if (this.options.addWaypoints) {
      addWpBtn = L.DomUtil.create(
        'button',
        `leaflet-routing-add-waypoint ${this.options.addButtonClassName}`,
        container
      )
      addWpBtn.setAttribute('type', 'button')
      L.DomEvent.addListener(addWpBtn, 'click', () => {
        this.spliceWaypoints(waypoints.length, 0)
      })
    }

    if (this.options.reverseWaypoints) {
      reverseBtn = L.DomUtil.create('button', 'leaflet-routing-reverse-waypoints', container)
      reverseBtn.setAttribute('type', 'button')
      L.DomEvent.addListener(reverseBtn, 'click', () => {
        this._waypoints.reverse()
        this.setWaypoints(this._waypoints)
      })
    }

    this._updateGeocoders()
    this.on('waypointsspliced', this._updateGeocoders)

    return container
  }

  _createGeocoder(i: number): any {
    const geocoder = this.options.createGeocoderElement(
      this._waypoints[i],
      i,
      this._waypoints.length,
      this.options
    )
    geocoder
      .on('delete', () => {
        if (i > 0 || this._waypoints.length > 2) {
          this.spliceWaypoints(i, 1)
        } else {
          this.spliceWaypoints(i, 1, new Waypoint(null as any, '', {}))
        }
      })
      .on('geocoded', (e: any) => {
        this._updateMarkers()
        this._fireChanged()
        this._focusGeocoder(i + 1)
        this.fire('waypointgeocoded', {
          waypointIndex: i,
          waypoint: e.waypoint
        })
      })
      .on('reversegeocoded', (e: any) => {
        this.fire('waypointgeocoded', {
          waypointIndex: i,
          waypoint: e.waypoint
        })
      })

    return geocoder
  }

  _updateGeocoders(): void {
    const elems = []
    let geocoderElem

    for (let i = 0; i < this._geocoderElems.length; i++) {
      this._geocoderContainer.removeChild(this._geocoderElems[i].getContainer())
    }

    for (let i = this._waypoints.length - 1; i >= 0; i--) {
      geocoderElem = this._createGeocoder(i)
      this._geocoderContainer.insertBefore(
        geocoderElem.getContainer(),
        this._geocoderContainer.firstChild
      )
      elems.push(geocoderElem)
    }

    this._geocoderElems = elems.reverse()
  }

  _removeMarkers(): void {
    if (this._markers) {
      for (let i = 0; i < this._markers.length; i++) {
        if (this._markers[i]) {
          this._map.removeLayer(this._markers[i])
        }
      }
    }
    this._markers = []
  }

  _updateMarkers(): void {
    if (!this._map) {
      return
    }

    this._removeMarkers()

    for (let i = 0; i < this._waypoints.length; i++) {
      let m
      if (this._waypoints[i].latLng) {
        m = this.options.createMarker(i, this._waypoints[i], this._waypoints.length)
        if (m) {
          m.addTo(this._map)
          if (this.options.draggableWaypoints) {
            this._hookWaypointEvents(m, i)
          }
        }
      } else {
        m = null
      }
      this._markers.push(m)
    }
  }

  _fireChanged(idx?: number, rmIdx?: number, ...appends: any[]): void {
    this.fire('waypointschanged', { waypoints: this.getWaypoints() })

    if (appends.length >= 2) {
      this.fire('waypointsspliced', {
        index: Array.prototype.shift.call(idx),
        nRemoved: Array.prototype.shift.call(rmIdx),
        added: appends
      })
    }
  }

  _hookWaypointEvents(m: any, i: number, trackMouseMove = false): void {
    const eventLatLng = (e: any) => (trackMouseMove ? e.latlng : e.target.getLatLng())
    const dragStart = (e: any) => {
      this.fire('waypointdragstart', { index: i, latlng: eventLatLng(e) })
    }
    const drag = (e: any) => {
      this._waypoints[i].latLng = eventLatLng(e)
      this.fire('waypointdrag', { index: i, latlng: eventLatLng(e) })
    }
    const dragEnd = (e: any) => {
      this._waypoints[i].latLng = eventLatLng(e)
      this._waypoints[i].name = ''
      if (this._geocoderElems) {
        this._geocoderElems[i].update(true)
      }
      this.fire('waypointdragend', { index: i, latlng: eventLatLng(e) })
      this._fireChanged()
    }
    let mouseMove: any
    let mouseUp: any

    if (trackMouseMove) {
      mouseMove = (e: any) => {
        this._markers[i].setLatLng(e.latlng)
        drag(e)
      }
      mouseUp = (e: any) => {
        this._map.dragging.enable()
        this._map.off('mouseup', mouseUp)
        this._map.off('mousemove', mouseMove)
        dragEnd(e)
      }
      this._map.dragging.disable()
      this._map.on('mousemove', mouseMove)
      this._map.on('mouseup', mouseUp)
      dragStart({ latlng: this._waypoints[i].latLng })
    } else {
      m.on('dragstart', dragStart)
      m.on('drag', drag)
      m.on('dragend', dragEnd)
    }
  }

  dragNewWaypoint(e: any): void {
    const newWpIndex = e.afterIndex + 1
    if (this.options.routeWhileDragging) {
      this.spliceWaypoints(newWpIndex, 0, e.latlng)
      this._hookWaypointEvents(this._markers[newWpIndex], newWpIndex, true)
    } else {
      this._dragNewWaypoint(newWpIndex, e.latlng)
    }
  }

  _dragNewWaypoint(newWpIndex: number, initialLatLng: L.LatLng): void {
    const wp = new Waypoint(initialLatLng, '', {})
    const prevWp = this._waypoints[newWpIndex - 1]
    const nextWp = this._waypoints[newWpIndex]
    const marker = this.options.createMarker(newWpIndex, wp, this._waypoints.length + 1)
    const lines: any[] = []
    const draggingEnabled = this._map.dragging.enabled()

    const mouseMove = (e: any) => {
      let latLngs
      if (marker) {
        marker.setLatLng(e.latlng)
      }
      for (let i = 0; i < lines.length; i++) {
        latLngs = lines[i].getLatLngs()
        latLngs.splice(1, 1, e.latlng)
        lines[i].setLatLngs(latLngs)
      }
      L.DomEvent.stop(e)
    }

    const mouseUp = (e: any) => {
      if (marker) {
        this._map.removeLayer(marker)
      }
      for (let i = 0; i < lines.length; i++) {
        this._map.removeLayer(lines[i])
      }
      this._map.off('mousemove', mouseMove)
      this._map.off('mouseup', mouseUp)
      this.spliceWaypoints(newWpIndex, 0, e.latlng)
      if (draggingEnabled) {
        this._map.dragging.enable()
      }
      L.DomEvent.stop(e)
    }

    if (marker) {
      marker.addTo(this._map)
    }

    for (let i = 0; i < this.options.dragStyles.length; i++) {
      lines.push(
        L.polyline([prevWp.latLng, initialLatLng, nextWp.latLng], this.options.dragStyles[i]).addTo(
          this._map
        )
      )
    }

    if (draggingEnabled) {
      this._map.dragging.disable()
    }

    this._map.on('mousemove', mouseMove)
    this._map.on('mouseup', mouseUp)
  }

  _focusGeocoder(i: any) {
    if (this._geocoderElems[i]) {
      this._geocoderElems[i].focus()
    } else {
      //   document.activeElement.blur()
    }
  }
}

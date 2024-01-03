import * as L from 'leaflet'
import { LeafletMap } from './LeafletMap'

interface IMarkerOption extends L.MarkerOptions {
  id: string
  latlng: L.LatLngLiteral
  onMarkerClick?: (id: string, e: L.Marker) => void
}

export interface ILeafletMarkerOption {
  option: IMarkerOption
  content?: ((layer: L.Layer) => L.Content) | L.Content
}

class Marker extends L.Marker {
  id: string

  constructor(option: IMarkerOption) {
    const { latlng, id, ...restOption } = option
    super(latlng, restOption)
    this.id = id
  }

  onClick(fn: (m: L.Marker) => void) {
    super.on('click', () => fn(this))
    return this
  }

  async flyOnTo(map: LeafletMap) {
    await map.flyToMaxAsync(this.getLatLng(), { duration: 0.4 })
    this.openPopup()
  }
}

export class LeafletMarker {
  private _markLayerIdMap: Map<string, Marker> = new Map()
  private _markerClusterGroupIdMap: Map<string, L.MarkerClusterGroup> = new Map()

  findMarkerLyr(id: string) {
    return (
      this._markLayerIdMap.get(id) ||
      (() => {
        for (const [, gLyr] of this._markerClusterGroupIdMap) {
          for (const childLyrOfGLyr of gLyr.getLayers()) {
            if (childLyrOfGLyr instanceof Marker && childLyrOfGLyr.id === id) {
              // console.log('childLyrOfGLyr instanceof Marker', childLyrOfGLyr)
              return childLyrOfGLyr
            }
          }
        }
      })()
    )
  }

  createMarker(option: ILeafletMarkerOption) {
    const { option: markerOption, content } = option
    const markerLyr = new Marker({
      icon: L.icon({
        iconSize: [25, 41],
        iconAnchor: [10, 41],
        popupAnchor: [2, -40],
        iconUrl:
          'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0ODYuMyA0ODYuMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDg2LjMgNDg2LjM7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDRDJBMDA7IiBkPSJNMjQzLjE1LDB2MTA0LjRjNDQuMTEsMCw4MCwzNS44OCw4MCw4MGMwLDQ0LjExLTM1Ljg5LDgwLTgwLDgwdjIyMS45bDE0Ni40My0xODQuMSAgIGMyNi4yOS0zMy4yNSw0MC4xOS03My4yMSw0MC4xOS0xMTUuNThDNDI5Ljc3LDgzLjcyLDM0Ni4wNSwwLDI0My4xNSwweiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0Q4RDdEQTsiIGQ9Ik0zMjMuMTUsMTg0LjRjMC00NC4xMi0zNS44OS04MC04MC04MHYxNjBDMjg3LjI2LDI2NC40LDMyMy4xNSwyMjguNTEsMzIzLjE1LDE4NC40eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0ZGMzUwMTsiIGQ9Ik0xNjMuMTUsMTg0LjRjMC00NC4xMiwzNS44OS04MCw4MC04MFYwQzE0MC4yNSwwLDU2LjUzLDgzLjcyLDU2LjUzLDE4Ni42MiAgIGMwLDQyLjM3LDEzLjksODIuMzMsNDAuMjMsMTE1LjYyTDI0My4xNSw0ODYuM1YyNjQuNEMxOTkuMDQsMjY0LjQsMTYzLjE1LDIyOC41MSwxNjMuMTUsMTg0LjR6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTE2My4xNSwxODQuNGMwLDQ0LjExLDM1Ljg5LDgwLDgwLDgwdi0xNjBDMTk5LjA0LDEwNC40LDE2My4xNSwxNDAuMjgsMTYzLjE1LDE4NC40eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo='
      }),
      ...markerOption
    })

    const {
      latlng: { lng, lat },
      id,
      onMarkerClick
    } = markerOption

    markerLyr.bindPopup(content ?? `經度 ${lng.toFixed(3)}緯度 ${lat.toFixed(3)}`)
    markerLyr.onClick((mark) => onMarkerClick?.(id, mark))
    this._markLayerIdMap.set(id, markerLyr)
    return markerLyr
  }

  addAllMarkersTo(mapIns: L.Map) {
    for (const [, m] of this._markLayerIdMap) {
      m.addTo(mapIns)
    }
  }

  private _createClusterGroupLyr(
    clusterGroupId: string = crypto.randomUUID(),
    disableClusteringAtZoom = 0
  ) {
    const markerClusterGroupLyr = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      disableClusteringAtZoom
      // zoomToBoundsOnClick: true
    })
    this._markerClusterGroupIdMap.set(clusterGroupId, markerClusterGroupLyr)
    return markerClusterGroupLyr
  }

  private _addAllClusterGroupsTo(mapIns: L.Map) {
    for (const [, m] of this._markerClusterGroupIdMap) {
      m.addTo(mapIns)
    }
  }

  createClusterMarkers(mapIns: L.Map, options: ILeafletMarkerOption[]) {
    const gLyr = this._createClusterGroupLyr(void 0, mapIns.getMaxZoom())
    for (const option of options) {
      this.createMarker(option).addTo(gLyr)
    }
    this._addAllClusterGroupsTo(mapIns)
  }
}

export default LeafletMarker

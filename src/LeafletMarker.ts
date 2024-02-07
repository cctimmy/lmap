import * as L from 'leaflet'
import { LeafletMap } from './LeafletMap'

export interface ILeafletMarkerOption extends L.MarkerOptions {
  id: string
  latlng: L.LatLngLiteral
  iconCreateFunction: () => L.Icon | L.DivIcon | HTMLDivElement
  contentCreateFunction?: () => L.Content
}

export class LeafletMarker extends L.Marker {
  id: string
  iconCreateFunction: () => L.Icon | L.DivIcon | HTMLDivElement
  contentCreateFunction?: () => L.Content

  constructor(option: ILeafletMarkerOption) {
    const { latlng, id, iconCreateFunction, contentCreateFunction, ...restOption } = option
    super(latlng, restOption)
    this.id = id
    this.iconCreateFunction = iconCreateFunction
    this.contentCreateFunction = contentCreateFunction
    const { lng, lat } = latlng
    this.bindPopup(
      `
        <div style="background:red;">
          經度 ${lng.toFixed(3)}緯度 ${lat.toFixed(3)}
        </div>
      `
    )
  }

  beforeAdd() {
    const icon = this.iconCreateFunction()
    if (icon instanceof HTMLDivElement) {
      this.setIcon(L.divIcon({ html: icon }))
    }
    if (this.contentCreateFunction !== void 0) {
      this.setPopupContent(this.contentCreateFunction())
    }
    return this
  }

  async flyOnTo(map: LeafletMap) {
    await map.flyToMaxAsync(this.getLatLng(), { duration: 0.4 })
    this.openPopup()
  }
}

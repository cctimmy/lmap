import * as L from 'leaflet'

export class LeafletMap extends L.Map {
  constructor(mapOption: L.MapOptions = {}) {
    const dom = document.createElement('div')
    dom.style.cssText = `
      position: absolute;
      height: 100%;
      width: 100%;
    `

    super(dom, {
      ...mapOption,
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true
    })
  }

  /** the map container should be "relative" position  */
  mount(containerDom: HTMLDivElement) {
    containerDom.appendChild(this.getContainer())
    this.invalidateSize()
  }

  async flyToAsync(latlng: L.LatLngExpression, zoom: number, options?: L.ZoomPanOptions) {
    return new Promise((resolve) => {
      super.flyTo(latlng, zoom, options).once('moveend', () => resolve(void 0))
    })
  }

  async flyToMaxAsync(latlng: L.LatLngExpression, options?: L.ZoomPanOptions) {
    await this.flyToAsync(latlng, this.getMaxZoom(), options)
  }

  async toCurrentLocation() {
    const location: GeolocationPosition = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (loc) => resolve(loc),
        (err) => reject(err)
      )
    })
    const latlng = new L.LatLng(location.coords.latitude, location.coords.longitude)
    await this.flyToMaxAsync(latlng)
  }

  mountCoordDom(container: HTMLElement): void {
    const textLabel = document.createElement('strong')
    textLabel.style.cssText = `
            color: #fff;
            margin-left: 0.5rem;
        `

    const updateCoord = ({ lat, lng }: any) => {
      textLabel.innerHTML = `
                <small>
                    <span>經度</span> ${lng.toFixed(3)}
                    <span>緯度</span> ${lat.toFixed(3)}
                </small>
            `
    }
    updateCoord(this.getCenter()) // init
    this.on('mousemove', (evt: L.LeafletMouseEvent) =>
      updateCoord({
        lat: evt.latlng.lat,
        lng: evt.latlng.lng
      })
    )

    container.appendChild(textLabel)
  }

  mountScaleDom(container: HTMLElement): void {
    const scaleDom = L.control
      .scale({
        position: 'bottomright',
        imperial: false
      })
      .addTo(this)
      .getContainer()
    if (scaleDom === undefined) {
      return
    }
    const rule = scaleDom.querySelector('.leaflet-control-scale-line') as HTMLElement
    rule.style.cssText = `
            background: transparent;
            color: #fff;
            border-color: #fff;
        `

    container.appendChild(scaleDom)
  }
}

import { BaseLayerTitle, BaseLayerType, LayerDef } from './constant'
import { L } from './'

interface ILayer extends Omit<LayerDef, 'url'> {
  id: string
}

class TileLayer extends L.TileLayer implements ILayer {
  constructor(props: LayerDef) {
    super(props.url, {
      opacity: props.opacity,
      maxZoom: props.maxZoom
    })
    this.type = props.type
    this.id = crypto.randomUUID()
    this.title = props.title
    this.visible = props.visible
    this.opacity = props.opacity
    this.maxZoom = props.maxZoom
  }

  type: BaseLayerType
  id: string
  title: BaseLayerTitle
  visible: boolean
  opacity: number
  maxZoom: number
}

export class LeafletLayer {
  _map!: L.Map
  baseLayerColletion: TileLayer[] = []
  normalLayerCollection: TileLayer[] = []

  constructor(map: L.Map) {
    this._map = map
  }

  setVisible(id: string, bool: boolean): void
  setVisible(id: string, bool: undefined): void
  setVisible(id: string, bool: any): void {
    if (bool === undefined) {
      this.baseLayerColletion.forEach((l) => {
        if (l.id === id && !this._map.hasLayer(l)) {
          l.addTo(this._map)
          l.visible = true
        } else {
          this._map.removeLayer(l)
          l.visible = false
        }
      })
    } else {
      const nl = this.normalLayerCollection.find((l) => l.id === id)
      if (!nl) {
        return
      }
      if (bool) {
        if (!this._map.hasLayer(nl)) {
          nl.addTo(this._map)
          nl.visible = true
        }
        this.normalLayerCollection.forEach((l) => 'bringToFront' in l && l.bringToFront())
      } else {
        if (this._map.hasLayer(nl)) {
          this._map.removeLayer(nl)
          nl.visible = false
        }
      }
    }
  }

  setOpts(id: string, opts: L.PathOptions) {
    const bl = this.baseLayerColletion.find((l) => l.id === id)
    const nl = this.normalLayerCollection.find((l) => l.id === id)
    const ptr = bl || nl

    try {
      if (ptr instanceof L.GeoJSON) {
        ptr.setStyle(opts)
      } else if (ptr instanceof L.TileLayer) {
        const o = opts.opacity || opts.fillOpacity || 0
        ptr.setOpacity(o > 1 ? o / 100 : o)
      } else {
        console.error(ptr)
        throw new Error('setStyle() Not GeoJSON || FeatureGroup')
      }
    } catch (e) {
      console.error(e)
    }
  }

  addBaseLayers(lyrDefs: LayerDef[]) {
    for (const lyrDef of lyrDefs) {
      if (lyrDef.type === BaseLayerType.wmts) {
        const lyr = new TileLayer(lyrDef)
        this.baseLayerColletion.push(lyr)
        lyrDef.visible && lyr.addTo(this._map)
      }
    }
  }

  addLayer() {
    // noop
  }
}

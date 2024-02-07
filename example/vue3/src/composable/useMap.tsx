import { Component, ComputedOptions, MethodOptions, Ref, ref, createApp, watchEffect } from 'vue'
import {
  LeafletMap,
  LeafletLayer,
  BaseLayerMap,
  BaseLayerTitle,
  LeafletMarkerLayer,
  ILeafletMarkerOption
} from '~/index'

export const useMap = () => {
  const leafletMap = new LeafletMap({
    zoom: 12,
    center: { lat: 25.03746, lng: 121.564558 }
  })
  const leafletMarkerLayer = new LeafletMarkerLayer()

  new LeafletLayer(leafletMap).addBaseLayers([BaseLayerMap.get(BaseLayerTitle.台灣通用電子地圖)!])

  const createVueAppEl = (component: Component<any, any, any, ComputedOptions, MethodOptions>) => {
    const iconEl = document.createElement('div')
    createApp(component).mount(iconEl)
    return iconEl
  }

  const createClusterMarkers = (markersCreator: () => ILeafletMarkerOption[]) => {
    watchEffect(() => {
      if (!resolve.value) {
        return
      }
      leafletMarkerLayer.createClusterMarkers(leafletMap, markersCreator())
    })
  }

  const flyTo = async (id: string) => {
    leafletMarkerLayer?.findMarkerLyr(id)?.flyOnTo(leafletMap)
  }

  const resolve = ref(false)
  const mount = (containerRef: Ref<HTMLDivElement | null>) => {
    watchEffect(() => {
      if (!containerRef.value) {
        return
      }
      resolve.value = true
      leafletMap.mount(containerRef.value)
    })
  }

  return { flyTo, mount, createVueAppEl, createClusterMarkers, leafletMap, leafletMarkerLayer }
}

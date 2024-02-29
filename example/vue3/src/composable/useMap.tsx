import { Component, ComputedOptions, MethodOptions, Ref, ref, createApp, watchEffect } from 'vue'
import {
  LeafletMap,
  LeafletLayer,
  BaseLayerMap,
  BaseLayerTitle,
  LeafletMarkerLayer,
  ILeafletMarkerOption,
  LeafletRoutingGoogle,
  TravelMode
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

  ;(async () => {
    const route = await LeafletRoutingGoogle.init({
      travelMode: TravelMode.DRIVING,
      apiKey: process.env.VUE_APP_G_API_KEY
    })
    route.route([
      [24.986732, 121.545357], // 木柵景美溪橋口
      [24.999328, 121.547299] // 興隆景華街口
    ])
  })()

  return { flyTo, mount, createVueAppEl, createClusterMarkers, leafletMap, leafletMarkerLayer }
}

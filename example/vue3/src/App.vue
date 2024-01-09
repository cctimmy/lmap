<template>
  <p><b>activeId</b> :{{ activeId }}</p>
  <div>
    <template v-for="location in locations" :key="location.id">
      <button @click=";async () => await testGoto(location.id)">
        {{ location.name }}
      </button>
    </template>
  </div>
  <div ref="mapRef" style="position: absolute; width: 100%; height: 100%"></div>
</template>

<script lang="tsx" setup>
import { createApp, onMounted, ref, watch } from 'vue'
import MapMarker from './components/MapMarker.vue'
import MapMarkerLabel from './components/MapMarkerLabel.vue'
import { LeafletMap, LeafletLayer, LeafletMarker, BaseLayerTitle, BaseLayerMap, L } from '~/index'
import locations from '@/assets/locations.json'

let interval: number
const intervalMs = ref(0)
const openInterValTest = () => {
  if (!activeId.value) {
    return
  }
  clearInterval(interval)
  intervalMs.value = 0
  interval = setInterval(() => {
    intervalMs.value += 1
  }, 1000)
}

const mapRef = ref<HTMLDivElement | null>(null)
const activeId = ref('')

let leafletMap: LeafletMap
let leafletMarker: LeafletMarker

const testGoto = async (id: string) => {
  activeId.value = id
  leafletMarker?.findMarkerLyr(id)?.flyOnTo(leafletMap)
}

watch(
  [activeId],
  () => {
    openInterValTest()
  },
  { flush: 'post' }
)

onMounted(async () => {
  if (!mapRef.value) {
    return
  }

  leafletMap = new LeafletMap(mapRef.value, {
    zoom: 12,
    center: { lat: 25.03746, lng: 121.564558 }
  })

  new LeafletLayer(leafletMap).addBaseLayers([BaseLayerMap.get(BaseLayerTitle.台灣通用電子地圖)!])

  leafletMarker = new LeafletMarker()
  leafletMarker.createClusterMarkers(
    leafletMap,
    locations.map((l) => {
      const iconEl = document.createElement('div')
      createApp(() => <MapMarker isActive={activeId.value === l.id} />).mount(iconEl)

      const labelEl = document.createElement('div')
      createApp(() => (
        <MapMarkerLabel
          state={`${intervalMs.value} -----> ${JSON.stringify(l)}`}
          isActive={activeId.value === l.id}
          onClose={() => leafletMap?.closePopup()}
        />
      )).mount(labelEl)

      return {
        latlng: { lat: +l.latitude, lng: +l.longitude },
        option: {
          id: l.id,
          latlng: { lat: +l.latitude, lng: +l.longitude },
          onMarkerClick: (id: string) => {
            activeId.value = id
          },
          icon: L.divIcon({
            html: iconEl
          })
        },
        content: labelEl
      }
    })
  )
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

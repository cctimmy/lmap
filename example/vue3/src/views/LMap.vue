<template>
  <p>
    <b>ActiveId</b> :{{ activeId }}
    <select name="intersection" v-model="activeId" @change="flyAndActive(activeId)">
      <template v-for="point in points" :key="point.intersectionId">
        <option :value="point.intersectionId">
          {{ point.intersectionLabel }}
        </option>
      </template>
    </select>
  </p>
  <div ref="mapRef" style="position: relative; width: 100%; height: 600px"></div>
</template>

<script lang="tsx" setup>
import { ref, watch } from 'vue'
import { useMap } from '@/composable/useMap'
import points from '@/assets/points.json'
import MapMarker from '@/components/MapMarker.vue'
import MapMarkerLabel from '@/components/MapMarkerLabel.vue'

//#region test state change
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

const activeId = ref('')
const mapRef = ref()
watch(
  [activeId],
  () => {
    openInterValTest()
  },
  { flush: 'post' }
)
//#region end

const flyAndActive = (id: string) => {
  activeId.value = id
  flyTo(id)
}

// int the  map by composable function
const { flyTo, mount, createClusterMarkers, createVueAppEl, leafletMap } = useMap()
mount(mapRef)
createClusterMarkers(() =>
  points.map((p) => {
    return {
      id: p.intersectionId,
      latlng: { lat: +p.latitude, lng: +p.longitude },
      iconCreateFunction: () =>
        createVueAppEl(() => (
          <MapMarker
            onClick={() => {
              activeId.value = p.intersectionId
            }}
            isActive={activeId.value === p.intersectionId}
          />
        )),
      contentCreateFunction: () =>
        createVueAppEl(() => (
          <MapMarkerLabel
            state={`${intervalMs.value} -----> ${JSON.stringify(p)}`}
            isActive={activeId.value === p.intersectionId}
            onClose={() => leafletMap.closePopup()}
          />
        ))
    }
  })
)
</script>

<style></style>

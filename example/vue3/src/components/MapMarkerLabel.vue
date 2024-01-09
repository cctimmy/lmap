<template>
  <div :style="dynamicStyle">
    {{ props.state }}
    <button @click="props.onClose">close</button>
  </div>
</template>
<script setup lang="tsx">
import { computed } from 'vue'

const props = defineProps<{
  isActive: boolean
  onClose: () => void
  state: any
}>()

const dynamicStyle = computed(() => {
  return {
    backgroundColor: props.isActive ? 'red' : 'green',
    padding: '1rem'
  }
})
</script>

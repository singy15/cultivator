<script setup>
import GanttChart from './components/GanttChart.vue'
</script>

<template>
  <GanttChart 
    :width="70" :height="50"
    :row-height="2.5" :render-delay="100"
    :cell-width="4"/>
</template>

<style scoped>
</style>

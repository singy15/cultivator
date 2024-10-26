<script setup>
import GanttChart from './components/GanttChart.vue'
</script>

<template>
  <GanttChart 
    :width="140" :height="55"
    :row-height="3" :render-delay="100"
    :cell-width="4"
    :start-date="new Date('2024-10-01')"
    :end-date="new Date('2024-12-01')"
    />
</template>

<style scoped>
</style>

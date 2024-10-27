<script setup>
import GanttChart from './components/GanttChart.vue';
import moment from "moment";

let sd = moment(new Date("2024-10-01")).add(-7, "days").toDate();
let ed = moment(new Date("2024-10-01")).add(31 * 6, "days").toDate();
</script>

<template>
  <GanttChart 
    :width="140" :height="55"
    :row-height="3" :render-delay="100"
    :cell-width="3"
    :start-date="new Date('2024-10-01')"
    :end-date="new Date('2025-01-01')"
    />
</template>

<style scoped>
</style>

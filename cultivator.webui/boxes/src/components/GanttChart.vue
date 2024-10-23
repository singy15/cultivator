<script>
import ganttChart from "./GanttChart.js";
export default ganttChart;
</script>

<template>

  <div class="box-container ba" style="overflow:auto; width:50em; height:10em;">

    <div class="box" style="width:20em">subject</div>
    <div class="box bl":style="{width:`${calendar.length * 4}em`}">date</div>

    <br/>

    <div class="box" style="width:20em">&nbsp;</div>
    <div class="box-container">
      <template v-for="date in calendar">
        <div class="box bt bl" :style="{width:`${4}em`, justifyContent:`center`}">
          {{ formatDateYM(date.date) }}
        </div>
      </template>
    </div>

    <br/>

    <template v-for="(row, i) in rows">
        <div class="box bt" style="width:20em;">
          <input v-model="row.subject" @click="inputAllSelect($event)" />
        </div>

        <template v-for="(date,j) in calendar">
          <div class="box bl bt" :style="{width:`${4}em`, flexDirection:`column`}">
            <input :style="{textAlign:`center`, fontSize:`0.8em`,
              backgroundColor:(!isBlank(costInputs[i][0][j][0]))? `rgba(200,200,255,0.7)` : `transparent`,
              }" 
              :value="costInputs[i][0][j][0]"
              @change="modifyCost($event, i, 0, j, costInputs[i][0][j])"
              @click="inputAllSelect($event)"
              />
            <input :style="{textAlign:`center`, fontSize:`0.8em`,
              backgroundColor:(!isBlank(costInputs[i][1][j][0]))? `rgba(255,255,200,0.7)` : `transparent`,
              }" 
              :value="costInputs[i][1][j][0]"
              @change="modifyCost($event, i, 1, j, costInputs[i][1][j])"
              @click="inputAllSelect($event)"
              />
          </div>
        </template>

      <br v-if="i !== (rows.length - 1)" />
    </template>

  </div>


<!--
    <div class="box" :style="{width:`${calendar.length * 4}em`}">
      <div class="box bl">date</div>
      <br/>
      <template v-for="date in calendar">
        <div class="box bt bl" :style="{width:`${4}em`, textAlign:`center`}">{{ date.date }}</div>
      </template>
    </div>

    <br/>

    <template v-for="(row, i) in rows">
      <div class="box bt" style="width:20em;">
        <input spellcheck="false"/>
      </div>

      <template v-for="date in calendar">
        <div class="box bl bt" :style="{width:`${4}em`}">@bar</div>
      </template>
      <br v-if="i !== (rows.length - 1)" />
    </template>
    -->
</template>

<style scoped>
  .box {
    border-color: #ccc;
    line-height: 2.5em;
    height: 2.5em;
  }

  .box-container {
    border-color: #ccc;
  }

  input {
    vertical-align: middle;
    box-sizing: border-box;
    display: inline;
    outline: none;
    border: none;
    width: 100%;
    /*height: calc(100% - 1px);*/
    /*height: 1.5em;*/
    height: 100%;
    line-height: 1em;
    font-size: 1em;
    color: inherit;
    margin: 0;
    padding: 0;
    /*background-color: red;*/
  }
</style>

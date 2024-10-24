<script>
import ganttChart from "./GanttChart.js";
export default ganttChart;
</script>

<template>

  <div class="box-container ba" ref="root" 
      style="overflow:auto; width:80em; height:50em; position:relative;"
    @scroll="scroll">

    <div class="box br" style="width:20em; position:sticky; left:0; top:0; 
        height:2.5em; background-color:#fff; z-index:10000;">subject</div>
    <div class="box bb" :style="{width:`${calendar.length * 4}em`, 
        position:`sticky`, top:0, left:`20em`, backgroundColor:`#fff`, 
        zIndex:`9990` }">date</div>

    <br/>

    <div class="box br bb" style="width:20em; position:sticky; left:0; 
        top:2.5em; height:2.5em; background-color:#fff; 
        z-index:10000">&nbsp;</div>
    <template v-for="date in calendar">
      <div class="box bb br" :style="{width:`${4}em`, justifyContent:`center`, 
          position:`sticky`, top:`2.5em`, backgroundColor:`#fff`, 
          zIndex:`9990`}">
        {{ formatDateYM(date.date) }}
      </div>
    </template>

    <br/>

    <div :style="{position:`absolute`, top:`${2.5 * 2}em`, zIndex:0, 
        width:`${4 * calendar.length}em`, 
        height:`${2.5 * calendar.length}em`}">&nbsp;</div>

      <div v-if="viewWindowRow[0] >= 1" class="box" 
          :style="{zIndex:0, height:`${2.5 * viewWindowRow[0]}em`}">
      &nbsp;
      </div>
      <br v-if="viewWindowRow[0] >= 1" />

    <template v-for="(row, i) in rows">
      <template v-if="viewWindowRow[0] <= i && i <= viewWindowRow[1]">
        <div class="box br bb" style="width:20em; position:sticky; left:0;
            z-index:999; background-color:#fff" 
          @mouseover="mouseoverRow = i">

          <span v-if="mouseoverRow !== i">{{ row.subject }}</span>
          <input v-if="mouseoverRow === i" v-model="row.subject" 
            @click="inputAllSelect($event)" style=""/>

          <!--
          <input v-model="row.subject" @click="inputAllSelect($event)"/>
          -->
        </div>

        <div class="box bb" 
          :style="{display:`inline-block`, position:`relative`, 
            width:`${4 * calendar.length}em`, backgroundColor:`transparent`}"
          @mouseover="mouseoverRow = i">
          <template v-if="viewWindowRow[0] <= i && i <= viewWindowRow[1]">
            <template v-for="(date,j) in calendar">
              <template v-if="viewWindowCol[0] <= j && j <= viewWindowCol[1]">
                <div class="box br" :style="{width:`${4}em`, 
                  flexDirection:`column`, position:`absolute`, 
                  left:`${(j * 4)}em`}" 
                  @mouseover="mouseoverCol = j">

                  <span v-if="mouseoverCol !== j || mouseoverRow !== i" 
                    :style="{
                      textAlign:`center`, lineHeight:`1.20em`,
                      backgroundColor:(!isBlank(costInputs[i][0][j][0]))? `rgba(200,200,255,0.7)` : `transparent`,
                    }">
                    <span style="font-size:0.8em; white-space:pre">
                      {{(isBlank(costInputs[i][0][j][0]))? "&nbsp;" : costInputs[i][0][j][0]}}
                    </span>
                  </span>

                  <span v-if="mouseoverCol !== j || mouseoverRow !== i" 
                    :style="{
                    textAlign:`center`, lineHeight:`1.25em`,
                    backgroundColor:(!isBlank(costInputs[i][1][j][0]))? `rgba(255,255,200,0.7)` : `transparent`,
                    }">
                    <span style="font-size:0.8em; white-space:pre">
                      {{(isBlank(costInputs[i][1][j][0]))? "&nbsp;" : costInputs[i][1][j][0]}}
                    </span>
                  </span>

                  <input v-if="mouseoverCol === j && mouseoverRow === i" 
                    :style="{textAlign:`center`, fontSize:`0.8em`, 
                    lineHeight:`1.25em`,
                    backgroundColor:(!isBlank(costInputs[i][0][j][0]))? `rgba(200,200,255,0.7)` : `transparent`,
                    }" 
                    :value="costInputs[i][0][j][0]"
                    @change="modifyCost($event, i, 0, j, costInputs[i][0][j])"
                    @click="inputAllSelect($event)"
                    />
                  <input v-if="mouseoverCol === j && mouseoverRow === i"
                    :style="{textAlign:`center`, fontSize:`0.8em`,
                    backgroundColor:(!isBlank(costInputs[i][1][j][0]))? `rgba(255,255,200,0.7)` : `transparent`,
                    }" 
                    :value="costInputs[i][1][j][0]"
                    @change="modifyCost($event, i, 1, j, costInputs[i][1][j])"
                    @click="inputAllSelect($event)"
                    />

                  <!--
                  <input
                    :style="{textAlign:`center`, fontSize:`0.8em`, lineHeight:`1.25em`,
                    backgroundColor:(!isBlank(costInputs[i][0][j][0]))? `rgba(200,200,255,0.7)` : `transparent`,
                    }" 
                    :value="costInputs[i][0][j][0]"
                    @change="modifyCost($event, i, 0, j, costInputs[i][0][j])"
                    @click="inputAllSelect($event)"
                    />
                  <input
                    :style="{textAlign:`center`, fontSize:`0.8em`,
                    backgroundColor:(!isBlank(costInputs[i][1][j][0]))? `rgba(255,255,200,0.7)` : `transparent`,
                    }" 
                    :value="costInputs[i][1][j][0]"
                    @change="modifyCost($event, i, 1, j, costInputs[i][1][j])"
                    @click="inputAllSelect($event)"
                    />
                  -->

                </div>
              </template>
            </template>
          </template>
        </div>

        <br v-if="i !== (rows.length - 1)" />
      </template>
    </template>

  </div>

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

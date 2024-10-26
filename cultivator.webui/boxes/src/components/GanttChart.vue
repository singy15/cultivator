<script>
import ganttChart from "./GanttChart.js";
export default ganttChart;
</script>

<template>

  <div class="box-container ba" ref="root" @scroll="scroll"
      :style="{overflow:`auto`, width:`${width}em`, height:`${height}em`, 
        position:`relative`}">

    <!-- header -->

    <div class="box br" :style="{width:`${tasklistWidth}em`, position:`sticky`, 
        left:0, top:0, height:`${rowHeight}em`, 
        backgroundColor:`${backgroundColor}`, 
        zIndex:10000}">subject</div>

    <div class="box bb" :style="{width:`${calendar.length * cellWidth}em`, 
        position:`sticky`, top:0, left:`${tasklistWidth}em`, 
        backgroundColor:`${backgroundColor}`, 
        zIndex:`9990` }">date</div>

    <br/>

    <div class="box br bb" :style="{width:`${tasklistWidth}em`, position:`sticky`, 
        left:0, top:`${rowHeight * 1}em`, height:`${rowHeight}em`, 
        backgroundColor:`${backgroundColor}`, 
        zIndex:10000}">&nbsp;</div>

    <template v-for="date in calendar">
      <div class="box bb br" :style="{width:`${cellWidth}em`, 
          justifyContent:`center`, 
          position:`sticky`, top:`${rowHeight * 1}em`, 
          backgroundColor:`${backgroundColor}`, 
          zIndex:`9990`}">
        {{ formatDateYM(date.date) }}
      </div>
    </template>

    <br/>

    <!-- spacer -->

    <div :style="{position:`absolute`, top:`${rowHeight * 2}em`, zIndex:0, 
        width:`${cellWidth * calendar.length}em`, 
        height:`${rowHeight * rows.length}em`}">&nbsp;</div>

    <div v-if="viewWindowRow[0] >= 1" class="box" :style="{
      zIndex:0, height:`${rowHeight * viewWindowRow[0]}em`}">&nbsp;</div>

    <br v-if="viewWindowRow[0] >= 1" />

    <template v-for="(row, i) in rows">
      <template v-if="viewWindowRow[0] <= i && i <= viewWindowRow[1]">

        <!-- subject -->

        <div class="box br bb" @mouseover="mouseoverRow = i"
          :style="{width:`${tasklistWidth}em`, position:`sticky`,
            left:0, zIndex:999, backgroundColor:`${backgroundColor}`}">

          <span v-if="mouseoverRow !== i && focusRow !== i">
            {{ row.subject }}</span>
          <input v-if="mouseoverRow === i || focusRow === i" 
            v-model="row.subject" @click="inputAllSelect($event)" 
            @focus="focusRow = i"/>
          <!--
          <input v-model="row.subject" @click="inputAllSelect($event)"/>
          -->

        </div>

        <!-- cell -->

        <div class="box bb" @mouseover="mouseoverRow = i" :style="{
          display:`inline-block`, 
          position:`relative`, width:`${cellWidth * calendar.length}em`}">

          <template v-if="viewWindowRow[0] <= i && i <= viewWindowRow[1]">
            <template v-for="(date,j) in calendar">
              <template v-if="viewWindowCol[0] <= j && j <= viewWindowCol[1]">
                <div class="box br" @mouseover="mouseoverCol = j"
                  :style="{width:`${4}em`, flexDirection:`column`, 
                    position:`absolute`, left:`${(j * 4)}em`}">

                  <span v-if="!isInputtable(i,j)" 
                    :style="styleCellReadonly(i,j,0)">
                    <span :style="{fontSize:`${cellFontSize}em`, whiteSpace:`pre`}">
                      {{(isBlank(costInputs[i][0][j][0]))? 
                        "&nbsp;" : costInputs[i][0][j][0]}}
                    </span>
                  </span>

                  <span v-if="!isInputtable(i,j)" 
                    :style="styleCellReadonly(i,j,1)">
                    <span :style="{fontSize:`${cellFontSize}em`, whiteSpace:`pre`}">
                      {{(isBlank(costInputs[i][1][j][0]))? 
                        "&nbsp;" : costInputs[i][1][j][0]}}
                    </span>
                  </span>

                  <input v-if="isInputtable(i,j)" 
                    :value="costInputs[i][0][j][0]"
                    @input="modifyCost($event, i, 0, j, costInputs[i][0][j])"
                    @click="inputAllSelect($event)"
                    @focus="focusRow = i; focusCol = j"
                    :style="styleCellInput(i,j,0)"/>

                  <input v-if="isInputtable(i,j)" 
                    :value="costInputs[i][1][j][0]"
                    @input="modifyCost($event, i, 1, j, costInputs[i][1][j])"
                    @click="inputAllSelect($event)"
                    @focus="focusRow = i; focusCol = j"
                    :style="styleCellInput(i,j,1)"/>

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

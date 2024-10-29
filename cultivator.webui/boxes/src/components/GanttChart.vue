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

    <div class="box br" :style="{width:`${tasklistWidth}em`, position:`sticky`, 
        left:0, top:`${rowHeight * 1}em`, height:`${rowHeight * 0.5}em`, 
        backgroundColor:`${backgroundColor}`, 
        zIndex:10000}">&nbsp;</div>

    <template v-for="(date,j) in calendar">
      <div :class="[`box`, `bb`, 
        (isSameMonth(calendar[j+1]?.date, calendar[j].date))?
          `br` : undefined
        ]" 
        :style="{width:`${cellWidth}em`, 
          justifyContent:`center`, 
          position:`sticky`, top:`${rowHeight * 1}em`, 
          backgroundColor:`${backgroundColor}`, 
          whiteSpace:`pre`,
          lineHeight:`${rowHeight * 0.5}em`,
          height:`${rowHeight * 0.5}em`,
          flexDirection:`column`,
          textAlign:`center`,
          left:(isSameMonth(calendar[j-1]?.date, calendar[j].date))?
            `${tasklistWidth}em` : undefined,
          zIndex:(isSameMonth(calendar[j-1]?.date, calendar[j].date))?
            10000 : 9990,
          }">

        <div class="box" :style="{width:`${cellWidth}em`, 
            lineHeight:`${rowHeight * 0.5}em`, 
            justifyContent:`center`, 
            textAlign:`center`,
            }">
          <span v-if="isSameMonth(calendar[j-1]?.date, calendar[j].date)"
            :style="{lineHeight:`${rowHeight * 0.5}em`}">
            {{ formatDateYM(date?.date) }}</span>
        </div>

      </div>
    </template>

    <br/>

    <div class="box br bb" :style="{width:`${tasklistWidth}em`, position:`sticky`, 
        left:0, top:`${rowHeight * 1.5}em`, height:`${rowHeight * 0.5}em`, 
        backgroundColor:`${backgroundColor}`, 
        zIndex:10000}">&nbsp;</div>

    <template v-for="(date,j) in calendar">
      <div class="box bb" :style="{width:`${cellWidth}em`, 
          justifyContent:`center`, 
          position:`sticky`, top:`${rowHeight * 1.5}em`, 
          backgroundColor:`${backgroundColor}`, 
          zIndex:`9990`,
          whiteSpace:`pre`,
          lineHeight:`${rowHeight * 0.5}em`,
          height:`${rowHeight * 0.5}em`,
          flexDirection:`column`,
          textAlign:`center`,
          }">

        <template v-if="viewWindowCol[0] <= j && j <= viewWindowCol[1]">
          <div class="box br" :style="{width:`${cellWidth}em`, 
              lineHeight:`${rowHeight * 0.5}em`, 
              justifyContent:`center`, 
              textAlign:`center`,
              flexDirection:`column`,
              }">
            <div class="box" :style="{lineHeight:`${rowHeight * 0.25}em`, 
              justifyContent:`center`, 
              }">
              <span :style="{fontSize:`1.0em`,
                color: (isHoliday(date?.date))? '#f00' : undefined,
                }">{{ formatDateD(date?.date) }}</span>
            </div>
            <div class="box" :style="{lineHeight:`${rowHeight * 0.25}em`,
              justifyContent:`center`, 
              }">
              <span :style="{fontSize:`0.6em`,
                color: (isHoliday(date?.date))? '#f00' : undefined,
                }">{{ formatDateDay(date?.date) }}</span>
            </div>
          </div>
        </template>

      </div>
    </template>

    <br/>

    <!-- spacer -->

    <div :style="{position:`absolute`, top:`${rowHeight * 2}em`, zIndex:0, 
        width:`${cellWidth * calendar.length}em`, 
        height:`${rowHeight * rowsDisplay.length}em`}">&nbsp;</div>

<!--
    <div v-if="viewWindowRow[0] >= 1" class="box" :style="{
      zIndex:0, height:`${rowHeight * viewWindowRow[0]}em`}">&nbsp;</div>
      -->
    <div v-if="viewWindowRow[0] >= 1" class="box" :style="{
      zIndex:0, height:`${rowHeight * viewWindowRow[0]}em`}">&nbsp;</div>

    <br v-if="viewWindowRow[0] >= 1" />

    <template v-for="(row, i) in rowsDisplay">
      <template v-if="isRowInViewWindow(row[0], i)">

        <!-- subject -->

        <div :class="[`box`, `br`, `bb`, 
          (isTotalRow(i))? `bt` : undefined]" 
          @mouseover="mouseoverRow = i"
          :style="{width:`${tasklistWidth}em`, position:`sticky`,
            left:0, zIndex:999, backgroundColor:`${backgroundColor}`,
            bottom:(i === (rowsDisplay.length - 1))? 0 : undefined}">

          <!--
          <span v-if="isSubjectInputtable(i)"
            :style="{display:`inline-block`, boxSizing:`border-box`, 
              width:`${idWidth}em`, padding:`0px ${subjectPaddingPx}px`}"
            >{{ row[0].id }}</span>
          <span v-if="isSubjectInputtable(i)"
            :style="{display:`inline-block`, width:`${subjectWidth}em`,
              borderLeft:`solid 1px #ccc`, boxSizing:`border-box`, 
              padding:`0px ${subjectPaddingPx}px`}"
            >{{ row[0].subject }}</span>
          -->

          <!-- @click="(rowsMeta[i].fold)? unfold(i) : fold(i)" -->
          <span :style="{display:`inline-block`, width:`${rowHeadWidth}em`, 
            textAlign:`center`,
            padding:`0px 0px`,
            cursor:`pointer`}"
            @click="toggleFold(row[0].id, !(rowsStructure.ptr[row[0].id]?.meta.fold))">
            {{ (rowsStructure.ptr[row[0].id]?.hasChildren)? 
              ((rowsStructure.ptr[row[0].id]?.meta.fold)? "+" : "-") : 
              "" }}
          </span>
          <input
            @click="inputAllSelect($event)" 
            :value="row[0].id"
            :ref="`inputId-${i}`"
            @change="changeRowId(row[0], $event.target.value)"
            @keydown.shift.enter="insertRow(row[0], createRow('',''))"
            @keydown.shift.delete="removeRow(row[0])"
            @keydown.shift.up="moveRow(-1, rowsDisplay[i][0], rowsDisplay[i-1][0], 0)"
            @keydown.shift.down="moveRow(1, rowsDisplay[i][0], rowsDisplay[i+1][0], 0)"
            :style="{width:`${idWidth}em`, padding:`0px ${subjectPaddingPx}px`,
              borderLeft:`solid 1px #ccc` }" />
          <input
            :ref="`inputSubject-${i}`"
            v-model="row[0].subject" @click="inputAllSelect($event)" 
            @keydown.shift.enter="insertRow(row[0], createRow('',''))"
            @keydown.shift.delete="removeRow(row[0])"
            @keydown.shift.up="moveRow(-1, rowsDisplay[i][0], rowsDisplay[i-1][0], 1)"
            @keydown.shift.down="moveRow(1, rowsDisplay[i][0], rowsDisplay[i+1][0], 1)"
            :style="{width:`${subjectWidth}em`, borderLeft:`solid 1px #ccc`,
              padding:`0px ${subjectPaddingPx}px`}" />
          <input
            :ref="`inputAssignee-${i}`"
            v-model="row[0].assignee" @click="inputAllSelect($event)" 
            @keydown.shift.enter="insertRow(row[0], createRow('',''))"
            @keydown.shift.delete="removeRow(row[0])"
            @keydown.shift.up="moveRow(-1, rowsDisplay[i][0], rowsDisplay[i-1][0], 2)"
            @keydown.shift.down="moveRow(1, rowsDisplay[i][0], rowsDisplay[i+1][0], 2)"
            :style="{width:`${assigneeWidth}em`, borderLeft:`solid 1px #ccc`,
              padding:`0px ${subjectPaddingPx}px`}" />
          <span :style="{display:`inline-block`, width:`${statisticsWidth}em`, 
            textAlign:`left`,
            padding:`0px 0px`,
            borderLeft:`solid 1px #ccc`,
            florDirection: `column`,
            lineHeight:`${(rowHeight * 1) / 3.0}em`,
            }" >
            <!--
            <span>PV:{{ rowsStatistics?.[row[0].id]?.[0] }}</span>
            <br>
            <span>EV:{{ rowsStatistics?.[row[0].id]?.[1] }}</span>
            <br>
            <span>AC:{{ rowsStatistics?.[row[0].id]?.[2] }}</span>
            -->
            <span style="font-size:0.8em;">{{ formatPercent(rowsStatistics?.[row[0].id]?.[2], rowsStatistics?.[row[0].id]?.[0]) }}</span>
            <span style="font-size:0.8em; color:white; background-color:rgba(255,100,100);">{{ formatCostState(rowsStatistics?.[row[0].id]?.[1], rowsStatistics?.[row[0].id]?.[0]) }}</span>
          </span>
        </div>

        <!-- cell -->

        <div :class="[`box`, `bb`, 
          (isTotalRow(i))? `bt` : undefined]" 
          :style="{ display:`inline-block`, 
          position:(isTotalRow(i))? `sticky` : `relative`, 
          bottom:(isTotalRow(i))? 0 : undefined, 
          width:`${cellWidth * calendar.length}em`,
          backgroundColor:`${backgroundColor}`}">

          <!-- <template v-if="(viewWindowRow[0] <= i && i <= viewWindowRow[1]) || (isTotalRow(i))"> -->
          <template v-if="true">
            <template v-for="(date,j) in calendar">
              <template v-if="viewWindowCol[0] <= j && j <= viewWindowCol[1]">
                <div class="box br" 
                  :style="styleDate(j)">

                  <template v-if="row[0].id !== ''">

                  <span v-if="!isInputtable(i,j)" 
                    :style="styleCellReadonly(i,j,0)"
                    @click="editCell(i,j,0)">
                    <span :style="{fontSize:`${cellFontSize}em`, whiteSpace:`pre`}">
                      {{(isBlank(costInputs[i]?.[0]?.[j]?.[0]))? 
                        "&nbsp;" : costInputs[i]?.[0]?.[j]?.[0]}}
                    </span>
                  </span>

                  <span v-if="!isInputtable(i,j)" 
                    :style="styleCellReadonly(i,j,2)"
                    @click="editCell(i,j,2)">
                    <span :style="{fontSize:`${cellFontSize}em`, whiteSpace:`pre`}">
                      {{(isBlank(costInputs[i]?.[2]?.[j]?.[0]))? 
                        "&nbsp;" : costInputs[i]?.[2]?.[j]?.[0]}}
                    </span>
                  </span>

                  <span v-if="!isInputtable(i,j)" 
                    :style="styleCellReadonly(i,j,1)"
                    @click="editCell(i,j,1)">
                    <span :style="{fontSize:`${cellFontSize}em`, whiteSpace:`pre`}">
                      {{(isBlank(costInputs[i]?.[1]?.[j]?.[0]))? 
                        "&nbsp;" : costInputs[i]?.[1]?.[j]?.[0]}}
                    </span>
                  </span>

                  <input v-if="isInputtable(i,j)" 
                    :value="costInputs[i]?.[0]?.[j]?.[0]"
                    @input="modifyCost($event, i, 0, j, costInputs[i]?.[0]?.[j])"
                    @click="inputAllSelect($event)"
                    @focus="focusRow = i; focusCol = j"
                    ref="cell0"
                    :style="styleCellInput(i,j,0)"/>

                  <input v-if="isInputtable(i,j)" 
                    :value="costInputs[i]?.[2]?.[j]?.[0]"
                    @input="modifyCost($event, i, 2, j, costInputs[i]?.[2]?.[j])"
                    @click="inputAllSelect($event)"
                    @focus="focusRow = i; focusCol = j"
                    ref="cell2"
                    :style="styleCellInput(i,j,2)"/>

                  <input v-if="isInputtable(i,j)" 
                    :value="costInputs[i]?.[1]?.[j]?.[0]"
                    @input="modifyCost($event, i, 1, j, costInputs[i]?.[1]?.[j])"
                    @click="inputAllSelect($event)"
                    @focus="focusRow = i; focusCol = j"
                    ref="cell1"
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

                  </template>

                </div>
              </template>
            </template>
          </template>
        </div>

        <br v-if="i !== (rowsDisplay.length - 1)" />

      </template>
    </template>

  </div>

</template>

<style scoped>
  .box {
    border-color: #ccc;
    line-height: v-bind(cssRowHeight);
    height: v-bind(cssRowHeight);
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

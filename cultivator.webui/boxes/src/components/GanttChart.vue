<script>
import "../boxes.css";
import moment from "moment";

function now() {
  return moment().startOf("day");
}

function dateRange(base, days) {
  let ds = [];
  for(let i = 0; i < days; i++) {
    ds.push(moment(base).add(i, "days").toDate());
  }
  return ds;
}

export default {
  components: {
  },
  data() {
    let ds = dateRange(now().toDate(), 10).map(d => {
      return { date: d };
    });
    return {
      calendar: ds,
      rows: [
        { id: "1", subject: "task1", },
        { id: "2", subject: "task2", },
        { id: "3", subject: "task3", },
      ],
      costPls: [
        { taskId: "1", date: now().add(1,"days").toDate(), cost: 7.0 },
        { taskId: "1", date: now().add(2,"days").toDate(), cost: 7.0 },
        { taskId: "1", date: now().add(3,"days").toDate(), cost: 7.0 },
        { taskId: "2", date: now().add(4,"days").toDate(), cost: 7.0 },
        { taskId: "2", date: now().add(5,"days").toDate(), cost: 3.0 },
      ],
      costAcs: [
        { taskId: "1", date: now().add(1,"days").toDate(), cost: 7.0 },
        { taskId: "1", date: now().add(2,"days").toDate(), cost: 7.0 },
        { taskId: "2", date: now().add(3,"days").toDate(), cost: 7.0 },
        { taskId: "2", date: now().add(4,"days").toDate(), cost: 3.0 },
      ]
    }
  },
  watch: { },
  computed: {
    costInputs: function() {
      return this.rows.map(r => {
        let costsPl = new Array(this.calendar.length);
        let costsAc = new Array(this.calendar.length);

        this.calendar.forEach((c,i) => {
          costsPl[i] = [null, null];
          costsAc[i] = [null, null];
          
          let curDt = c.date;

          let pl = this.costPls.filter(p => p.taskId === r.id && p.date.getTime() === curDt.getTime())[0];
          let ac = this.costAcs.filter(a => a.taskId === r.id && a.date.getTime() === curDt.getTime())[0];
          
          if(pl) { 
            costsPl[i][0] = pl.cost; 
            costsPl[i][1] = pl;
          }
          if(ac) { 
            costsAc[i][0] = ac.cost;
            costsAc[i][1] = ac;
          }
        });

        return [costsPl, costsAc];
      });
    }
  },
  methods: {
    formatDateYM(date) {
      return moment(date).format("MM/DD");
    },
    modifyCost(e, i, n, j, costInput) {
      let newVal = e.target.value;

      if(newVal === "") {
        if(n === 0) {
          this.costPls = this.costPls.filter(p => p != costInput[1]);
        } else if(n === 1) {
          this.costAcs = this.costAcs.filter(a => a != costInput[1]);
        }
        return;
      }

      let cost = parseFloat(newVal, 10);
      if(costInput[1] != null) {
        costInput.cost = cost;
      } else {
        let row = this.rows[i];
        let d = this.calendar[j].date;
        let costData = { taskId: row.id, date: d, cost: cost };
        if(n === 0) {
          this.costPls.push(costData);
        } else if(n === 1) {
          this.costAcs.push(costData);
        }
      }
    },
    inputAllSelect(e) {
      e.target.select();
    },
    isBlank(val) {
      return val == null || val === undefined; 
    }
  },
  mounted() {
  }
}
</script>

<template>

  <div class="box-container ba">

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

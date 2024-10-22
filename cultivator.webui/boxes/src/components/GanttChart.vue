<script>
import "../boxes.css";
import moment from "moment";

export default {
  components: {
  },
  data() {
    return {
      calendar: [
        { date: moment().add(1,"days").toDate() },
        { date: moment().add(2,"days").toDate() },
        { date: moment().add(3,"days").toDate() },
        { date: moment().add(4,"days").toDate() },
        { date: moment().add(5,"days").toDate() },
      ],
      rows: [
        { id: "t1", subject: "task1", },
        { id: "t2", subject: "task2", },
        { id: "t3", subject: "task3", },
      ],
      costPl: [
        { taskId: "t1", date: moment().add(2,"days").toDate(), cost: 2.0 },
        { taskId: "t1", date: moment().add(3,"days").toDate(), cost: 2.0 },
        { taskId: "t1", date: moment().add(5,"days").toDate(), cost: 1.0 },
        { taskId: "t2", date: moment().add(2,"days").toDate(), cost: 2.0 },
      ],
      costAc: [
        { taskId: "t1", date: moment().add(2,"days").toDate(), cost: 2.0 },
        { taskId: "t1", date: moment().add(3,"days").toDate(), cost: 2.0 },
        { taskId: "t1", date: moment().add(5,"days").toDate(), cost: 1.0 },
        { taskId: "t2", date: moment().add(2,"days").toDate(), cost: 2.0 },
      ]
    }
  },
  watch: { },
  computed: {
    costInput: function() {
      return this.rows.map(r => {
        let costsPl = new Array(this.calendar.length);
        let costsAc = new Array(this.calendar.length);

        this.calendar.forEach(c)

        this.costPl.filter(p => p.taskId === r.id 

        return [costsPl, costsAc];
      });
    }
  },
  methods: {
    formatDateYM(date) {
      return moment(date).format("MM/DD");
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
          <input />
        </div>

        <template v-for="date in calendar">
          <div class="box bl bt" :style="{width:`${4}em`, flexDirection:`column`}">
            <input :style="{textAlign:`center`, fontSize:`0.8em`,
              backgroundColor:`rgba(200,200,255,0.7)`
              }" :value="0"/>
            <input :style="{textAlign:`center`, fontSize:`0.8em`,
              backgroundColor:`rgba(255,255,200,0.7)`
              }" :value="0"/>
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

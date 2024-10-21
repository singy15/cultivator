<script>
import "../boxes.css";

export default {
  components: {
  },
  data() {
    return {
      calendar: [
        { date: "1/1" },
        { date: "1/2" },
        { date: "1/3" },
        { date: "1/4" },
        { date: "1/5" },
      ],
      rows: [
        { subject: "test1", },
        { subject: "test2", },
        { subject: "test3", },
        { subject: "test3", },
        { subject: "test3", },
        { subject: "test3", },
        { subject: "test3", },
      ]
    }
  },
  watch: { },
  methods: {
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
        <div class="box bt bl" :style="{width:`${4}em`, textAlign:`center`}">{{ date.date }}</div>
      </template>
    </div>

    <br/>

    <template v-for="(row, i) in rows">
      <!-- <div class="box-container bb-last"> -->
        <div class="box bt" style="width:20em;">
          <input />
        </div>

        <template v-for="date in calendar">
          <div class="box bl bt" :style="{width:`${4}em`}">
            <input />
          </div>
        </template>

      <!-- </div> -->
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
    line-height: 1.5em;
    font-size: 1em;
    color: inherit;
    margin: 0;
    padding: 0;
    /*background-color: red;*/
  }
</style>

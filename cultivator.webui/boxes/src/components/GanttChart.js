
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

function times(n, fn) {
  let xs = [];
  for(let i = 0; i < n; i++) {
    xs.push(fn(i));
  }
  return xs;
}

function em2px(em) {
  return Number(em) * Number(
    window.getComputedStyle(document.body)
    .getPropertyValue('font-size').match(/\d+/)[0]);
}

export default {
  props: {
    width: {
      type: Number,
      default: 80,
      required: true,
    },
    height: {
      type: Number,
      default: 50,
      required: true,
    },
    rowHeight: {
      type: Number,
      default: 2.5,
      required: true,
    },
    renderDelay: {
      type: Number,
      default: 300,
      required: false
    },
    colorCostPlanBar: {
      type: String,
      default: `rgba(200,200,255,0.7)`,
      required: false,
    },
    colorCostActualBar: {
      type: String,
      default: `rgba(255,255,200,0.7)`,
      required: false,
    },
    cellWidth: {
      type: Number,
      default: 4,
      required: true,
    },
    backgroundColor: {
      type: String,
      default: `#fff`,
      required: false
    },
    idWidth: {
      type: Number,
      default: 5,
      required: false,
    },
    subjectWidth: {
      type: Number,
      default: 15,
      required: false,
    },
    cellFontSize: {
      type: Number,
      default: 0.8,
      required: false,
    }
  },
  components: {
  },
  data() {
    let ds = dateRange(now().toDate(), 31 * 4).map(d => {
      return { date: d };
    });
    let rs = times(200, (i) => {
      return { id: `${i}`, subject: `task${i}`, };
    });

    let rowHeight = em2px(2.5);
    let rowsInScreen = Math.ceil(em2px(50) / rowHeight);
    let colWidth = em2px(4);
    let colsInScreen = Math.ceil(em2px(80 - 20) / colWidth);

    return {
      calendar: ds,
      rows: rs,
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
      ],
      scrollTop: 0,
      viewWindowRow: [0,rowsInScreen],
      viewWindowCol: [0,colsInScreen],
      mouseoverRow: -1,
      mouseoverCol: -1,
      focusRow: -1,
      focusCol: -1,
      timeoutReview: null,
      subjectPaddingPx: 5,
    }
  },
  watch: { },
  computed: {
    tasklistWidth: function() {
      return this.idWidth + this.subjectWidth;
    },
    costInputs: function() {
      let sd = new Date();
      let cis = this.rows.map(r => {
        let costsPl = new Array(this.calendar.length);
        let costsAc = new Array(this.calendar.length);

        this.calendar.forEach((c,i) => {
          costsPl[i] = [null, null];
          costsAc[i] = [null, null];
          
          let curDt = c.date;

          let pl = this.costPls.filter(
            p => p.taskId === r.id && p.date.getTime() === curDt.getTime())[0];
          let ac = this.costAcs.filter(
            a => a.taskId === r.id && a.date.getTime() === curDt.getTime())[0];
          
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
      let ed = new Date();

      console.log(ed - sd);

      return cis;
    },
    rootWidth: function() {
      return 4 * this.calendar.length;
    }
  },
  methods: {
    msg(val) {
      console.log(val);
    },
    scroll() {
      if(this.timeoutReview) {
        clearTimeout(this.timeoutReview);
      }
      this.timeoutReview = setTimeout(() => {
        let scrollTop = this.$refs.root.scrollTop;
        let scrollLeft = this.$refs.root.scrollLeft;
        let rowHeight = em2px(2.5);
        let rowsInScreen = Math.ceil(em2px(50) / rowHeight);
        let colWidth = em2px(4);
        let colsInScreen = Math.ceil(em2px(80 - 20) / colWidth);
        let rowsToHide = Math.floor(scrollTop / rowHeight);
        this.viewWindowRow = [ 
          Math.floor(scrollTop / rowHeight),
          Math.floor(scrollTop / rowHeight) + rowsInScreen];
        this.viewWindowCol = [ 
          Math.floor(scrollLeft / colWidth),  
          Math.floor(scrollLeft / colWidth) + colsInScreen];
        this.scrollTop = scrollTop;
      }, this.renderDelay);
    },
    formatDateYM(date) {
      return moment(date).format("MM/DD");
    },
    modifyCost(e, i, n, j, costInput) {
      let newVal = e.target.value;
      let cost = parseFloat(newVal, 10);

      if(isNaN(cost)) {
        this.removeCostPlan(n, costInput[1]);
        return;
      }

      if(costInput[1] != null) {
        costInput[1].cost = cost;
      } else {
        let costData = this.createCostPlan(
          this.rows[i].id, this.calendar[j].date, cost );
        this.addCostPlan(n, costData);
      }
    },
    createCostPlan(taskId, date, cost) {
      return { taskId: taskId, date: date, cost: cost };
    },
    getCostPlan(n) {
      if(n === 0) {
        return this.costPls;
      } else if(n === 1) {
        return this.costAcs;
      }
    },
    removeCostPlan(from, obj) {
      if(from === 0) {
        this.costPls = this.costPls.filter(p => p != obj);
      } else if(from === 1) {
        this.costAcs = this.costAcs.filter(a => a != obj);
      }
    },
    addCostPlan(to, obj) {
      let target = this.getCostPlan(to);
      target.push(obj);
    },
    inputAllSelect(e) {
      e.target.select();
    },
    isBlank(val) {
      return val == null || val === undefined; 
    },
    isInputtable(row, col) {
      return (this.mouseoverCol === col && this.mouseoverRow === row)
        || (this.focusCol === col && this.focusRow === row);
    },
    isSubjectInputtable(row) {
      return this.mouseoverRow !== row && this.focusRow !== row;
    },
    styleCellReadonly(i,j,n) {
      let halfRowHeight = `${this.rowHeight * 0.5}em`;
      let barColor;
      if(n === 0) {
        barColor = this.colorCostPlanBar;
      } else if(n === 1) {
        barColor = this.colorCostActualBar;
      }

      return { 
        display:`inline-block`,
        textAlign:`center`, 
        lineHeight: halfRowHeight, 
        height: halfRowHeight, 
        backgroundColor: (!this.isBlank(this.costInputs[i][n][j][0]))? 
          barColor : `transparent`, 
      };
    },
    styleCellInput(i,j,n) {
      let barColor;
      if(n === 0) {
        barColor = this.colorCostPlanBar;
      } else if(n === 1) {
        barColor = this.colorCostActualBar;
      }

      return {
        textAlign:`center`, 
        fontSize: `${this.cellFontSize}em`, 
        height:`${this.rowHeight}em`, 
        backgroundColor:(!this.isBlank(this.costInputs[i][n][j][0]))? 
          barColor : `transparent`, 
      };
    },
    insertRow(index, obj) {
      this.rows.splice(index, 0, obj);
    },
    removeRow(index) {
      this.rows.splice(index, 1);
    },
    createRow(id, subject) {
      return ({ id: id, subject: subject, });
    },
    changeRowId(row, newId) {
      let existing = this.rows.filter(r => r.id === newId);
      if(existing.length > 0) {
        let oldId = row.id;
        row.id = "";
        row.id = oldId;
        return;
      }

      row.id = newId;
    }
  },
  mounted() {
  }
}

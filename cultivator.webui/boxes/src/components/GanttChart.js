
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
  components: {
  },
  data() {
    let ds = dateRange(now().toDate(), 31 * 12).map(d => {
      return { date: d };
    });
    let rs = times(500, (i) => {
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
    }
  },
  watch: { },
  computed: {
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
      }, 300);
    },
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

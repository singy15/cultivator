
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

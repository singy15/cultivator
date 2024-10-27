
import "../boxes.css";
import moment from "moment";

// const endpoint = import.meta.env.VITE_API_ENDPOINT;
let storageBaseKey = "gantt-chart";

function getStorage(key, defaultValue) {
  let val = localStorage.getItem(`${storageBaseKey}/${key}`);
  if(val === "undefined" || val === "null" || val == null || val === undefined) {
    return defaultValue;
  } else {
    return JSON.parse(val);
  }
}

function setStorage(key, obj) {
  localStorage.setItem(`${storageBaseKey}/${key}`, JSON.stringify(obj));
}

function uuid4() {
  let str = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str[i]) {
      case "x":
        str[i] = Math.floor(Math.random() * 16).toString(16);
        break;
      case "y":
        str[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
        break;
    }
  }
  return str.join("");
}

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

function dateRangeSE(st, ed) {
  let ds = [];
  let cur = moment(st);
  let med = moment(ed);
  for(; med.diff(cur, "days") > 0; cur.add(1, "days")) {
    ds.push(cur.toDate());
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

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

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
    colorCostEarnedBar: {
      type: String,
      default: `rgba(230,230,230,0.7)`,
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
    rowHeadWidth: {
      type: Number,
      default: 1,
      required: false,
    },
    idWidth: {
      type: Number,
      default: 5,
      required: false,
    },
    subjectWidth: {
      type: Number,
      default: 20,
      required: false,
    },
    assigneeWidth: {
      type: Number,
      default: 5,
      required: false,
    },
    cellFontSize: {
      type: Number,
      default: 0.8,
      required: false,
    },
    startDate: {
      type: Date,
      default: new Date(),
      required: false,
    },
    endDate: {
      type: Date,
      default: moment(new Date()).add(1, "months").toDate(),
      required: false,
    },
    cellRows: {
      type: Number,
      default: 3,
      required: false
    }
  },
  components: {
  },
  data() {
    let ds = dateRangeSE(this.startDate, this.endDate).map(d => {
      return { date: d };
    });

    return {
      calendar: ds,
      rows: getStorage("rows", [{ id: "", subject: "" }]),
      rowsMeta: getStorage("rows", [{ id: "", subject: "" }])
        .map(e => ({ row: e, fold: false })),
      costPls: getStorage("costPls", [])
        .map(e => { e.date = new Date(e.date); return e; }),
      costAcs: getStorage("costAcs",[])
        .map(e => { e.date = new Date(e.date); return e; }),
      costEvs: getStorage("costEvs",[])
        .map(e => { e.date = new Date(e.date); return e; }),
      scrollTop: 0,
      viewWindowRow: [0,0],
      viewWindowCol: [0,0],
      mouseoverRow: -1,
      mouseoverCol: -1,
      focusRow: -1,
      focusCol: -1,
      timeoutReview: null,
      subjectPaddingPx: 5,
      costPlanMap: {},
      timeoutCalculateCostPlanMap: null,
      rowsStructureVersion: 0,
      rowsStructure: { tree: {}, ptr: {} },
    }
  },
  watch: { 
    rows: {
      handler(newval, oldval) { 
        setStorage("rows", this.rows);
      },
      deep: true,
    },
    costPls: {
      handler(newval, oldval) { 
        setStorage("costPls", this.costPls);
      },
      deep: true,
    },
    costAcs: {
      handler(newval, oldval) { 
        setStorage("costAcs", this.costAcs);
      },
      deep: true,
    },
    costEvs: {
      handler(newval, oldval) { 
        setStorage("costEvs", this.costEvs);
      },
      deep: true,
    }
  },
  computed: {
    rowsDisplay: function() {
      let rs = [];
      this.rows.forEach((r, i) => {
        if(this.branchVisible(r.id)) {
          rs.push([r,i]);
        }
      });
      rs.push([{ id:"@", subject:"TOTAL" }, -1]);

      window.rs = rs;
      return rs;
    },
    tasklistWidth: function() {
      return this.rowHeadWidth + this.idWidth + this.subjectWidth + this.assigneeWidth;
    },
    cssRowHeight: function() {
      return `${this.rowHeight}em`;
    },
    costInputs: function() {
      let vwr = this.viewWindowRow;
      let vwc = this.viewWindowCol;
      let sd = new Date();
      let rows = this.rowsDisplay.slice(0, this.rowsDisplay.length - 1);
      let cis = rows.map((r,j) => {
        let costsPl = new Array(this.calendar.length);
        let costsAc = new Array(this.calendar.length);
        let costsEv = new Array(this.calendar.length);

        if(vwr[0] > j || vwr[1] <= j) return;

        this.calendar.forEach((c,i) => {
          if(vwc[0] > i || vwc[1] <= i) return;

          costsPl[i] = [null, null];
          costsAc[i] = [null, null];
          costsEv[i] = [null, null];
          
          let curDt = c.date;

          // let pl = this.costPlanMap[r.id]?.[curDt.getTime()]?.[0];
          // let ac = this.costPlanMap[r.id]?.[curDt.getTime()]?.[1];
          let pl = this.costPls.filter(
            p => p.taskId === r[0].id && p.date.getTime() === curDt.getTime())[0];
          let ac = this.costAcs.filter(
            a => a.taskId === r[0].id && a.date.getTime() === curDt.getTime())[0];
          let ev = this.costEvs.filter(
            e => e.taskId === r[0].id && e.date.getTime() === curDt.getTime())[0];
          
          if(pl) { 
            costsPl[i][0] = pl.cost; 
            costsPl[i][1] = pl;
          }
          if(ac) { 
            costsAc[i][0] = ac.cost;
            costsAc[i][1] = ac;
          }
          if(ev) { 
            costsEv[i][0] = ev.cost;
            costsEv[i][1] = ev;
          }
        });

        return [costsPl, costsAc, costsEv];
      });
      let ed = new Date();

      console.log("costInputs", ed - sd);

      cis.push(this.costInputsTotal);

      window.cis = cis;

      return cis;
    },
    costInputsTotal: function() {
      let vwr = this.viewWindowRow;
      let vwc = this.viewWindowCol;
      let sd = new Date();
      let costsPl = new Array(this.calendar.length);
      let costsAc = new Array(this.calendar.length);
      let costsEv = new Array(this.calendar.length);

      this.calendar.forEach((c,i) => {
        if(vwc[0] > i || vwc[1] <= i) return;

        costsPl[i] = [null, null];
        costsAc[i] = [null, null];
        costsEv[i] = [null, null];
        
        let curDt = c.date;

        let pl = this.costPls.filter(
          p => p.date.getTime() === curDt.getTime())
          .reduce((m,x) => m + x.cost, 0.0);
        let ac = this.costAcs.filter(
          a => a.date.getTime() === curDt.getTime())
          .reduce((m,x) => m + x.cost, 0.0);
        let ev = this.costEvs.filter(
          e => e.date.getTime() === curDt.getTime())
          .reduce((m,x) => m + x.cost, 0.0);
        
        if(pl) { 
          costsPl[i][0] = pl; 
          costsPl[i][1] = null;
        }
        if(ac) { 
          costsAc[i][0] = ac;
          costsAc[i][1] = null;
        }
        if(ev) { 
          costsEv[i][0] = ev;
          costsEv[i][1] = null;
        }
      });

      return [costsPl, costsAc, costsEv];
      let ed = new Date();

      console.log("costInputsTotal", ed - sd);

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
    requestRecalculateCostPlanMap() {
      this.timeoutCalculateCostPlanMap = setTimeout(() => {
        this.recalculateCostPlanMap();
        this.timeoutCalculateCostPlanMap = null;
      }, 500);
    },
    recalculateCostPlanMap() {
      this.costPlanMap = (() => {
        let sd = new Date();
        let m = {};
        this.rows.forEach(r => {
          if(r.id === "") return;
          m[r.id] = {};
          this.calendar.forEach(c => {
            let curDt = c.date;
            let pl = this.costPls.filter(
              p => p.taskId === r.id && p.date.getTime() === curDt.getTime())[0];
            let ac = this.costAcs.filter(
              a => a.taskId === r.id && a.date.getTime() === curDt.getTime())[0];
            m[r.id][curDt.getTime()] = [pl, ac];
          });
        });
        let ed = new Date();
        console.log("costPlanMap", ed - sd);
        return m;
      })();
    },
    recalcurateViewWindow() {
      let scrollTop = (this?.$refs?.root?.scrollTop)? this?.$refs?.root?.scrollTop : 0;
      let scrollLeft = (this?.$refs?.root?.scrollLeft)? this?.$refs?.root?.scrollLeft : 0;
      let rowHeight = em2px(this.rowHeight);
      let rowsInScreen = Math.floor((this.height - (this.rowHeight * 2.0)) / this.rowHeight);
      let colWidth = em2px(this.cellWidth);
      let colsInScreen = Math.ceil(em2px(this.width - this.tasklistWidth) / colWidth);
      let rowsToHide = Math.floor(scrollTop / rowHeight);
      this.viewWindowRow = [ 
        Math.floor(scrollTop / rowHeight),
        Math.floor(scrollTop / rowHeight) + rowsInScreen];
      this.viewWindowCol = [ 
        Math.floor(scrollLeft / colWidth),  
        Math.floor(scrollLeft / colWidth) + colsInScreen];
      this.scrollTop = scrollTop;
    },
    scroll() {
      if(this.timeoutReview) {
        clearTimeout(this.timeoutReview);
      }
      this.timeoutReview = setTimeout(() => {
        this.recalcurateViewWindow();
      }, this.renderDelay);
    },
    formatDateYM(date) {
      return moment(date).format("YY/MM");
    },
    formatDateM(date) {
      if(date === undefined || date == null) { return ""; }
      return moment(date).format("M");
    },
    formatDateD(date) {
      return moment(date).format("D");
    },
    formatDateDay(date) {
      return moment(date).format("ddd");
    },
    isSameMonth(date1, date2) {
      if(date1 === undefined || date2 == null) { return true; }
      if(date1 === undefined || date2 == null) { return true; }
      return moment(date1).format("M") !== moment(date2).format("M");
    },
    modifyCost(e, i, n, j, costInput) {
      let newVal = e.target.value;
      let cost = parseFloat(newVal, 10);

      if(newVal === "-") return;

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
      } else if(n === 2) {
        return this.costEvs;
      }
    },
    removeCostPlan(from, obj) {
      if(from === 0) {
        this.costPls = this.costPls.filter(p => p != obj);
      } else if(from === 1) {
        this.costAcs = this.costAcs.filter(a => a != obj);
      } else if(from === 2) {
        this.costEvs = this.costEvs.filter(a => a != obj);
      }
      // this.requestRecalculateCostPlanMap();
    },
    addCostPlan(to, obj) {
      let target = this.getCostPlan(to);
      target.push(obj);

      if(this.timeoutCalculateCostPlanMap != null) {
        clearTimeout(this.timeoutCalculateCostPlanMap);
      }
      // this.requestRecalculateCostPlanMap();
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
      let oneRowHeight = `${this.rowHeight / this.cellRows}em`;
      let barColor;
      if(n === 0) {
        barColor = this.colorCostPlanBar;
      } else if(n === 1) {
        barColor = this.colorCostActualBar;
      } else if(n === 2) {
        barColor = this.colorCostEarnedBar;
      }

      return { 
        display:`inline-block`,
        textAlign:`center`, 
        lineHeight: oneRowHeight, 
        height: oneRowHeight, 
        backgroundColor: (!this.isBlank(this.costInputs[i]?.[n]?.[j]?.[0]))? 
          barColor : `transparent`, 
        cursor: `text`,
      };
    },
    styleCellInput(i,j,n) {
      let barColor;
      if(n === 0) {
        barColor = this.colorCostPlanBar;
      } else if(n === 1) {
        barColor = this.colorCostActualBar;
      } else if(n === 2) {
        barColor = this.colorCostEarnedBar;
      }

      return {
        textAlign:`center`, 
        fontSize: `${this.cellFontSize}em`, 
        height:`${this.rowHeight}em`, 
        backgroundColor:(!this.isBlank(this.costInputs[i]?.[n]?.[j]?.[0]))? 
          barColor : `transparent`, 
      };
    },
    insertRow(row, obj) {
      let index = this.rows.indexOf(row) + 1;
      this.rows.splice(index, 0, obj);
      this.rowsMeta.splice(index, 0, { row: obj, fold: false});
      this.recalculateRowsStructure();
    },
    removeRow(row) {
      let index = this.rows.indexOf(row);
      this.rows.splice(index, 1);
      this.rowsMeta.splice(index, 1);
      this.recalculateRowsStructure();
    },
    createRow(id, subject) {
      return ({ id: id, subject: subject, });
    },
    siblings(row, cur = []) {
      cur.push(row);
      let node = this.rowsStructure.ptr[row.id];
      if(!node) return cur;

      if(node.hasChildren) {
        Object.keys(node.children).forEach(k => {
          let cnode = node.children[k];
          cur.push(cnode.row);
          if(cnode.hasChildren) {
            this.siblings(cnode.row, cur);
          }
        });
      }
      return cur;
    },
    changeRowId(row, newId) {
      let oldId = row.id;

      let sibs = this.siblings(row);

      if(newId === "") {
        row.id = "";
        return;
      }

      let existing = this.rows.filter(r => r.id === newId);
      if(existing.length > 0) {
        row.id = "@@tmp@@";
        row.id = oldId;
        return;
      }

      sibs.forEach(s => {

        let oid = s.id;
        let nid = oid.replace(oldId, newId);

        // console.log(oid, nid);

        s.id = nid;
        if(oldId !== "") {
          this.costPls.forEach(p => {
            if(p.taskId === oid) {
              p.taskId = nid;
            }
          });
          this.costAcs.forEach(a => {
            if(a.taskId === oid) {
              a.taskId = nid;
            }
          });
          this.costEvs.forEach(e => {
            if(e.taskId === oid) {
              e.taskId = nid;
            }
          });
        }


      });



      // console.log("id changed");
      // console.log("rowsStructure current", oldStructure);
      // let node = oldStructure.ptr[oldId];
      // console.log("current node", node);
      // if(node?.hasChildren) {
      //   let keys = Object.keys(node.children);
      //   keys.forEach(k => {
      //     let cnode = oldStructure.ptr[k];
      //     // this.changeRowId(cnode.row, cnode.row.id.replace(oldId, newId));
      //     console.log(cnode.row.id, cnode.row.id.replace(oldId, newId));
      //   });
      // }


      this.recalculateRowsStructure();
    },
    editCell(row,col,n) {
      this.focusRow = row;
      this.focusCol = col;

      this.$nextTick(() => {
        let el = null;
        if(n === 0) {
          el = this.$refs.cell0[0];
        } else if(n === 1) {
          el = this.$refs.cell1[0];
        } else if(n === 2) {
          el = this.$refs.cell2[0];
        }

        el.focus();
        el.select();
      });
    },
    isHoliday(date) {
      let d = date.getDay();
      return d === 0 || d === 6;
    },
    styleDate(j) {
      let d = this.calendar[j].date;
      return {
        backgroundColor: (this.isHoliday(d))? `rgba(100,100,100,0.1)` : `transparent`,
        width:`${this.cellWidth}em`,
        flexDirection:`column`, 
        position:`absolute`, 
        left:`${(j * this.cellWidth)}em`,
      }
    },
    isTotalRow(i) {
      return i === (this.rowsDisplay.length - 1);
    },
    moveRow(direction, r1, r2, k) {
      // if(direction > 0 && i === this.rows.length) return;
      // if(direction < 0 && i === 0) return;

      // let rowMove = this.rows[i];
      // let rowSwap = this.rows[i + direction];
      // this.rows.splice(i + direction, 1, rowMove);
      // this.rows.splice(i, 1, rowSwap);
      // this.$nextTick(() => {
      //   this.editRow(i + direction, k);
      // });

      if(!r1) return;
      if(!r2) return;

      // total row
      if(r1.id === "@") return;
      if(r2.id === "@") return;

      let ri1 = this.rows.indexOf(r1);
      let ri2 = this.rows.indexOf(r2);

      if(ri1 < ri2) {
        let inSibling = this.siblings(r1).map(s => s.id).indexOf(r2.id) > 0;
        if(inSibling) return;
      }

      this.rows.splice(ri1, 1, r2);
      this.rows.splice(ri2, 1, r1);

      this.recalculateRowsStructure();

      this.$nextTick(() => {
        let idx;
        for(let j = 0; j < this.rowsDisplay.length; j++) {
          if(this.rowsDisplay[j][0] == r1) {
            idx = j;
            break;
          }
        }
        this.editRow(idx, k);
      });

    },
    editRow(i, k) {
      // let el;
      // let targetIndex = i - this.viewWindowRow[0] - this.invisibleRowsRange(this.viewWindowRow[0], i) + 1;
      // if(k === 0) {
      //   el = this.$refs.inputId[targetIndex];
      // } else if(k === 1) {
      //   el = this.$refs.inputSubject[targetIndex];
      // }
      // if(el) {
      //   el.focus();
      //   el.select();
      // }

      let el;
      if(k === 0) {
        el = this.$refs[`inputId-${i}`][0];
      } else if(k === 1) {
        el = this.$refs[`inputSubject-${i}`][0];
      } else if(k === 2) {
        el = this.$refs[`inputAssignee-${i}`][0];
      }
      el.focus();
      el.select();
    },
    // fold(idx) {
    //   let root = this.rows[idx];
    //   this.rowsMeta[idx].fold = true;
    //   for(let i = idx + 1; i < this.rows.length; i++) {
    //     let row = this.rows[i];
    //     if(row.id.startsWith(root.id + "/")/* || row.id === ""*/) {
    //       this.rowsMeta[i].hide = true;
    //     } else {
    //       break;
    //     }
    //   }
    // },
    // unfold(idx) {
    //   let root = this.rows[idx];
    //   this.rowsMeta[idx].fold = false;
    //   for(let i = idx + 1; i < this.rows.length; i++) {
    //     let row = this.rows[i];
    //     if(row.id.replace(root.id + "/", "").indexOf("/") < 0) {
    //       this.rowsMeta[i].hide = false;
    //     } else {
    //       break;
    //     }
    //   }
    // },
    toggleFold(id, setHideTo, root = true) {
      let node = this.rowsStructure.ptr[id];

      if(root) {
        node.meta.fold = !node.meta.fold;
      }
    },
    forceUpdateRowsStructure() {
      this.rowsStructureVersion++;
    },
    branchVisible(id) {
      if(id === "") { return true; }

      let par = this.rowsStructure.ptr[id]?.parent;

      if(!par) return true;

      if(par.meta.fold) {
        return false;
      } else {
        if(!par.parent) {
          return true;
        }
      }
      return this.branchVisible(par.row.id);
    },
    isRowInViewWindow(row, i) {
      return (this.viewWindowRow[0] <= i && i <= (this.viewWindowRow[1]))
        || (this.isTotalRow(i));
    },
    invisibleRowsRange(sidx, eidx) {
      let rows = 0;
      for(let i = sidx; i < eidx; i++) {
        if(this.rows[i] === undefined) continue;
        if(this.rows[i].id === "") continue;

        let node = this.rowsStructure.ptr[this.rows[i].id];
        // if(node.parent.meta.fold) {
        if(!this.branchVisible(node.row.id)) {
          rows++;
        }
      }
      return rows;
    },
    vacuum() {
      let ids = {};
      this.rows.forEach(r => {
        if(r.id === "") return;
        ids[r.id] = r.id;
      });
      this.costPls = this.costPls.filter(p => ids[p.taskId]);
      this.costAcs = this.costAcs.filter(p => ids[p.taskId]);
      this.costEvs = this.costEvs.filter(p => ids[p.taskId]);

      let dupPl = {};
      this.costPls = this.costPls.filter(p => {
        if(dupPl?.[p.taskId]?.[p.date]) { return false; }

        if(dupPl[p.taskId] === undefined) dupPl[p.taskId] = {};
        if(dupPl[p.taskId][p.date] === undefined) dupPl[p.taskId][p.date] = true;

        return true;
      });

      let dupAc = {};
      this.costAcs = this.costAcs.filter(p => {
        if(dupAc?.[p.taskId]?.[p.date]) { return false; }

        if(dupAc[p.taskId] === undefined) dupAc[p.taskId] = {};
        if(dupAc[p.taskId][p.date] === undefined) dupAc[p.taskId][p.date] = true;

        return true;
      });

      let dupEv = {};
      this.costEvs = this.costEvs.filter(p => {
        if(dupEv?.[p.taskId]?.[p.date]) { return false; }

        if(dupEv[p.taskId] === undefined) dupEv[p.taskId] = {};
        if(dupEv[p.taskId][p.date] === undefined) dupEv[p.taskId][p.date] = true;

        return true;
      });
    },
    recalculateRowsStructure() {
      let sd = new Date();
      let root = { row: null, meta: { row: null, fold: false }, 
        children: {}, parent: null, 
        hasChildren: true
      };
      let tree = root.children;
      let ptr = {};
      this.rows.forEach((r,i) => {
        let path = r.id.split("/");
        let cur = tree;
        let bef = [];
        path.forEach((p, j) => {
          if(p === "") return;
          if(cur[p] === undefined) {
            let node = { row: r, meta: this.rowsMeta[i], children: {}, 
              parent: (bef.length === 0)? root : ptr[bef.join("/")], 
              hasChildren: false};
            cur[p] = node;
            ptr[r.id] = node;
          }

          if(j > 0) {
            ptr[bef.join("/")].hasChildren = true;
          }

          bef.push(p);

          cur = cur[p].children;
        });
      });
      let rs = {
        tree: tree,
        ptr: ptr,
      };

      let ed = new Date();

      console.log("rowsStructure", ed - sd);

      this.rowsStructure = rs;
    },
  },
  mounted() {
    // this.recalculateCostPlanMap();
    this.recalcurateViewWindow();
    this.vacuum();
    this.recalculateRowsStructure();
  }
}

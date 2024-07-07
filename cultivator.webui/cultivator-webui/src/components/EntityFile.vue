<script>
const endpoint = import.meta.env.VITE_API_ENDPOINT;

export default {
  components: {
  },
  props: {
    ifile: Object,
  },
  emits: [
    "on-click",
    "on-updated",
    "on-pinned",
    "on-deleted",
    "on-copy",
    "on-cut",
    "on-paste",
  ],
  data() {
    return {
      oid: this.ifile.oid,
      x: this.ifile.x,
      y: this.ifile.y,
      w: this.ifile.w,
      h: this.ifile.h,
      path: this.ifile.path,
      subject: this.ifile.subject,
      dragstate: null,
      entries: [],
      expanded: this.ifile.expanded,
      selection: [],
      contextMenu: {
        show: false,
        path: "",
        items: [],
        x: 0,
        y: 0,
        w: 300,
        h: 200,
        timeoutClose: null
      },
      intervalRefresh: null,
    }
  },
  watch: { },
  computed: {
    titleStyle() {
      let f = this;
      let height = 24;
      return {
        display: "inline-block",
        boxSizing: "border-box",
        // borderRadius: "6px 6px 0px 0px",
        textAlign: "left",
        position: "absolute",
        left: `${f.x}px`,
        top: `${f.y - height}px`,
        width: `${f.w}px`,
        height: `${height}px`,
        lineHeight: `${height}px`,
        cursor: "default",
        userSelect: "none",
        backgroundColor: "#000",
        border: "solid 1px #aaa",
        color: "#fff",
        borderBottom: "none",
      };
    },
    toolbarStyle() {
      let f = this;
      let height = 24;
      return {
        display: "inline-block",
        boxSizing: "border-box",
        textAlign: "left",
        position: "absolute",
        left: `${f.x}px`,
        top: `${f.y - height}px`,
        width: `${f.w}px`,
        height: `${height}px`,
        lineHeight: `${height}px`,
        cursor: "default",
        userSelect: "none",
        backgroundColor: "#ccc",
        border: "solid 1px #000",
        color: "#fff",
        borderBottom: "none",
      };
    },
    baseStyle() {
      let f = this;
      return {
        display: "inline-block",
        // borderRadius: "0px 0px 6px 6px",
        boxSizing: "border-box",
        textAlign: `${(f.expanded)? "left" : "center"}`,
        position: "absolute",
        border: "solid 1px #aaa",
        left: `${f.x}px`,
        top: `${f.y}px`,
        width: `${f.w}px`,
        height: `${f.h}px`,
        lineHeight: `${(f.expanded)? 24 : f.h}px`,
        cursor: "default",
        userSelect: "none",
        overflow: (f.expanded)? "auto" : "hidden",
        backgroundColor: "#000",
        padding: (f.expanded)? "3px" : "0px",
        color: "#fff",
      };
    },
    resizeHandleStyle() {
      let f = this;
      return {
        display: "inline-block",
        textAlign: "center",
        position: "absolute",
        border: "solid 1px #aaa",
        left: `${f.x + f.w - 5}px`,
        top: `${f.y + f.h - 5}px`,
        width: `${10}px`,
        height: `${10}px`,
        lineHeight: `${f.h}px`,
        cursor: "nwse-resize",
        userSelect: "none",
        opacity: 0.0,
      };
    },
    contextMenuStyle() {
      let f = this.contextMenu;
      return {
        display: "inline-block",
        textAlign: `left`,
        position: "absolute",
        border: "solid 1px #aaa",
        left: `${f.x}px`,
        top: `${f.y}px`,
        minWidth: `300px`,
        maxWidth: `500px`,
        width: `auto`,
        minHeight: `0px`,
        maxHeight: `300px`,
        height: `auto`,
        lineHeight: `24px`,
        cursor: "default",
        userSelect: "none",
        overflow: "auto",
        backgroundColor: "#000",
        color: "#fff",
        zIndex: 999,
        padding: "3px",
      };
    },
  },
  methods: {
    msg(text) {
      console.log(text);
    },
    openInShell(path) {
      let obj = { path: path };
      fetch(`${endpoint}/filesystem/api/open-in-shell`, { 
          method: "POST",
          body: JSON.stringify(obj), 
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
        })
        .then(r => r.json())
        .then(json => { });
    },
    dblclick() {
      this.openInShell(this.path);
    },
    dragstart(event) {
      let x = event.clientX;
      let y = event.clientY;
      this.dragState = { x: x, y: y };
    },
    dragend(event, fn) {
      let x = event.clientX;
      let y = event.clientY;
      let dx = x - this.dragState.x;
      let dy = y - this.dragState.y;
      this.dragState = null;
      fn(dx, dy);
    },
    dragged(dx,dy) {
      this.x += dx;
      this.y += dy;
      let gridSize = 10;
      this.x = Math.round(this.x / gridSize) * gridSize;
      this.y = Math.round(this.y / gridSize) * gridSize;
      this.updated();
    },
    resized(dw,dh) {
      this.w += dw;
      this.h += dh;
      let gridSize = 10;
      this.w = Math.round(this.w / gridSize) * gridSize;
      this.h = Math.round(this.h / gridSize) * gridSize;
      this.updated();
    },
    getFile() {
      return {
        oid: this.oid,
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        path: this.path,
        subject: this.subject,
        expanded: this.expanded,
      };
    },
    updated() {
      this.$emit("on-updated", this, this.getFile());
    },
    fetchEntries(path) {
      return fetch(endpoint + "/filesystem/api/entries", 
          { method: "POST", body: JSON.stringify({ path: path }), 
            headers: {
              'Accept': 'application/json', 
              'Content-Type': 'application/json'} });
    },
    setAutoRefresh() {
      if(this.expanded) {
        this.intervalRefresh = setInterval(() => {
          this.populateEntries(this.path);
        }, 1000 * 60);
      } else {
        clearInterval(this.intervalRefresh);
      }
    },
    setExpanded(expanded) {
      this.expanded = expanded;
      this.populateEntries(this.path);
      this.updated();
      this.setAutoRefresh();
    },
    formatEntry(entry) {
      return entry.path.replace("\\","") + ((entry.isDirectory)? "/" : "");
    },
    populateEntries(path) {
      if(this.expanded) {
        this.fetchEntries(path).then(r => r.json())
          .then(json => {
            this.entries = json;
          });
      }
    },
    openContextMenu(event, path, forceSetPath = false) {
      let c = this.contextMenu;
      if(!c.show) {
        c.show = true;
        c.x = event.pageX - 10;
        c.y = event.pageY - 10;
        c.path = this.path;
      } else {
        c.path = path;
      }

      if(forceSetPath) {
        c.path = path;
      }

      this.fetchEntries(c.path).then(r => r.json())
        .then(json => {
          c.items = json;
        });
    },
    contextMenuDrillDown(event, entry) {
      if(!entry.isDirectory) return;
      let c = this.contextMenu;
      this.openContextMenu(event, c.path + entry.path);
    },
    parentPath(path) {
      let ps = path.split("\\");
      return ps.slice(0, ps.length - 1).join("\\");
    },
    setTimeoutClose() {
      let c = this.contextMenu;
      c.timeoutClose = setTimeout(() => {
        c.show = false;
      }, 100);
    },
    contextMenuItemStyle(entry) {
      return {
      };
    },
    clicked() {
      this.$emit("on-click", this, this.getFile());
    },
    pin(path) {
      this.$emit("on-pinned", this, path);
    },
    deleted() {
      this.$emit("on-deleted", this, this.getFile());
    },
    closeContextMenu() {
      this.contextMenu.show = false;
    },
    selectEntry(entry,add = false) {
      console.log(entry);
      if(add) {
        if(this.selection.indexOf(entry.absPath) < 0) {
          this.selection.push(entry.absPath);
        } else {
          this.selection = this.selection.filter(e => e !== entry.absPath);
        }
      } else {
        this.selection = [entry.absPath];
      }
      console.log(this.selection);
    },
    onCopy(path) {
      if(this.selection.length === 0) return;
      this.$emit("on-copy", this, path);
    },
    onCut(path) {
      if(this.selection.length === 0) return;
      this.$emit("on-cut", this, path);
    },
    onPaste(path) {
      if(this.selection.length === 0) return;
      this.$emit("on-paste", this, path);
    },
    refresh() {
      this.populateEntries(this.path);
    },
    // copyEntry(path) {
    //   return fetch(endpoint + "/filesystem/api/entries", 
    //       { method: "POST", body: JSON.stringify({ path: path }), 
    //         headers: {
    //           'Accept': 'application/json', 
    //           'Content-Type': 'application/json'} });
    // },
  },
  mounted() {
    this.populateEntries(this.path);
    this.setAutoRefresh();
  }
}
</script>

<template>
  <div :style="titleStyle" v-show="expanded"
    draggable="true"
    @dragstart="dragstart($event)"
    @dragend="dragend($event, dragged)"
    @click.ctrl.left="setExpanded(!expanded)"
    >
    <span style="position:absolute; display:inline-block; left:0.5em">
      {{ subject }}
    </span>
    <span class="toolbar-container" style="position:absolute; display:inline-block; right:0.5em;">
      <span class="toolbar-button" @click.stop="refresh">@</span>
      <span class="toolbar-button" @click.stop="">|</span>
      <span class="toolbar-button" @click.stop="">up</span>
      <span class="toolbar-button" @click.stop="">|</span>
      <span class="toolbar-button" @click.stop="onCopy(selection)">cp</span>
      <span class="toolbar-button" @click.stop="onCut(selection)">cu</span>
      <span class="toolbar-button" @click.stop="onPaste(selection)">ps</span>
      <span class="toolbar-button" @click.stop="">|</span>
      <span class="toolbar-button" @click.stop="deleted">X</span>
    </span>
  </div>


  <div class="file" :style="baseStyle" 
    draggable="true"
    @click="clicked()"
    @click.ctrl.left="setExpanded(!expanded)"
    @dblclick.stop="dblclick()"
    @click.right.stop.prevent="openContextMenu($event, path)"

    @dragstart="dragstart($event)"
    @dragend="dragend($event, dragged)"
    >

    <span v-show="!expanded">{{ subject }}</span>

    <div class="item"
      @dblclick.stop="openInShell(path)"
      @click.left.exact.stop.prevent="selectEntry({absPath:path})"
      @click.left.ctrl.stop.prevent="selectEntry({absPath:path},true)"
      :style="{
        backgroundColor: (selection.indexOf(path) >= 0)? '#333' : 'transparent',
      }"
      v-if="expanded"
      >.</div>

    <template v-for="entry in entries">
      <div 
        class="item"
        v-show="expanded"
        @click.left.exact.stop.prevent="selectEntry(entry)"
        @click.left.ctrl.stop.prevent="selectEntry(entry,true)"
        @dblclick.stop="openInShell(path + entry.path)"
        @click.right.stop.prevent="openContextMenu($event, path + entry.path, true)"
        :style="{
          backgroundColor: (selection.indexOf(entry.absPath) >= 0)? '#333' : 'transparent',
        }"
        >
        {{ formatEntry(entry) }}
      </div>
    </template>
  </div>

  <div :style="resizeHandleStyle"
    draggable="true"
    @dragstart="dragstart($event)"
    @dragend="dragend($event, resized)">
  </div>

  <div v-if="contextMenu.show"
    :style="contextMenuStyle"
    @mouseleave="setTimeoutClose()">

    <div>
      <span class="button"
        @click.stop="pin(contextMenu.path); closeContextMenu()" >
        PIN
      </span>
    </div>

    <div class="item"
      @click.right.stop.prevent="openContextMenu($event, parentPath(contextMenu.path))"
      @dblclick.stop="openInShell(parentPath(contextMenu.path)); closeContextMenu()"
      >..</div>

    <div class="item"
      @click.right.stop.prevent=""
      @dblclick.stop="openInShell(contextMenu.path); closeContextMenu()"
      >.</div>

    <div class="item" v-for="item in contextMenu.items"
      @click.right.stop.prevent="contextMenuDrillDown($event, item)"
      @dblclick.stop="openInShell(contextMenu.path + item.path); closeContextMenu()">
      {{ formatEntry(item) }}
    </div>
  </div>
</template>

<style scoped>
  .file {
    scrollbar-color: #888 #333;
    scrollbar-width: thin;
  }

  .item {
    white-space: pre;
    padding-left: 16px;
  }

  .item:hover {
    background-color: #555 !important;
  }

  .button {
    display: inline-block;
    min-width: 64px;
    width: auto;
    height: 24px;
    text-align: center;
    border: solid 1px #aaa;
    margin-right: 3px;
  }

  .button:hover {
    background-color: #333 !important;
  }

  .toolbar-button {
    cursor: pointer;
  }

  .toolbar-button:hover {
    background-color: #333 !important;
  }

  .toolbar-container .toolbar-button{
    margin-left: 5px;
  }
</style>

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
      contextMenu: {
        show: false,
        path: "",
        items: [],
        x: 0,
        y: 0,
        w: 300,
        h: 200,
        timeoutClose: null
      }
    }
  },
  watch: { },
  computed: {
    titleStyle() {
      let f = this;
      let height = 24;
      return {
        display: "inline-block",
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
      };
    },
    baseStyle() {
      let f = this;
      return {
        display: "inline-block",
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
        overflow: "auto",
        backgroundColor: "#ccc",
        padding: "3px",
      };
    },
    resizeHandleStyle() {
      let f = this;
      return {
        display: "inline-block",
        textAlign: "center",
        position: "absolute",
        border: "solid 1px #aaa",
        left: `${f.x + f.w}px`,
        top: `${f.y + f.h}px`,
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
        maxHeight: `500px`,
        height: `auto`,
        lineHeight: `24px`,
        cursor: "default",
        userSelect: "none",
        overflow: "auto",
        backgroundColor: "#ccc",
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
    setExpanded(expanded) {
      this.expanded = expanded;
      this.populateEntries(this.path);
      this.updated();
    },
    formatEntry(entry) {
      return ((entry.isDirectory)? "/" : "") + entry.path.replace("\\","");
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
    closeContextMenu() {
      this.contextMenu.show = false;
    }
  },
  mounted() {
    this.populateEntries(this.path);
  }
}
</script>

<template>
  <div :style="titleStyle" v-show="expanded">
    {{ subject }}
  </div>

  <div class="file" :style="baseStyle" 
    draggable="true"
    @click="clicked()"
    @click.ctrl.left="setExpanded(!expanded)"
    @dblclick="dblclick()"
    @dragstart="dragstart($event)"
    @dragend="dragend($event, dragged)"
    @click.right.stop.prevent="openContextMenu($event, path)">

    <span v-show="!expanded">{{ subject }}</span>

    <div class="item"
      @dblclick.stop="openInShell(path)"
      v-if="expanded"
      >.</div>

    <template v-for="entry in entries">
      <div 
        class="item"
        v-show="expanded"
        @dblclick.stop="openInShell(path + entry.path)"
        @click.right.stop.prevent="openContextMenu($event, path + entry.path, true)"
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
    scrollbar-color: #aaa #ddd;
    scrollbar-width: thin;
  }

  .item {
    white-space: pre;
  }

  .item:hover {
    background-color: #ddd !important;
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
    background-color: #ddd !important;
  }
</style>

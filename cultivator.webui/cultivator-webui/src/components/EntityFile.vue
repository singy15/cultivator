<script>
const endpoint = import.meta.env.VITE_API_ENDPOINT;

export default {
  components: {
  },
  props: {
    ifile: Object,
  },
  data() {
    return {
    x: this.ifile.x,
    y: this.ifile.y,
    w: this.ifile.w,
    h: this.ifile.h,
    path: this.ifile.path,
    subject: this.ifile.subject,
    dragstate: null,
    }
  },
  watch: { },
  methods: {
    msg(text) {
      console.log(text);
    },
    baseStyle() {
      let f = this;
      return {
        display: "inline-block",
        textAlign: "center",
        position: "absolute",
        border: "solid 1px #aaa",
        left: `${f.x}px`,
        top: `${f.y}px`,
        width: `${f.w}px`,
        height: `${f.h}px`,
        lineHeight: `${f.h}px`,
        cursor: "default",
        userSelect: "none",
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
      };
    },
    openInShell(path) {
      let obj = { path: path };
      fetch(`${endpoint}/filesystem/api/open-in-shell`, { 
          method: "POST",
          body: JSON.stringify(obj), 
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
        })
        .then(r => r.json())
        .then(console.log);
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
    },
    resized(dw,dh) {
      this.w += dw;
      this.h += dh;
    },
  },
  mounted() {
  }
}
</script>

<template>
  <div :style="baseStyle()" 
    draggable="true"
    @dblclick="dblclick()"
    @dragstart="dragstart($event)"
    @dragend="dragend($event, dragged)">
    {{ subject }}
  </div>
  <div :style="resizeHandleStyle()"
    draggable="true"
    @dragstart="dragstart($event)"
    @dragend="dragend($event, resized)">
  </div>
</template>

<style scoped>
</style>

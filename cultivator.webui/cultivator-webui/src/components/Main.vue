<script>
import EntityFile from './EntityFile.vue';

const endpoint = import.meta.env.VITE_API_ENDPOINT;
let storageBaseKey = "cultivator";

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

export default {
  components: {
    EntityFile: EntityFile,
  },
  data() {
    return {
      files: getStorage("files", [
        { oid: uuid4(), x: 100, y: 100, w: 350, h: 200, path: "c:\\root\\wk", subject: "wk", expanded: true, },
        { oid: uuid4(), x: 100, y: 350, w: 150, h: 100, path: "c:\\root\\wk\\main.lisp", subject: "main.lisp", expanded: false, },
      ]),
      selectedOid: null,
      fileop: {
        eventSrc: null,
        eventDst: null,
        mode: null,
        src: null,
        dst: null,
      }
    }
  },
  watch: { },
  methods: {
    msg(text) {
      console.log(text);
    },
    onUpedateFile(comp, file) {
      let f = this.files.filter(f => f.oid === file.oid)[0];
      f.x = file.x;
      f.y = file.y;
      f.w = file.w;
      f.h = file.h;
      f.path = file.path;
      f.subject = file.subject;
      f.expanded = file.expanded;

      this.saveStorage();
    },
    saveStorage() {
      setStorage("files", this.files);
    },
    createFile(subject, path) {
      return { 
        oid: uuid4(), 
        x: 100, y: 100, 
        w: 300, h: 200, 
        path: path,
        subject: subject, 
        expanded: true, 
      };
    },
    addFile() {
      let path = prompt("path");
      if(!path) return;
      let subject = prompt("subject");
      if(!subject) return;
      let file = this.createFile(subject, path);
      this.files.push(file);
      this.saveStorage();
    },
    delFile() {
      let file = this.files.filter(f => f.oid === this.selectedOid)[0];

      if(!confirm(`Are you sure to delete "${file.subject}" ?`)) return;

      this.files = this.files.filter(f => f.oid !== this.selectedOid);
      this.saveStorage();
    },
    selectObject(oid) {
      this.selectedOid = oid;
    },
    objectClicked(comp, data) {
      this.selectedOid = data.oid;
    },
    onFilePinned(comp, path) {
      let name = path.split("\\");
      let subject = prompt("subject") ?? name[name.length - 1];
      let file = this.createFile(subject, path);
      this.files.push(file);
      this.saveStorage();
    },
    onFileDeleted(comp, file) {
      let target = this.files.filter(f => f.oid === file.oid)[0];

      if(!confirm(`Are you sure to delete "${target.subject}" ?`)) return;

      this.files = this.files.filter(f => f.oid !== target.oid);
      this.saveStorage();
    },
    onCopy(comp,path) {
      this.fileop.eventSrc = comp;
      this.fileop.mode = "copy";
      this.fileop.src = path[0];
      console.log("copied", path, this.fileop);
    },
    onCut(comp,path) {
      this.fileop.eventSrc = comp;
      this.fileop.mode = "cut";
      this.fileop.src = path[0];
      console.log("cut", path, this.fileop);
    },
    onPaste(comp,path) {
      console.log(comp,path);
      this.fileop.dst = path[0];
      this.fileop.eventDst = comp;
      if(!(this.fileop.src)) return;

      console.log("paste", path, this.fileop);
      
      let op = null;
      if(this.fileop.mode === "copy") {
        op = fetch(`${endpoint}/filesystem/api/copy`, 
          { method: "POST", body: JSON.stringify({ 
              pathSrc: this.fileop.src, pathDst: this.fileop.dst }),
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'} });
      } else if(this.fileop.mode === "cut") {
        op = fetch(`${endpoint}/filesystem/api/move`, 
          { method: "POST", body: JSON.stringify({ 
              pathSrc: this.fileop.src, pathDst: this.fileop.dst }),
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'} });
      }

      op.then(r => r.json()).then(data => {
        console.log(data);
        this.fileop.eventSrc.refresh();
        this.fileop.eventDst.refresh();
      })
    },
  },
  mounted() {
    document.body.addEventListener("dblclick", () => {
      this.addFile();
    });
  }
}
</script>

<template>
  <div style="position:relative;" @dblclick.stop="addFile">
    <template v-for="file in files" :key="file.oid">
      <EntityFile :ifile="file" 
        @on-updated="onUpedateFile" 
        @on-click="objectClicked"
        @on-pinned="onFilePinned"
        @on-deleted="onFileDeleted"
        @on-copy="onCopy"
        @on-cut="onCut"
        @on-paste="onPaste"
        ></EntityFile>
    </template>
  </div>

  <!--
  <div style="position:fixed; left:30px; bottom:50px; 
    width:100px; height:32px; outline:solid 1px #aaa; 
    background-color:#ccc; text-align:center; line-height:32px;
    cursor:pointer;"
    @click="addFile">
    ADD FILE
  </div>

  <div style="position:fixed; left:150px; bottom:50px; 
    width:100px; height:32px; border:solid 1px #aaa; 
    background-color:#ccc; text-align:center; line-height:32px;
    cursor:pointer;" 
    @click="delFile">
    DEL FILE
  </div>
  -->
</template>

<style scoped>
</style>

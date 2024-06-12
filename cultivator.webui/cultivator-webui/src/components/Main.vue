<script>
import EntityFile from './EntityFile.vue';

// import Layout from './Layout.vue';
// import Editor from './Editor.vue';
// import Database from '../Database.js';
// import sessionRepository from '../sessionRepository.js';
// import xhr from '../xhrutil.js';
// 
// const endpoint = import.meta.env.VITE_API_ENDPOINT;
// 
// const extensionRepository = {};
// 
// let implementClient = (window) => {
//   window.connect = function(source, opt = {}) {
//     let res = xhr.requestSync(`${endpoint}/Database/session/connect`, 'POST', { Source: source });
//     let db = new Database(res.SessionId);
//     let sessionId = res.SessionId;
// 
//     sessionRepository.registerSession(res.SessionId, db);
// 
//     return db;
//   };
// 
//   window.$connect = async function(source, opt = {}) {
//     console.log(source);
//     let fet = await xhr.requestAsync(`${endpoint}/Database/session/connect`, 'POST', { Source: source });
//     let res = JSON.parse(await fet.json());
//     let db = new Database(res.SessionId);
//     let sessionId = res.SessionId;
// 
//     sessionRepository.registerSession(res.SessionId, db);
// 
//     return db;
//   };
// };
// 
// 
// let exampleCode = `// Write JavaScript code here.
// // Select code and press Ctrl+Enter to evaluate.
// 
// function example1() {
//   return querySync(\`select * from sampletable\`);
// }
// 
// function example2(name) {
//   console.log("hello, " + name);
// }
// 
// // Press "Reset" to reset current context.
// `;
// 
// let storageKeyCode = "/dbcrowbar/code";
// 
// function storageExists(key) {
//   let val = localStorage.getItem(key);
//   return val != null;
// }

export default {
  components: {
    EntityFile: EntityFile,
    // Layout: Layout,
    // Editor: Editor,
  },
  data() {
    return {
      file1: {
        x: 100,
        y: 100,
        w: 64,
        h: 64,
        path: "c:\\root\\wk\\main.lisp",
        subject: "main.lisp",
      }
      // src: (storageExists(storageKeyCode))? localStorage.getItem(storageKeyCode) : exampleCode,
      // logEntries: [],
      // timeoutSaveLocalStorage: null,
      // watches: {}
    }
  },
  watch: { },
  methods: {
    msg(text) {
      console.log(text);
    },
    // saveCodeToLocalStorage(code) {
    //   if(this.timeoutSaveLocalStorage) {
    //     clearTimeout(this.timeoutSaveLocalStorage);
    //   }

    //   this.timeoutSaveLocalStorage = setTimeout(() => {
    //     let c = code;
    //     localStorage.setItem(storageKeyCode, c);
    //     this.timeoutSaveLocalStorage = null;
    //   }, 1000);
    // },
    // writeLog(msg, prefix = "") {
    //   let isObject = (value) => {
    //     return value !== null && typeof value === 'object'
    //   };

    //   this.logEntries.push(
    //     `<span>${prefix + ((isObject(msg))? JSON.stringify(msg) : msg)}</span>`);

    //   this.$nextTick(() => { this.$refs.out.scrollIntoView({ block: "end", inline: "nearest" }); });
    // },
    // writeError(msg, prefix = "") {
    //   let isObject = (value) => {
    //     return value !== null && typeof value === 'object'
    //   };

    //   this.logEntries.push(
    //     `<span style="color:#F00;">${prefix + ((isObject(msg))? JSON.stringify(msg) : msg)}</span>`);
    // },
    // registerWatch(val, key) {
    //   this.watches[key] = val;
    // },
    // resetJavaScriptContext() {
    //   let target = this.$refs.sandboxes.querySelector('iframe[name="default"]');
    //   if(target) {
    //     target.remove();
    //   }
    //   let iframe = document.createElement('iframe');
    //   iframe.name = "default";
    //   this.$refs.sandboxes.appendChild(iframe);

    //   implementClient(iframe.contentWindow);

    //   var self = this;
    //   iframe.contentWindow.consoleListener = function(arg) {
    //     self.writeLog(arg);
    //   };

    //   iframe.contentWindow.querySync = function(sql) {
    //     const request = new XMLHttpRequest();
    //     const param = (new URLSearchParams({query: sql})).toString();
    //     request.open("GET", `${endpoint}/Database?${param}`, false);
    //     request.send(null);
    //     
    //     if (request.status === 200) {
    //       return JSON.parse(request.responseText);
    //     } else {
    //       throw new Error("Error on execute query");
    //     }
    //   };

    //   iframe.contentWindow.addWatch = (val, key) => {
    //     if(key === "" || key == null || key === undefined) {
    //       throw new Error("key not specified!");
    //     }

    //     this.watches[key] = val;
    //   };

    //   iframe.contentWindow.removeWatch = (key) => {
    //     delete this.watches[key];
    //   };

    //   iframe.contentWindow.eval(`
    //     window.console.__log = console.log;
    //     window.console.log = function() { console.__log(...arguments); consoleListener(...arguments); }
    //     `);
    // },
    // evaluateJavaScript(text) {
    //   // const context = window; //{ ...window };
    //   // // const func = new Function(...Object.keys(context), `return (() => { ${text} })()`);
    //   // const func = new Function(...Object.keys(context), `${text}`);
    //   // // console.log(func(...Object.values(context)));
    //   // console.log(func.apply(window, ...Object.values(context)));

    //   // eval.apply(window, [text]);

    //   // const run = Function(text);
    //   // run();

    //   // const run = (code) => Function(`return (functions) => { ${code} }`)()(functions);
    //   // run();

    //   // const context = { bar : 123 };
    //   // const run = new Function(text);
    //   // run.apply(context, []);

    //   // let run = new Function(text);
    //   // run();


    // //<iframe ref="sandbox" style="display:none"></iframe>

    //   // this.$refs.sandboxes.contentWindow.eval(text);
    //   let context = this.$refs.sandboxes.querySelector('iframe[name="default"]');
    //   try {
    //     let result = context.contentWindow.eval(text);
    //     this.writeLog(result, "> ");
    //     console.log(result);
    //   } catch(err) {
    //     this.writeError(err.toString(), "ERROR: ");
    //     console.error(err);
    //   }
    // }
  },
  mounted() {
    // this.resetJavaScriptContext();
  }
}
</script>

<template>
  <div style="position:relative;">
    <EntityFile :ifile="file1"></EntityFile>
  </div>
</template>

<style scoped>
</style>

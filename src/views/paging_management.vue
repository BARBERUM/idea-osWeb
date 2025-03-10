<script setup>
import {ref} from 'vue';

// **内存块：最多分 4 个 Frame**
const selectedOperator = ref('+');
const pageNum = -1;
const offset = -1;
const defaultMemory = [0, 1, 2, 3];
const memory = ref(JSON.parse(JSON.stringify(defaultMemory)));

const result = ref([]);
// **页表：存储页号、Frame、修改位**
const defaultPageTable = [
  { page: 0, valid: 1, frame: 5, modified: 0, diskLoc: 10 },
  { page: 1, valid: 1, frame: 8, modified: 0, diskLoc: 12 },
  { page: 2, valid: 1, frame: 9, modified: 0, diskLoc: 13 },
  { page: 3, valid: 1, frame: 1, modified: 0, diskLoc: 21 },
  { page: 4, valid: 0, frame: null, modified: 0, diskLoc: 22 },
  { page: 5, valid: 0, frame: null, modified: 0, diskLoc: 23 },
  { page: 6, valid: 0, frame: null, modified: 0, diskLoc: 125 }
];

const pageTable = ref(JSON.parse(JSON.stringify(defaultPageTable)));
// **指令序列**
const defaultInstructionQueue = [
  { id:0, op: "+", page: 0, offset: 72 },
  { id:1, op: "/", page: 1, offset: 50 },
  { id:2, op: "*", page: 2, offset: 15 },
  { id:3, op: "save", page: 3, offset: 26 },
  { id:4, op: "load", page: 0, offset: 56 },
  { id:5, op: "-", page: 6, offset: 40 },
  { id:6, op: "+", page: 4, offset: 56 },
  { id:7, op: "-", page: 5, offset: 23 },
  { id:8, op: "save", page: 1, offset: 37 },
  { id:9, op: "+", page: 2, offset: 78 },
  { id:10, op: "-", page: 4, offset: 1 },
  { id:11, op: "save", page: 6, offset: 86 }
];
const instructionQueue = ref(JSON.parse(JSON.stringify(defaultInstructionQueue)));
let id = instructionQueue.value.length + 1;

function updateTable(page, action, frameNumber = null){
  pageTable.value.forEach(p=>{
    if(p.page === page){
      if(action === 'load'){
        p.valid = 1;
        p.frame = frameNumber;
      }else if (action === 'evict'){
        p.valid = 0;
        p.frame = null;
        if(p.modified === 1){
          console.log(`写回磁盘: 页${page}, 磁盘地址：${p.diskLoc}`);
          p.modified = 0;
        }
      }else if(action === 'write'){
        p.modified = 1;
      }
    }
  })
}
function getFreeFrame(){
  const emptySlot = memory.value.indexOf(null);
  return emptySlot===-1?null:emptySlot;
}
const allocateFrame = (page)=>{
  const freeFrame = getFreeFrame();

  if(freeFrame !== null){
    memory.value[freeFrame] = page;
    updateTable(page, "load", freeFrame);
    console.log(`页${page} 分配到内存块 ${freeFrame}`);
  }else{
    const removedPage = memory.value.shift();
    memory.value.push(page);
    const p = pageTable.value.find(p=>p.page === removedPage);
    const allocatedFrame = p.frame;
    updateTable(removedPage, "evict");
    updateTable(page, "load",allocatedFrame);
    console.log(`页面置换： 淘汰页${removedPage} -> 装载页：${page} 物理块号：${allocatedFrame}`);
    return removedPage;
  }
}
function getPhysicalAddress(id, page, offset){
  let entry = pageTable.value.find(p=>p.page ===page);
  let flag = 0;
  let removedPage = -1;
  if(!entry||entry.valid === 0){
    flag = 1;
    console.log(`缺页中断，页${page}不在内存`);
    removedPage = allocateFrame(page);
    entry = pageTable.value.find(p=>p.page ===page);
  }
  const physicalAddress = (entry.frame*1024)+offset;
  result.value.push({id:id, pa:physicalAddress, pageMiss:flag===0?'不缺页':removedPage===-1?'无需淘汰':`缺页,淘汰第${removedPage}页`});
  console.log(`逻辑地址:${page},偏移：${offset} -> 物理地址:${physicalAddress}`);
  return physicalAddress;
}

function executeNextInstruction(){
  if(instructionQueue.value.length === 0){
    console.log("指令序列执行完毕");
    return;
  }

  const{id, op, page, offset} = instructionQueue.value.shift();
  console.log(`执行指令：${op}, 页${page}, 页内偏移${offset}`);

  const physicalAddress = getPhysicalAddress(id, page, offset);

  if(physicalAddress !== null){
    console.log(`指令执行成功:${op} -> 物理地址 ${physicalAddress}`);
    if(op === 'save') updateTable(page, "write");
  }
}
function appendInstruction(selectedOperator, pageNum, offset){
  if(pageNum === -1 || pageNum > 6){
    alert("请输入正确的页号。");
    return;
  }
  if(offset === -1 || offset > 1024){
    alert("请输入正确的页内偏移。");
    return;
  }
  instructionQueue.value.push({id:id++, op:selectedOperator, page:pageNum, offset:offset});
}
function reset(){
  result.value = [];
  instructionQueue.value = JSON.parse(JSON.stringify(defaultInstructionQueue));
  memory.value = JSON.parse(JSON.stringify(defaultMemory));
  pageTable.value = JSON.parse(JSON.stringify(defaultPageTable));
  id = instructionQueue.value.length + 1;
}
</script>

<template>
  <main>
    <div class="table-area">
      <div class="pageTable-area">
        <h3>当前页表</h3>
        <div class="overflow">
          <table class="pageTable">
            <thead>
            <tr>
              <th>页号</th>
              <th>在内存</th>
              <th>物理块号</th>
              <th>修改位</th>
              <th>磁盘位置</th>
            </tr>
            </thead>
            <transition-group name="fade" tag="tbody">
              <tr v-for="(entry,index) in pageTable" :key="entry.page" :class="[index%2?'odd':'even']">
                <td>{{'#'+ entry.page }}</td>
                <td :class="[entry.valid?'valid':'invalid']">{{entry.valid?'是':'否'}}</td>
                <td>{{entry.valid?"#"+entry.frame:'-'}}</td>
                <td :class="[entry.modified?'modified':'unmodified']">{{entry.modified}}</td>
                <td>{{'#'+entry.diskLoc}}</td>
              </tr>

            </transition-group>
          </table>
        </div>

      </div>
      <div class="instructionTable-area">
        <h3>指令序列</h3>

        <div class="overflow">
          <table class="instructionTable">
            <thead>

            <tr>
              <th>序号</th>
              <th>操作</th>
              <th>页号</th>
              <th>页内偏移</th>
            </tr>
            </thead>
            <transition-group name="fade" tag="tbody">
              <tr v-for="(entry,index) in instructionQueue" :key="index" :class="[index%2?'odd':'even']">
                <td>{{'#'+[index+1]}}</td>
                <td>{{entry.op}}</td>
                <td>{{"#"+entry.page}}</td>
                <td>{{entry.offset}}</td>
              </tr>
            </transition-group>
          </table>
        </div>
      </div>
      <div class="resultTable-area">
        <h3>执行结果</h3>
        <div class="overflow">
          <table class="resultTale">
            <thead>
            <tr>
              <th>序号</th>
              <th>物理地址</th>
              <th>缺页情况</th>
            </tr>
            </thead>
            <transition-group name="fade" tag="tbody" >
              <tr v-for="entry in result" :key="entry.id" :class="[entry.id%2?'odd':'even']">
                <td>{{'#'+entry.id}}</td>
                <td>{{entry.pa}}</td>
                <td>{{entry.pageMiss}}</td>
              </tr>
            </transition-group>
          </table>

        </div>
      </div>
      <div class="memoryStack-area">
        <h3>
          页帧栈
        </h3>
          <transition-group name="stack" tag="table" class="memoryStack">
        <thea>
          <tr>
            <th>页号</th>
          </tr>
        </thea>
            <tr v-for="(entry,index) in memory" :key="index" :class="[index%2?'odd':'even']">
              <td>{{"#"+entry}}</td>
            </tr>
        </transition-group>
      </div>

    </div>
    <div class="input-area">
      <label for="operator">选择运算符</label>
      <select v-model="selectedOperator">
        <option>+</option>
        <option>-</option>
        <option>*</option>
        <option>/</option>
        <option>save</option>
        <option>load</option>
      </select>
      <label for="pageNum">输入页号</label>
      <input type="number" v-model="pageNum">
      <label for="offset" >输入页内偏移</label>
      <input type="number" v-model="offset">
      <button @click="appendInstruction(selectedOperator, pageNum, offset)">添加</button>
    </div>
    <div class="button-area2">
      <button @click="executeNextInstruction">单步执行指令序列</button>
      <button @click="reset">重置</button>
    </div>
  </main>
</template>

<style scoped>
.odd{
  background-color: white;
}
.even{
  background-color: #f4f4f4;
}
.valid{
  background-color: #67c23a; /* 绿色代表空闲 */
}
.invalid{
  background-color: #f56c6c; /* 红色 */
}
.modified{
  background-color: #b777a7;
}
.unmodified{
   background-color: #90cbfb;
 }
.pageTable,.instructionTable, .memoryStack, .resultTale{
  height: 30%;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
.pageTable th, .instructionTable th, .memoryStack th, .resultTale th{
  background-color: #8AB6D6;
  border-radius: 3px;
  padding: 10px;
  color: white;
}
.pageTable td,.instructionTable td, .memoryStack td, .resultTale td{
  border-radius: 3px;
  padding: 10px;
  font-size: 16px;
}
.pageTable-area, .instructionTable-area, .resultTable-area{
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 30%;
}
.memoryStack-area{
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: auto;
}
.overflow{
  display: flex;
  justify-content: center;
  height: 39vh;
  width: auto;
  overflow-y: auto;
}
.table-area{
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
}
h3{
  width: auto;
  border-radius: 5px;
  text-align: center;
}
.button-area input{
  width: 30%;
 }
.button-area2{
  flex-direction: row;
  display: flex;         /* 水平方向排列按钮 */
  justify-content: center; /* 按钮居中显示 */
  gap: 40px;            /* 按钮之间的间距，20px */
  margin-top: 20px;     /* 上边距 */
  align-items: center;
}

button {
  padding: 10px 20px;   /* 按钮内边距 */
  border: none;         /* 去除边框 */
  border-radius: 10px;   /* 圆角按钮 */
  cursor: pointer;      /* 鼠标悬停样式 */
  transition: all 0.3s ease; /* 平滑过渡动画 */
  font-size: 15px;
  color: white;
  background-color: #8AB6D6;
}
button:hover{
  transform: scale(1.1);  /* 悬停时微微放大 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); /* 添加阴影 */
}
.fade-move{
  transition: ease-in-out 1s;
}
.stack-enter-active{
  animation: slideIn 1s ease-in-out;
}

.stack-leave-active{
  animation: slideOut 1s, ease-in-out;
}
@keyframes slideIn {
  from{transform: translateY(20px); opacity: 0;}
  to{transform: translateY(0); opacity: 1;}
}
@keyframes slideOut {
  from{transform: translateY(0); opacity: 1;}
  to{transform: translateY(-20px); opacity: 0;}
}
.input-area{
  margin-top: 10px;
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
}
.input-area select{
  height:30px;
  border-radius: 5px;
}
.input-area input{
  height:30px;
  border-radius: 5px;
  text-align: center;
}
.input-area label{
  padding: 10px;
  margin-left: 10px;
}
</style>
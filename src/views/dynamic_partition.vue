
<script setup>
import { ref, computed} from 'vue';
let requests = ref([]);
let id = 0;
let block_id = 2;
function request(length){
  if(!length && length < 0){
    alert("请输入一个合法的长度。");
    return;
  }
  requests.value.push({id:id++, length:length, allocated:false, start:-1});
  console.log(requests);
}
function clear(){
  requests.value.forEach(request=>{
    Release(request.id);
  });
  requests.value = [];
  id = 0;
}
const defaultMemoryBlocks = [
  { name: '空闲', id: 1, size: 860, allocated: false ,start:10},
];
const memoryBlocks = ref(JSON.parse(JSON.stringify(defaultMemoryBlocks)));
const totalSize = computed(()=>{
  return memoryBlocks.value.reduce((sum,block)=>sum + block.size, 0);
});
const options = ['最先适应算法', '最佳适应算法', '最坏适应算法'];
function allocateSpace(){
  requests.value.forEach(request=>{
    if(request.allocated !== true) {
      let allocated = false;
      for(let block of memoryBlocks.value){
        if(!block.allocated && block.size >= request.length){
          request.allocated = true;
          request.start = block.start;
          block.id=block_id++;
          block.size -= request.length;
          block.start = request.start + request.length;
          console.log(`成功分配${request.length}KB,给请求ID：${request.id}于内存块：${block.start}`);
          memoryBlocks.value.push({name:`进程`, id:request.id, size:request.length, allocated:true, start:request.start})
          allocated = true;
          break;
        }
      }
      if(!allocated){
        alert(`请求ID 为${request.id}的 ${request.length}KB无法分配。`);
      }
    }
  })
}
function bestFit(){
  memoryBlocks.value.sort((a,b)=>a.size-b.size);
  allocateSpace();
  memoryBlocks.value.sort((a,b)=>a.size-b.size);
}
function firstFit(){
  memoryBlocks.value.sort((a,b)=>a.start-b.start);
  allocateSpace();
  memoryBlocks.value.sort((a,b)=>a.start-b.start);
}
function worstFit(){
  memoryBlocks.value.sort((a,b)=>b.size-a.size);
  allocateSpace();
  memoryBlocks.value.sort((a,b)=>b.size-a.size);

}
function getSelectedCheckBox() {
  const checkBox = document.getElementsByName("option");
  let index = -1;
  for(let i = 0; i < checkBox.length; i++){
    if(checkBox[i].checked == true){
      index = i;
      break;
    }
  }
  return index;
}
function allocate(){
  let index = getSelectedCheckBox();
  if(index==-1){
    alert("请选择一个适应算法。");
    return;
  }
  if(requests.value.length == 0){
    alert("当前尚无待申请内存空间的进程。");
    return;
  }
  console.log(index);
  if(index==0){
    firstFit();
  }else if(index == 1){
    bestFit();
  }else if(index == 2){
    worstFit();
  }
}
function Release(id){
  let req = requests.value.find(request=>request.id === id);
  memoryBlocks.value.sort((a,b)=>a.start-b.start);
  let s = req.start;
  let l = req.length;
  if(req.allocated === true){
    memoryBlocks.value.forEach(block=>{
      if(block.allocated === false && block.start+block.size===req.start){
        s = block.start;
        l+=block.size;
        memoryBlocks.value = memoryBlocks.value.filter(b=>b.start !== block.start);
        console.log("start:" + s);
      }
      if(block.allocated === false&&block.start === req.start + req.length){
        l += block.size;
        memoryBlocks.value = memoryBlocks.value.filter(b=>b.start !== block.start);
        console.log("length:" + l);
      }
    });
    console.log("start:" + s);
    console.log("length:" + l);
    memoryBlocks.value = memoryBlocks.value.filter(block=>block.start !== req.start);
    memoryBlocks.value.push({ name: '空闲', id: block_id++, size: l, allocated: false ,start:s})
    let index = getSelectedCheckBox();
    if(index === -1){
      memoryBlocks.value.sort((a,b)=>a.start-b.start);
    }else if(index===0){
      memoryBlocks.value.sort((a,b)=>a.start-b.start);
    }else if(index===1){
      memoryBlocks.value.sort((a,b)=>a.size-b.size);
    }else if(index===2){
      memoryBlocks.value.sort((a,b)=>b.size-a.size);
    }
  }
  requests.value = requests.value.filter(item=> item.id !== id);
}
function selected(v) {
  const checkBox = document.getElementsByName('option');
  for (let i = 0; i < checkBox.length; i++) {
    if (checkBox[i].value !== v) {
      checkBox[i].checked = false;
    }
  }
}
function reset(){
  console.log(defaultMemoryBlocks);
  requests.value = [];
  memoryBlocks.value = JSON.parse(JSON.stringify(defaultMemoryBlocks));
}

</script>
<template>
  <main>
    <div class="memory-container">
      <div class="memory-grid">
        <div
            v-for="(block, index) in memoryBlocks"
            :key="index"
            :class="['memory-block', block.allocated ? 'allocated' : 'free']"
            :style="{ width: ((block.size+100)/totalSize*100)+'%' }">
          {{ block.name +"#"+ block.id}}
        </div>
      </div>
    </div>
    <div class="display-area">
      <div class="progress-list">
        <TransitionGroup tag="ul" name="fade" class="container">
          <li v-for="(progress, index) in requests"
              :key="index"
              class="progresses"
          >
            <div class="progress-info" :class="[progress.allocated==true?'allocated':'unallocated']">
              {{ '进程ID : '+progress.id+" , "+"Size : "+progress.length +"KB"}}
            </div>
            <button class="delete-button" @click="Release(progress.id)">Release</button>
          </li>
        </TransitionGroup>
      </div>

      <div class="memory-table">
        <table>
          <thead>
          <tr>
            <th>分区号</th>
            <th>起始地址</th>
            <th>分区长度</th>
            <th>状态</th>
          </tr>
          </thead>
          <tr v-for="(block, index) in memoryBlocks" :key="index" :class="[index%2?'odd':'even']">
            <td>{{block.name + '#'+[block.id]}}</td>
            <td>{{block.start}}</td>
            <td>{{block.size}}</td>
            <td>{{block.allocated?'已分配':'空闲'}}</td>
          </tr>
        </table>

      </div>
    </div>
    <form class="options-form">
      <label v-for="(item, index) in options" :key="index">
        <input class="input-checkBox" type="checkbox" name="option" @click="selected(item)" :value="item"/>
        {{ item }}
      </label>
    </form>
    <div class="progress-length">
      <label>输入请求长度</label>
        <input type="number" v-model="length" class="input-progress-length">
        /KB
        <button @click="request(length)">插入请求</button>
        <button @click="clear">清空请求</button>
    </div>
    <div class="button-group">
      <button @click="allocate" class="allocate">
        分配空间
      </button>
      <button @click="reset" class="reset">
        重置
      </button>
    </div>
  </main>
</template>


<style scoped>
.memory-container {
  border-radius: 10px;
  display: flex;
  justify-content: center;
  margin: 20px auto;
  width: 100vh; /* 让宽度根据内容自适应 */
  max-height: 80vh; /* 最多占屏幕80%的高度 */
  overflow-y: auto; /* 超出高度出现滚动条 */
  padding: 10px;
  background-color: #f4f4f4;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.memory-grid {
  display: flex;
  width: 100%; /* 让子元素占满父容器 */
}

.memory-block {
  height: 50px;
  border-radius: 5px;
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  border-right: 1px solid #fff;
  transition: all 0.3s ease;
  font-size: 16px;
  color: white;
}

.allocated {
  background-color: #a53222; /* 红色代表已分配 */
}

.free {
  background-color: #67c23a; /* 绿色代表空闲 */
}
.unallocated{
  background-color: #777777;
}

.button-group {
  display: flex;         /* 水平方向排列按钮 */
  justify-content: center; /* 按钮居中显示 */
  gap: 40px;            /* 按钮之间的间距，20px */
  margin-top: 10px;     /* 上边距 */
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

button:hover {
  transform: scale(1.1);  /* 悬停时微微放大 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); /* 添加阴影 */
}

button.reset {
  background-color: #67c23a; /* 绿色 */
  color: white;
}

button.allocate {
  background-color: #f56c6c; /* 红色 */
  color: white;
}
.progress-length{
  margin:20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
}
.progresses{
  display: flex;
  flex-direction: row;
  padding: 5px;
  margin: 10px 0;
  border-radius: 10px;
  text-align: center;
  font-size: 16px;
  color: white;
  transition: all 0.3s ease;
}
.input-progress-length{
  width: 200px;
  text-align: center;
  font-size: 15px;
  margin: 0px;
 }

.container {
  display: flex;
  flex-direction: column;
  overflow-y:auto;
  width: 40vh;
  height: 30vh;
  background: #f4f4f4; /* 添加背景色 */
  border-radius: 10px; /* 添加圆角 */
  padding: 10px; /* 内边距 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}
.container ul{
  padding: 0; /* 去掉默认内边距 */
  margin: 0; /* 去掉默认外边距 */
}
.progresses:hover {
  transform: scale(1.05); /* 微微放大效果 */
}
.progress-list{
  display: flex;
  justify-content: center;
}
/* 1. 声明过渡效果 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}
label{
  font-size: 18px;
  margin: 10px;
}
input{
  border-color: gray;
  border-radius: 10px;   /* 圆角按钮 */
}
.options-form{
  margin: 20px;
}

.input-checkBox:hover{
  transform: scale(1.4);  /* 悬停时微微放大 */
}
.display-area{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  margin-top: 20px;
}
.memory-table {
  overflow-y:auto;
  margin: 15px;
  height: 30vh;
  width: 40vh;
  background: #f4f4f4;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  overflow-y: auto;
}

.memory-table table {
  width: 100%;
}

.even{
  background-color: #f4f4f4;
}
.odd{
  background-color: white;
}

.memory-table th, .memory-table td {
  border-radius: 3px;
  padding: 10px;
  border: none;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.memory-table th {
  background-color: #8AB6D6;
  color: white;
  border-radius: 3px;
}

.memory-table tr:hover {
  background-color: #f0f0f0;
  transition: background-color 0.3s ease;
}
.delete-button{
  margin-left: 40px;
  padding: 5px 15px;   /* 按钮内边距 */
  border: none;         /* 去除边框 */
  border-radius: 10px;   /* 圆角按钮 */
  cursor: pointer;      /* 鼠标悬停样式 */
  transition: all 0.3s ease; /* 平滑过渡动画 */
  font-size: 15px;
  color: white;
}
.progress-info{
  border-radius: 10px;
  width: 70%;
}
</style>
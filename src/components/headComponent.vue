<script setup>
</script>
<template>
  <div>
    <header>
      <h1>
        操作系统分页管理模拟
      </h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/dynamicPartition">内存的分配和回收过程</router-link>
        <router-link to="/pagingManagement">请求式分页管理</router-link>
      </nav>
    </header>
  </div>
</template>
<style>

header{
  background-color:#007bb9;
  padding: 20px;
  color: white;
}
nav a {
  margin-right: 20px; /* 控制链接间距 */
  color: white; /* 统一链接颜色 */
  text-decoration: none; /* 去掉下划线 */
}

nav a:hover {
  text-decoration: underline; /* 鼠标悬停时的下划线效果 */
}

nav a:visited {
  color: white; /* 去除访问过的紫色 */
}
</style>
<script setup>

</script>

<template>
  <main>
  <section class="intro">
    <h2>欢迎来到操作系统分页管理模拟</h2>
    <p>
      <strong>1、设计目的</strong>
      内存是计算机系统的核心之一，合理的内存管理策略不仅直接影响内存的利用率，
      而且对提升系统性能有着重要的作用。通过对内存的动态分区管理过程和动态分页管理过程的模拟实现，
      掌握动态分区管理中内存分配、回收策略及动态分页管理中请求式分页管理方法，
      并进一步理解分区管理、分页管理的特点和虚拟内存实现方式。
    </p>
    <p>
      <strong>2、导航</strong>
      点击上方导航栏中的链接，深入了解不同的内存管理模拟功能。您可以选择动态分区
      管理或动态分页管理进行模拟。
    </p>
  </section>
</main>
</template>

<style scoped>
main {
  margin-top: 40px;
}

.intro {
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.intro h2 {
  font-size: 24px;
  color: #333;
}

.intro p {
  font-size: 18px;
  line-height: 1.6;
  color: #555;
}
</style>
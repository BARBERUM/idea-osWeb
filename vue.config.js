const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  publicPath: './'  // ✅ 让打包后的资源使用相对路径
})

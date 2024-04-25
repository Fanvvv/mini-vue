// 使用 esbuild 加快开发构建速度。
// 仍使用 Rollup 进行生产构建，因为它会生成更小的文件，并提供更好的 tree-shaking 效果。

const { resolve } = require('path')
const { context } = require('esbuild')
const minimist = require('minimist')

// 解析用户执行命令行的参数
const args = minimist(process.argv.slice(2))
// 打包的格式，如果没传，默认用 global 模式
const format = args.f || 'global'
// 确定打包的模块
const target = args._[0] || 'reactivity'
// 读取对应的 package.json 内容
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))
// 打包输出的格式， 如果为 global 则使用 iife 自执行函数的方式
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'
// 输出文件
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

// esbuild 打包
context({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === "cjs" ? "node" : "browser",
}).then(ctx => {
    ctx.watch()
    console.log("watching~~~~")
})
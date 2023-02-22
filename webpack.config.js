const path = require('path');

//分块分析的插件
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const config = {
    // webpack会创建了一个全局变量process.env.NODE_ENV，其值就是mode的值
    // mode的值有development，production，none
    // development模式下，webpack会使用各种插件来帮助开发。比如会将打好的包（chunk）取一个友好的名字，方便debug
    // production模式下，webpack会使用各种插件来提高运行效率。会将打好的包（chunk）取一个简洁的名字，将代码压缩等
    mode: 'development',
    // entry定义同步块，异步块是在代码中，以import函数形式引入的块，如：import("XXXX.js")
    entry: {
        // hello: './hello.js',
        // bello: './bello.js',
        entry1: './maxAsync/entry/entry1.js',
        entry2: './maxAsync/entry/entry2.js',
        entry3: './maxAsync/entry/entry3.js',
        entry4: './maxAsync/entry/entry4.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[contenthash].js', //入口块和同步块，导出之后的名字
        // chunkFilename: '[name].chunk.js',// 异步块，导出之后的名字
        clean: true,
    },
    plugins: [new BundleAnalyzerPlugin()],
    // optimization优化的对象是块，优化的方式是将符合要求的文件，放入新的块中
    optimization: {
        // 如果入口文件没有变化，但是其引用的模块文件发生了变化，那么入口文件打包后的contenthash会发生变化
        // runtimeChunk生成了一个以runtime开头的文件，
        // 使得只要入口文件没有变化，即使引用的模块文件发生了变化，入口文件打包后的contenthash也会保持不变
        // runtimeChunk: true,
        // Instruct webpack not to obfuscate the resulting code
        minimize: false,
        splitChunks: {
            minSize: 0, //单个块文件最小是多少字节
            // minChunks: 2, //文件最小需要被多少个块引用，才会被加入到新块中
            // chunks 属性指定从哪些天然块（入口块和异步块）中，提取符合要求的文件，放入新建块中
            chunks: "all", //从所有块中查找，包括入口块和异步块
            // chunks: "async", //从异步块中查找
            // chunks: "initial",//从同步块中查找
            maxAsyncRequests: 2, ////总共最多需要加载多少个文件，可以完成异步模块的加载
            // 块中引入的依赖文件，按来源分为：本地文件，第三方文件
            // 只有满足要求的文件，才能被放入新的块中
            // cacheGroups就是定义要求的地方
            cacheGroups: {
                default: {//本地文件
                    idHint: "",
                    reuseExistingChunk: true,// 本地文件中，如果引用了入口文件中已经引用过的文件，则直接重用
                    minChunks: 2,
                    priority: -20// 如果一个文件即满足本地文件的要求，也满足第三方文件的要求，则按priority选择优先级高的那个
                },
                defaultVendors: {//第三方文件
                    idHint: "vendors",
                    reuseExistingChunk: true,
                    test: /[\\/]node_modules[\\/]/,// 第三方文件所在的位置
                    priority: -10
                }
            }
        },
    },
    // externals中指定了不需要打包的第三方文件
    // externals中指定的文件，因为并不进行打包，因此引入语句需要被替换
    // 比如我们在代码中，使用"import 'moment'"，来引入moment
    // webpack会将这个import语句替换掉，以便使用外部提供的moment
    externals: {
        'moment':{
            commonjs: "moment", // 如果我们的库运行在Node.js环境中，import _ from 'moment'等价于const _ = require('moment')
            amd: "moment", // 如果我们的库使用require.js等加载,等价于 define(["moment"], factory);
            root: "$" // 如果我们的库在浏览器中使用，需要提供一个全局的变量'￥'，等价于 var _ = (window._) or (_);
        }
    },
    context: __dirname,
};

module.exports = config;

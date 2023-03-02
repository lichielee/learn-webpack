const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

//分块分析的插件
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const config = {
    // webpack会创建了一个全局变量process.env.NODE_ENV，其值就是mode的值
    // mode的值有development，production，none
    // development模式下，webpack会使用各种插件来帮助开发。比如会将打好的包（chunk）取一个友好的名字，方便debug
    // production模式下，webpack会使用各种插件来提高运行效率。会将打好的包（chunk）取一个简洁的名字，将代码压缩等
    mode: 'development',
    // resolve主要用于帮助webpack找到需要打包的源代码
    // import语句中指定的可能是JS文件，也可能是包含JS文件的文件夹，webpack需要同时处理这两种情况
    resolve: {
        //在JS代码中，import文件需要指定文件路径，我们可以使用alias来给文件路径取别名
        alias: {
            // 在/maxAsync/entry/entry2.js文件中，
            // 使用import aliasTest from '~/aliasTest'来引入aliasTest.js问文件
            // '~/aliasTest'的实际路径是'maxAsync/modules/aliasTest.js'
            "~": path.resolve(__dirname, 'maxAsync/modules'),
        },
        // modules第三方依赖（如：import 'moment'）所在的目录
        modules: ["node_modules"],
        // descriptionFiles描述第三方依赖的路径的文件
        descriptionFiles: ['package.json'],
        // aliasFields描述了第三方依赖的入口文件
        aliasFields: ['browser']
    },
    module: {
        rules: [
            {
                test: require.resolve('./maxAsync/entry/entry3.js'), //只对entry3.js使用imports-loader
                use: [
                    {
                        loader: "imports-loader",
                        options: {
                            // 使用import语句导入第三方模块，类似于import _ from 'lodash'
                            imports: ['default lodash _'],
                            // 导入自定义变量
                            additionalCode: "var myVariable = {data:'test 123456'};"
                        },
                    }
                ]
            }
        ],
    },
    // entry定义同步块，异步块是在代码中，以import函数形式引入的块，如：import("XXXX.js")
    entry: {
        // hello: './hello.js',
        // bello: './bello.js',
        entry1: './maxAsync/entry/entry1.js',
        entry2: './maxAsync/entry/entry2.js',
        // entry3: './maxAsync/entry/entry3.js',
        // entry4: './maxAsync/entry/entry4.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[contenthash].js', //入口块和同步块，导出之后的名字
        // chunkFilename: '[name].chunk.js',// 异步块，导出之后的名字
        clean: true,
    },
    plugins: [
        // BundleAnalyzerPlugin在打包完成后后，弹出一个页面，显示打包的细节
        new BundleAnalyzerPlugin(),
        // ProvidePlugin用于在所有文件中，自动导入一个模块，并将这个模块作为全局变量使用
        // 例如，jQuery的'$'变量
        // 细粒度的引入（即只对特定文件导入模块），参见上面module.rules中的imports-loader
        new webpack.ProvidePlugin({
            '$': 'jquery' // 在所有模块文件中，如遇到'$'，就引入jquery
        }),
        // HtmlWebpackPlugin用于将打包好的文件插入HTML模板文件中
        new HtmlWebpackPlugin({title: 'webpack测试页面'})
    ],
    // optimization优化的对象是块，优化的方式是将符合要求的文件，放入新的块中
    optimization: {
        // 如果入口文件没有变化，但是其引用的模块文件发生了变化，那么入口文件打包后的contenthash会发生变化
        // runtimeChunk生成了一个以runtime开头的文件，
        // 使得只要入口文件没有变化，即使引用的模块文件发生了变化，入口文件打包后的contenthash也会保持不变
        // runtimeChunk: true,
        // Instruct webpack not to obfuscate the resulting code
        minimize: false,
        splitChunks: {
            minSize: 0, //单个块文件最小是多少个byte，只针对webpack打包生成的文件有效，对入口文件和动态引入的文件无效
            // minChunks: 2, //文件最小需要被多少个块引用，才会被加入到新块中
            // chunks 属性指定从哪些天然块（入口块和异步块）中，提取符合要求的文件，放入新建块中
            chunks: "all", //从所有块中查找，包括入口块和异步块
            // chunks: "async", //从异步块中查找
            // chunks: "initial",//从同步块中查找
            maxAsyncRequests: 3, //总共最多需要加载多少个文件，可以完成异步模块的加载
            // 块中引入的依赖文件，按来源分为：本地文件，第三方文件
            // 只有满足要求的文件，才能被放入新的块中
            // cacheGroups就是定义要求的地方
            cacheGroups: {
                default: {//针对本地文件
                    idHint: "",
                    reuseExistingChunk: true,// 如果当前缓存组中需要抽离的文件，在其他缓存组中，已经被抽离出来了，那么当前缓存组直接重用
                    minChunks: 2,
                    priority: -20// 如果一个文件即满足本地文件的要求，也满足第三方文件的要求，则按priority选择优先级高的那个
                },
                defaultVendors: {//针对第三方文件
                    idHint: "vendors",
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
            root: "@" // 如果我们的库在浏览器中使用，需要提供一个全局的变量'@'，等价于 var _ = (window._) or (_);
        }
    },
    context: __dirname,
};

module.exports = config;

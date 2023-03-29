# Webpack
简单的说，webpack就是有翻译功能的打包工具。

因为要翻译的文件类型多种多样，webpack使用第三方提供的各种loader来分别处理。

在翻译之后，进行文件打包的过程中，有各种各样不同的需求，
webpack使用plugin来介入整个处理过程，并定制处理方式。

总体上，webpack提供处理流程的管理，loader和plugin来负责具体的编译和打包工作。

# Webpack对文件的处理流程
1. 根据设定路径找到需要处理的入口文件
2. 调用loader对文件进行处理（编译文件）
3. 递归处理依赖的文件
4. 将满足相同条件的文件组织在一个逻辑单元（Chunk）中
5. 将处理完的文件打包输出

总的来说，就是沿着文件依赖树编译文件，然后汇集，最后打包。

# 基本原理
Webpack通过修改引用路径（修改import语句和全局变量的调用）的方式，
将文件中用到的模块或者全局变量，指向打包好的新文件。

# 术语

### 文件
默认情况下，Webpack只能处理JS文件，
但是在实际应用中，我们还有Css，Image等类型的文件需要处理。

不过本文主要侧重于JS文件的处理。因此后继描述中的文件，都只是JS文件。

Webpack认为文件根据来源分为两类：
- 本地文件（非lib文件）
- 第三方文件（在程序中使用的其他库）

根据不同来源的文件，Webpack可以采取不同的筛选方式，
找出符合需求的重复文件，再对其打包。

我们也可以根据自己的需求，使用test属性，定义自己的文件来源。

### 文件树，文件森林，入口，模块
相互依赖的模块之间是呈现树形结构的。
之所以不是网状结构，是因为前端页面每次只能有一个，因此调用总是从一个JS模块开始的。
这些相互依赖的模块就是文件树。

文件树的概念等效于模块。

文件树的根就是入口文件，Webpack认为根的来源只能有两种：
- 以异步方式"import('XXX.js')"导入的JS文件。
- Webpack配置文件中，entry指定的JS文件。

根文件是打包的起始点，Webpack就是从根文件开始，去查找依赖的。

异步方式导入又称按需导入。以异步方式导入的文件，往往是为了独立的功能，因此自身是独立的。
entry指定的文件，往往是页面启动时，用于初始化的文件，也是独立的。

前端系统就是由无数文件树来构成的，这些文件树构成了文件森林。

### 同步模块，异步模块
同步块是指以同步方式加载的文件。这些模块在ES6的代码中，通常是以import语句引入的。<br>
如： import 'XXX.js'

异步块的概念与同步块相对。主要是为了实现按需引入代码。通常是以import函数引入的。<br>
如： import('XXX.js')

异步模块只能作为文件树的根节点，同步模块才会被Webpack当成重复检查的对象。

### Module, Chunk, Bundle
- Module：webpack需要处理的文件就是module，
  默认情况下，webpack只能处理JS文件。但是因为loader的加持，
  webpack基本可以处理任何类型的文件。
- Chunk：将符合相同条件的module组合在一起，就是一个Chunk。
  至于是什么条件，每个插件有自己的定义规则。
  比如：SplitChunk可以将重复出现的module，提取到一个Chunk中。
  可以简单的将Chunk理解成由module组成的逻辑单元。
- Bundle：Chunk在优化和压缩等处理后，从其中抽出部分内容，
  作为最后输出的文件。

### Loader
Webpack默认只能处理JS文件，但是前段还有CSS，Image，字体等类型的文件需要处理。
Webpack使用各种各样的Loader对这些非JS类型的文件进行处理。

### Plugins
插件用于以各种方式自定义webpack构建过程。
可以用来实现对打包文件分配进HTML代码，压缩打包文件等功能。

# 筛选
SplitChunk（webpack的插件）会从将如下条件，作为考虑筛选方式
- 文件来源
- 文件大小
- 重复次数
- 文件树最多能被拆分成多少个文件

需注意的是，这些条件之间是并列关系。

SplitChunk对来源不同的文件采取了不同的筛选策略

### 本地文件
对于本地文件，SplitChunk默认会将重复2次的文件进行打包。
如果需要打包的文件已经在其他Chunk中，就直接引用

### 第三方文件
对于第三方文件，默认只考虑需要打包的文件，是否已经在其他Chunk中。
如果存在，就直接引用。

### 冲突解决
因为可以自定义文件来源，因此会出现一个文件同时满足多个筛选条件的情况，
我们可以设置priority属性，来决定优先考虑使用哪种来源的筛选条件。

### 排除文件
有些文件，可能需要由外部程序提供，这些文件不需要打包，
webpack使用externals属性，不对指定一些文件进行打包。


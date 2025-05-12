
# 我的衣橱 - OOTD (个人穿搭管理系统)

这是一个简单的个人穿搭管理系统，可以按季节和类型浏览你的服装图片。

## 运行步骤

### 1. 环境准备

确保你的电脑已安装 [Node.js](https://nodejs.org/) (推荐 LTS 版本)。Node.js 自带 npm 包管理器。

### 2. 安装依赖

在项目根目录下打开终端，运行以下命令安装项目所需的依赖 (`express` 和 `cors`)：

```bash
npm install
```

### 3. (可选) 更新图片列表

如果你添加、删除或修改了 `images/` 目录下的图片，需要重新生成 `images.json` 文件，供前端读取。在项目根目录下运行：

```bash
node generate-images-json.js
```

这个脚本会扫描 `images/` 下各个季节文件夹里的图片，并生成最新的 `images.json`。

### 4. 启动服务器

在项目根目录下运行以下命令启动 Node.js 服务器：

```bash
node server.js
```

服务器启动成功后，你会看到类似 `Server is running on http://localhost:3000` 的提示。

### 5. 访问应用

打开你的网页浏览器，访问以下地址：

[http://localhost:3000](http://localhost:3000)

现在你应该可以看到你的衣橱管理页面了！

## 注意事项

*   确保图片按 `images/季节/图片名.后缀` 的格式存放 (季节文件夹名为 `spring`, `summer`, `autumn`, `winter`)。
*   图片命名规则，必须要严格按照规则，不然无法正确读取进行分类；
    + 格式：季节_分类.jpg
    + 季节标签：
        + spring
        + summer
        + autumn
        + winter
    + 分类标签
        + shirt
        + pant
        + skirt
        + sock
        + shoe
        + accessory
        + ootd 
*   如果遇到 `npm install` 卡顿或报错，请检查网络连接和 npm 源配置 (`npm config get registry`)。


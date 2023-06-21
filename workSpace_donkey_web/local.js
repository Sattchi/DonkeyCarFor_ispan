const express = require('express');
const app = express();
const port = 3000;

// 设置静态文件目录，用于访问存储的图像
app.use(express.static('uploads'));

// 生成唯一的文件名
function generateFileName() {
  const timestamp = new Date().getTime();
  return `image_${timestamp}.jpg`;
}

// 处理上传请求的路由
app.post('/upload', (req, res) => {
  // 处理上传的文件
  const file = req.files.file;
  const fileName = generateFileName();

  // 保存文件到服务器的指定目录
  file.mv(`uploads/${fileName}`, (err) => {
    if (err) {
      console.error('文件保存失败:', err);
      res.status(500).send('文件保存失败');
    } else {
      const imageUrl = `http://localhost:${port}/uploads/${fileName}`;
      res.send(`文件上传成功！可以通过URL访问：<a href="${imageUrl}">${imageUrl}</a>`);
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器已启动，正在监听端口 ${port}`);
});

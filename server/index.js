let http = require('http')
let path = require('path')
let multiparty = require('multiparty')//接受文件
let fse = require('fs-extra')//处理文件目录 存储 创建文件夹

const server = http.createServer()
//监听请求
server.on('request', async (req, res) => {
  //跨域问题
  res.setHeader('Access-control-Allow-Origin', "*")
  //请求头
  res.setHeader('Access-control-Allow-Headers', '*')
  console.log('request')

  if (req.url == '/') {
    const multipart = new multiparty.Form()
    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        return
      }
      // console.log(files, fields)
      const [chunk] = files.chunk
      const [hash] = fields.hash
      const [filename] = fields.filename

      //把当前的文件 放到一个位置 ../target中
      const chunkDir = path.resolve(path.resolve(__dirname, '..', 'target'), filename)

      //判断文件夹是否存在
      if (!fse.pathExists(chunkDir)) {
        await fse.mkdirs(chunkDir)//创建文件夹后在操作
      }

      await fse.move(chunk.path, `${chunkDir}/${hash}`)//先放到内存中 当调用move 把内存中的文件 存储到文件夹中
      res.end('received file success')
    })
  }
  if (req.url == '/merge') {

  }
})
server.listen(3000, () => {
  console.log('端口号 3000')
})
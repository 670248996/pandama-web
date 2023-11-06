<template>
  <div>
    <el-upload :file-list="fileList" :http-request="onUpload" :on-remove="onRemove" limit="2">
        <el-button icon="el-icon-upload2">文件上传</el-button>
    </el-upload>
    <el-progress v-if="showProcess" :percentage="md5Process + uploadProcess" />
  </div>
</template>

<script setup>
import SparkMD5 from "spark-md5";

const { proxy } = getCurrentInstance()

const props = defineProps({

})

// 显示上传进度
const showProcess = ref(false);
// 文件列表
const fileList = ref([]);
// 分片大小
const chunkSize = 5 * 1024 * 1024;
// md5进度
const md5Process = ref(0);
// 上传进度
const uploadProcess = ref(0);

// 上传方法
const onUpload = async (File) => {
  showProcess.value = true
  // 完整文件
  const file = File.file
  // 完整件大小
  const fileSize = file.size
  // 分片数量
  const chunkCount = chunkSize > fileSize ? 1 : Math.ceil(fileSize / chunkSize)
  // 文件md5，给文件一个唯一标识
  const fileMd5 = await getFileMd5(file, chunkCount, chunkSize);
  // 上传分片
  for (let i = 0; i < chunkCount; i++) {
    // 分片文件
    const { chunkFile } = getChunkInfo(file, i)
    // 定义分片上传接口参数
    const formdata = new FormData()
    formdata.append('md5', fileMd5)
    formdata.append('fileName', file.name)
    formdata.append('fileSize', fileSize)
    formdata.append('chunkCount', chunkCount)
    formdata.append('chunkIndex', i)
    formdata.append('chunkSize', chunkSize)
    formdata.append('chunkFile', chunkFile)
    await proxy.chunkUpload(formdata).then(data => {
      uploadProcess.value = ((i+1) / (chunkCount * 2)) * 100
    });
  }
}

// 获取分片文件
const getChunkInfo = (file, index) => {
    // 分片开始位置
    let start = index * chunkSize;
    // 分片结束位置
    let end = Math.min(file.size, start + chunkSize);
    let chunkFile = file.slice(start, end);
    return { start, end, chunkFile };
}

// 获取文件md5
const getFileMd5 = (file, chunkCount, chunkSize) => {
  return new Promise((resolve, reject) => {
    const blobSlice = File.prototype.slice
    const chunks = chunkCount
    let currentChunk = 0
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    fileReader.onload = e => {
      spark.append(e.target?.result)
      currentChunk++
      md5Process.value = (currentChunk / (chunkCount * 2)) * 100
      if (currentChunk < chunks) {
        loadNext()
      } else {
        const md5 = spark.end()
        resolve(md5)
      }
    }
    fileReader.onerror = e => {
      reject(e)
    }
    function loadNext() {
      const start = currentChunk * chunkSize
      let end = start + chunkSize
      if (end > file.size) {
        end = file.size
      }
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
    }
    loadNext()
  })
}

// 文件删除回调
const onRemove = (uploadFile, uploadFiles) => {
  showProcess.value = (uploadFiles.length !== 0)
}

</script>

<style lang='scss' scoped>

</style>
import axios from 'axios'
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/gientech'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'

let downloadLoadingInstance;
// 是否显示重新登录
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
})

// request请求拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url;                // 请求地址
      const s_data = sessionObj.data;              // 请求数据
      const s_time = sessionObj.time;              // 请求时间
      const interval = 1000;                       // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = '数据正在处理，请勿重复提交';
        console.warn(`[${s_url}]: ` + message)
        // return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// response响应拦截器
service.interceptors.response.use(res => {
    // http请求成功，http状态码 == 200
    // 获取业务状态码，默认成功
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    // 判断业务状态码 200 (success)
    if (code == 200) {
      return Promise.resolve(res.data.data)
    } 
    // 判断业务状态码 其他 (error)
    else {
      // 弹窗提示
      ElMessageBox.alert(msg, "业务异常", { confirmButtonText: '确认', type: 'warning'} )
      return Promise.reject(new Error(msg))
    }
  }, error => {
    // http请求失败，http状态码 != 200
    // 获取http响应信息
    let res = error.response;
    // 获取http状态码
    let httpStatus = res.status;
    // 获取错误信息
    const msg = res.data.msg || errorCode['default']
    // 判断http状态码 401 (error)
    if (httpStatus == 401) {
      // 页面confirm弹窗
      ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', { confirmButtonText: '重新登录', cancelButtonText: '取消', type: 'warning' }).then(() => {
        useUserStore().logOut().then(() => {
          location.href = window.location.href
        })
      });
      return Promise.reject(new Error(msg))
    } 
    // 判断http状态码 404 (error)
    else if (httpStatus == 404) {
      // 顶部error提示
      ElMessage({ message: errorCode[httpStatus], type: 'error', duration: 3 * 1000 })
      return Promise.reject(new Error(errorCode[httpStatus]))
    } 
    // 判断http状态码 500 (error)
    else if (httpStatus == 500 || httpStatus == 400) {
      if (msg.includes('您的账号已被冻结')) {
        // 页面confirm弹窗
        ElMessageBox.confirm(msg, '系统提示', { confirmButtonText: '确认', type: 'warning', showCancelButton: false})
      } else {
        // 顶部error提示
        const notice = res.data.data === undefined ? '' : res.data.data
        ElMessage({ message: msg + ' ' + notice, type: 'error', duration: 3 * 1000 })
      }
      return Promise.reject(new Error(msg))
    } 
    // 判断http状态码 其他 (error)
    else {
      // 顶部error提示
      ElMessage({ message: msg, type: 'error', duration: 3 * 1000 })
      return Promise.reject(new Error(msg))
    }
  }
)

// 通用下载方法
export function download(url, data, filename, config) {
  downloadLoadingInstance = ElLoading.service({ text: "正在下载数据，请稍候", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, data, {
    headers: { 'Content-Type': 'application/json' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data);
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      ElMessage.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error(r)
    ElMessage.error('下载文件出现错误，请联系管理员！')
    downloadLoadingInstance.close();
  })
}

// 通用上传方法
export function upload(formdata) {
  const url = import.meta.env.VITE_FILE_BASE_API + "/oss/upload"
  return service.post(url, formdata);
}

// 通用分片上传方法
export function chunkUpload(formdata) {
  const url = import.meta.env.VITE_FILE_BASE_API + "/oss/sliceUpload"
  return service.post(url, formdata).then(async (data) => {
    Promise.resolve(data)
  }).catch((r) => {
    ElMessage.error('上传文件出现错误，请联系管理员！')
  })
}

export default service

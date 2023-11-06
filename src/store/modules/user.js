import { login, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      // 用户id
      userId: 0,
      // 姓名
      realName: '',
      // 头像
      avatar: '',
      // 性别
      gender: '',
      // 年龄
      age: '',
      // 手机号
      phone: '',
      // 身份证号
      idCardNo: '',
      // 出生日期
      birthday: '',
      // 学历
      education: '',
      // 籍贯
      nativePlace: '',
      // 职业
      occupation: '',
      // 邮箱
      email: '',
      // 工作地
      workPlace: '',
      // 在职状态
      workingState: '',
      // 入职时间
      onboardDate: '',
      // 账号是否可用
      status: true,
      // 是否超级管理员
      isAdmin: false,
      // 备注
      remark: '',
      // 所属部门名称
      deptName: '',
      // 所属部门编号
      deptCode: '',
      // 所属企业/机构id
      enterpriseId: 0,
      // 所属企业/机构全称
      enterpriseFullName: '',
      // 归属子系统id集
      systemIds: [],
      // 创建日期
      createTime: '',
      // 角色集
      roles: [],
      // 权限集
      permissions: []
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        const systemId = userInfo.systemId
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid, systemId).then(res => {
            setToken(res.accessToken)
            this.token = res.accessToken
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      setAvatar(avatar) {
        this.avatar = avatar
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : user.avatar;
            this.roles = res.roleCodeList
            this.permissions = res.permCodeList
            // 用户信息赋值
            this.userId = user.userId
            this.realName = user.realName
            this.avatar = avatar;
            this.gender = user.gender.toString()
            this.age = user.age
            this.phone = user.phone
            this.idCardNo = user.idCardNo
            this.birthday = user.birthday
            this.education = user.education
            this.nativePlace = user.nativePlace
            this.occupation = user.occupation
            this.email = user.email
            this.workPlace = user.workPlace
            this.onboardDate = user.onboardDate
            this.workingState = user.workingState.toString()
            this.status = user.status
            this.isAdmin = user.isAdmin
            this.remark = user.remark
            this.deptName = user.deptName
            this.deptCode = user.deptCode
            this.enterpriseId = user.enterpriseId
            this.enterpriseFullName = user.enterpriseFullName
            this.systemIds = user.systemIds
            this.createTime = user.createTime
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          this.token = ''
          this.roles = []
          this.permissions = []
          removeToken()
          resolve()
        })
      }
    }
  })

export default useUserStore

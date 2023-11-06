<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认新密码" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { updatePassword } from "@/api/system/user"
import userStore from '@/store/modules/user'

const { proxy } = getCurrentInstance();

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});
// 校验密码复杂度
const complexPassword = (rule, value, callback) => {
  const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
  if (reg.test(value) === false) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}
// 校验两次密码输入
const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
};
// 密码校验规则
const rules = ref({
  oldPassword: [
    {
      required: true,
      message: "旧密码不能为空",
      trigger: "blur"
    }
  ],
  newPassword: [
    {
      required: true,
      message: "新密码不能为空",
      trigger: "blur"
    },
    {
      message: "长度在 6 到 20 个字符，且必须包含大小写字母和数字及特殊字符",
      validator: complexPassword,
      trigger: "blur"
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: "确认密码不能为空",
      trigger: "blur"
    },
    {
      required: true,
      validator: equalToPassword,
      trigger: "blur"
    }
  ]
})

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updatePassword(user.oldPassword, user.newPassword, user.userId).then(res => {
        proxy.$modal.alertSuccess("修改成功，请退出重新登录", () => {
          userStore().logOut().then((res) => {
            location.href = window.location.href
          })
        });
      });
    }
  });
};
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
};
</script>

<template>
  <el-form ref="userRef" :model="newUser" :rules="rules" label-width="80px">
    <el-form-item label="用户姓名" prop="realName">
      <el-input v-model="newUser.realName" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="newUser.phone" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="newUser.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="newUser.gender">
        <el-radio label="1">男</el-radio>
        <el-radio label="0">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="在职状态">
      <el-radio-group v-model="newUser.workingState">
        <el-radio label="1">在职</el-radio>
        <el-radio label="0">离职</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { updateUserInfo } from "@/api/system/user";
import userStore from '@/store/modules/user'
import { toRaw } from "vue";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();

const rules = ref({
  realName: [{ required: true, message: "用户姓名不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phone: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
});
// 原值
const originData = { ...props.user }
// 表单修改后的值
const newUser = ref({ ...originData })
// 差异数据（改动后传到后端的值）
let diffData
// 计算改动并赋值到差异数据
const diffFormData = (f) => {
  for (let k in originData) {
    if (originData[k] !== f[k]) {
      if (!diffData) {
        diffData = {}
      }
      diffData[k] = f[k]
    }
  }
}

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    diffFormData(toRaw(newUser.value))
    console.log('diffData', diffData)
    if (Object.keys(diffData).length === 0) {
      proxy.$modal.msgSuccess("提交成功，但未做任何修改")
    } else {
      if (valid) {
        diffData.userId = props.user.userId
        if (diffData.gender !== undefined) {
          diffData.gender = parseInt(diffData.gender)
        }
        updateUserInfo(diffData).then(res => {
          proxy.$modal.msgSuccess("修改成功")
          // 更新store的用户信息
          userStore().getInfo().then((res) => {
            proxy.$tab.refreshPage()
          })
        });
      }
    }
  });
};
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
};
</script>

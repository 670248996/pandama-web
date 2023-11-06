<template>
   <div class="app-container">
      <el-row :gutter="20">
         <el-col :span="6" :xs="24">
            <el-card class="box-card">
               <template v-slot:header>
                  <div class="clearfix">
                     <span>个人信息</span>
                  </div>
               </template>
               <div>
                  <div class="text-center">
                     <userAvatar/>
                  </div>
                  <ul class="list-group list-group-striped">
                     <li class="list-group-item">
                        <svg-icon icon-class="user" /> 用户姓名
                        <div class="pull-right">{{ user.realName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="gender" /> 性别
                        <div class="pull-right">{{ user.gender == 0 ? '女' : '男' }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="phone" /> 手机号码
                        <div class="pull-right">{{ user.phone }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="email" /> 用户邮箱
                        <div class="pull-right">{{ user.email }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="enterprise" /> 所属企业
                        <div class="pull-right">{{ user.enterpriseFullName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="tree" /> 所属部门
                        <div class="pull-right">{{ user.deptName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="peoples" /> 所属角色
                        <div class="pull-right">{{ user.roles.join(',') }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="workPlace" /> 工作地
                        <div class="pull-right">{{ user.workPlace }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="workingState" /> 在职状态
                        <div class="pull-right">{{ user.workingState == 1 ? '在职' : '离职' }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="date" /> 入职日期
                        <div class="pull-right">{{ user.onboardDate }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="time" /> 创建时间
                        <div class="pull-right">{{ user.createTime }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <el-col :span="18" :xs="24">
            <el-card>
               <template v-slot:header>
                  <div class="clearfix">
                     <span>基本资料</span>
                  </div>
               </template>
               <el-tabs v-model="activeTab">
                  <el-tab-pane label="基本资料" name="userinfo">
                     <userInfo :user="user" />
                  </el-tab-pane>
                  <el-tab-pane label="修改密码" name="resetPwd">
                     <resetPwd />
                  </el-tab-pane>
               </el-tabs>
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup name="Profile">
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import userStore from '@/store/modules/user'
import { reactive, toRaw } from "vue";

const activeTab = ref("userinfo");

const user = reactive(toRaw(userStore().$state))

</script>

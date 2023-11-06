
<template>
  <div class="app-container">
    <el-row>
      <el-col :xs="24">
        <!--搜索条件-->
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="用户账号" prop="username">
                <el-input v-model="queryParams.username" placeholder="请输入用户账号" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="queryParams.phone" placeholder="请输入手机号码" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 搜索重置按钮 -->
          <!-- <el-row justify="end">
            <el-col :span="1.5">
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row> -->
        </el-form>

        <!-- 增删改操作 -->
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="openSelectUser"
              v-hasPermi="['system:role:add']">添加用户</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="CircleClose" :disabled="multiple" @click="cancelAuthUserAll"
              v-hasPermi="['system:role:remove']">批量取消授权</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="用户账号" prop="username" :show-overflow-tooltip="true" />
          <el-table-column label="用户姓名" prop="realName" :show-overflow-tooltip="true" />
          <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
          <el-table-column label="手机" prop="phone" :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="CircleClose" @click="cancelAuthUser(scope.row)"
                v-hasPermi="['system:role:remove']">取消授权</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size"
          @pagination="getList" />
          
        <!-- 选中用户组件 -->
        <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="AuthUser">
import selectUser from "./selectUser";
import { authUserList, authUserCancel } from "@/api/system/role";

const route = useRoute();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const userIds = ref([]);

const queryParams = reactive({
  current: 1,
  size: 10,
  roleId: route.params.roleId,
  username: undefined,
  phone: undefined,
});

/** 查询授权用户列表 */
function getList() {
  loading.value = true;
  authUserList(queryParams).then(response => {
    userList.value = response.records;
    total.value = response.total;
    loading.value = false;
  });
}
// 返回按钮
function handleClose() {
  const obj = { path: "/system/role" };
  proxy.$tab.closeOpenPage(obj);
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.current = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
// 多选框选中数据
function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId);
  multiple.value = !selection.length;
}
/** 打开授权用户表弹窗 */
function openSelectUser() {
  proxy.$refs["selectRef"].show();
}
/** 取消授权按钮操作 */
function cancelAuthUser(row) {
  proxy.$modal.confirm('确认要取消该用户"' + row.username + '"角色吗？').then(function () {
    return authUserCancel({ userIds: [row.userId], roleId: queryParams.roleId });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("取消授权成功");
  }).catch(() => { });
}
/** 批量取消授权按钮操作 */
function cancelAuthUserAll(row) {
  const roleId = queryParams.roleId;
  proxy.$modal.confirm("是否取消选中用户授权数据项?").then(function () {
    return authUserCancel({ roleId: roleId, userIds: userIds.value });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("取消授权成功");
  }).catch(() => { });
}

getList();
</script>

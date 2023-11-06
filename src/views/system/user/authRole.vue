<template>
  <div class="app-container">
    <el-row>
      <el-col :xs="24">
        <!--搜索条件-->
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable style="width: 200px"
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
            <el-button type="primary" plain icon="Plus" @click="openSelectRole"
              v-hasPermi="['system:user:add']">添加角色</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="CircleClose" :disabled="multiple" @click="cancelAuthRoleAll"
              v-hasPermi="['system:user:remove']">批量取消授权</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" />
          <el-table-column label="角色编号" prop="roleCode" :show-overflow-tooltip="true" />
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
              <el-button link type="primary" icon="CircleClose" @click="cancelAuthRole(scope.row)"
                v-hasPermi="['system:user:remove']">取消授权</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size"
          @pagination="getList" />

        <!-- 选中角色组件 -->
        <select-role ref="selectRef" :userId="queryParams.userId" @ok="handleQuery" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="AuthRole">
import selectRole from "./selectRole";
import { authRoleList, authRoleCancel } from "@/api/system/user";

const route = useRoute();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const roleIds = ref([]);

const queryParams = reactive({
  current: 1,
  size: 10,
  userId: route.params.userId,
  roleName: undefined,
});

/** 查询授权角色列表 */
function getList() {
  loading.value = true;
  authRoleList(queryParams).then(response => {
    userList.value = response.records;
    total.value = response.total;
    loading.value = false;
  });
}
// 返回按钮
function handleClose() {
  const obj = { path: "/system/user" };
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
  roleIds.value = selection.map(item => item.roleId);
  multiple.value = !selection.length;
}
/** 打开授权角色表弹窗 */
function openSelectRole() {
  proxy.$refs["selectRef"].show();
}
/** 取消授权按钮操作 */
function cancelAuthRole(row) {
  proxy.$modal.confirm("确认要取消该用户" + row.roleName + "角色吗？").then(function () {
    return authRoleCancel({ roleIds: [row.roleId], userId: queryParams.userId });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("取消授权成功");
  }).catch(() => { });
}
/** 批量取消授权按钮操作 */
function cancelAuthRoleAll(row) {
  const userId = queryParams.userId;
  proxy.$modal.confirm("是否取消选中角色授权数据项?").then(function () {
    return authRoleCancel({ userId: userId, roleIds: roleIds.value });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("取消授权成功");
  }).catch(() => { });
}

getList();
</script>

<template>
   <!-- 授权角色 -->
   <el-dialog title="选择角色" v-model="visible" width="800px" top="5vh" append-to-body>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="角色名称" prop="roleName">
            <el-input
               v-model="queryParams.roleName"
               placeholder="请输入角色名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>
      <el-row>
         <el-table @row-click="clickRow" ref="refTable" :data="userList" @selection-change="handleSelectionChange" height="260px">
            <el-table-column type="selection" width="55"></el-table-column>
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
         </el-table>
         <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.current"
            v-model:limit="queryParams.size"
            @pagination="getList"
         />
      </el-row>
      <template #footer>
         <div class="dialog-footer">
            <el-button type="primary" @click="handleSelectRole">确 定</el-button>
            <el-button @click="visible = false">取 消</el-button>
         </div>
      </template>
   </el-dialog>
</template>

<script setup name="SelectRole">
import { authRoleConfirm, unAuthRoleList } from "@/api/system/user";

const props = defineProps({
  userId: {
    type: [Number, String]
  }
});

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const visible = ref(false);
const total = ref(0);
const roleIds = ref([]);

const queryParams = reactive({
  current: 1,
  size: 10,
  userId: undefined,
  roleName: undefined,
});

// 显示弹框
function show() {
  queryParams.userId = props.userId;
  getList();
  visible.value = true;
}
/**选择行 */
function clickRow(row) {
  proxy.$refs["refTable"].toggleRowSelection(row);
}
// 多选框选中数据
function handleSelectionChange(selection) {
  roleIds.value = selection.map(item => item.roleId);
}
// 查询表数据
function getList() {
  unAuthRoleList(queryParams).then(res => {
    userList.value = res.records;
    total.value = res.total;
  });
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
const emit = defineEmits(["ok"]);
/** 选择授权角色操作 */
function handleSelectRole() {
  const userId = queryParams.userId;
  if (!roleIds.value) {
    proxy.$modal.msgError("请选择要分配的角色");
    return;
  }
  authRoleConfirm({ userId: userId, roleIds: roleIds.value }).then(res => {
    proxy.$modal.msgSuccess("分配成功");
    visible.value = false;
    emit("ok");
  });
}

defineExpose({
  show,
});
</script>

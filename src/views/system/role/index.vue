<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--搜索条件-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="角色编号" prop="roleCode">
                <el-input v-model="queryParams.roleCode" placeholder="请输入角色编号" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="角色状态" clearable style="width: 200px">
                  <el-option v-for="dict in sys_normal_disable" :key="dict.dictCode" :label="dict.dictName"
                    :value="dict.dictCode" />
                </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:role:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
              v-hasPermi="['system:role:remove']">删除</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="角色编号" prop="roleCode" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-switch v-model="scope.row.status" :active-value="true" :inactive-value="false"
                @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="修改" placement="top" v-if="scope.row.id != 1">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" v-if="scope.row.id != 1">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['system:role:remove']"></el-button>
              </el-tooltip>
              <el-tooltip content="分配用户" placement="top" v-if="scope.row.id != 1">
                <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)"
                  v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size"
          @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="form.roleName" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="roleCode">
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的角色编号，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  角色编号
                </span>
              </template>
              <el-input v-model="form.roleCode" placeholder="请输入角色编号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.dictCode" :label="dict.dictCode">{{ dict.dictName
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单权限">
              <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
              <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
              <el-checkbox v-model="form.menuCheckStrictly"
                @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
              <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menuRef" node-key="menuId"
                :check-strictly="!form.menuCheckStrictly" empty-text="加载中，请稍候"
                :props="{ label: 'menuName', children: 'children' }"></el-tree>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Role">
import { addRole, changeRoleStatus, delRole, getRole, pageRole, updateRole } from "@/api/system/role";
import { roleMenuTreeselect, treeMenu as menuTreeselect } from "@/api/system/menu";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const roleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const roleCodes = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const systemName = ref("");
const selectSystemId = ref(null);
const systemOptions = ref([]);
const menuOptions = ref([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuRef = ref(null);
const deptRef = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    current: 1,
    size: 10,
    roleName: undefined,
    roleCode: undefined,
    status: undefined,
    systemId: undefined
  },
  rules: {
    roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
    roleCode: [{ required: true, message: "角色编号不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.systemName.indexOf(value) !== -1;
};
/** 根据名称筛选字典树 */
watch(systemName, val => {
  proxy.$refs["systemListRef"].filter(val);
});
/** 查询子系统列表 */
function getSystemList() {
  listSystem().then(response => {
    systemOptions.value = response;
    nextTick(() => {
      proxy.$refs.systemListRef.setCurrentKey(systemOptions.value[0].systemId);
      queryParams.value.systemId = systemOptions.value[0].systemId;
      selectSystemId.value = systemOptions.value[0].systemId
      getList()
    })
  });
};

/** 查询角色列表 */
function getList() {
  loading.value = true;
  pageRole(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    roleList.value = response.records;
    total.value = response.total;
    loading.value = false;
  });
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.current = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 删除按钮操作 */
function handleDelete(row) {
  const roleIds = row.id || ids.value.join(',');
  const delCodes = row.roleCode || roleCodes.value.join(',');
  proxy.$modal.confirm('是否确认删除角色编号为[' + delCodes + ']的数据项?').then(function () {
    return delRole(roleIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/role/export", {
    ...queryParams.value,
  }, `role_${new Date().getTime()}.xlsx`);
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  roleCodes.value = selection.map(item => item.roleCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 角色状态修改 */
function handleStatusChange(row) {
  let text = row.status ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.roleName + '"角色吗?').then(function () {
    return changeRoleStatus(row.id, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(() => {
    row.status = !row.status
  });
}
/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleAuthUser":
      handleAuthUser(row);
      break;
    default:
      break;
  }
}
/** 分配用户 */
function handleAuthUser(row) {
  router.push("/system/role-auth/user/" + row.id);
}
/** 查询菜单树结构 */
function getMenuTreeselect() {
  menuTreeselect().then(response => {
    menuOptions.value = response;
  });
}
/** 重置新增的表单以及其他数据  */
function reset() {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  form.value = {
    id: undefined,
    roleName: undefined,
    roleCode: undefined,
    status: false,
    menuIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined
  };
  proxy.resetForm("roleRef");
}
/** 添加角色 */
function handleAdd() {
  reset();
  getMenuTreeselect();
  open.value = true;
  title.value = "添加角色";
}
/** 修改角色 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  const roleMenu = getRoleMenuTreeselect(id);
  getRole(id).then(response => {
    form.value = response;
    open.value = true;
    nextTick(() => {
      roleMenu.then((res) => {
        let checkedKeys = res.selectedKeys;
        checkedKeys.forEach((v) => {
          nextTick(() => {
            menuRef.value.setChecked(v, true, false);
          });
        });
      });
    });
    title.value = "修改角色";
  });
}
/** 根据角色ID查询菜单树结构 */
function getRoleMenuTreeselect(id) {
  return roleMenuTreeselect(id).then(response => {
    menuOptions.value = response.treeList;
    return response;
  });
}
/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value, type) {
  if (type == "menu") {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
}
/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value, type) {
  if (type == "menu") {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
  }
}
/** 树权限（父子联动） */
function handleCheckedTreeConnect(value, type) {
  if (type == "menu") {
    form.value.menuCheckStrictly = value ? true : false;
  }
}
/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["roleRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        form.value.menuIds = getMenuAllCheckedKeys();
        updateRole(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.menuIds = getMenuAllCheckedKeys();
        addRole(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

getList();
</script>

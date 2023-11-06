<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--搜索条件-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="菜单名称" prop="menuName">
                <el-input v-model="queryParams.menuName" placeholder="请输入权限名称" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="权限状态" clearable style="width: 200px">
                  <el-option v-for="dict in sys_normal_disable" :key="dict.dictCode" :label="dict.dictName"
                    :value="dict.dictCode" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
              v-hasPermi="['system:menu:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table v-if="refreshTable" v-loading="loading" :data="menuTree" row-key="id"
          :expand-row-keys="expandRowKeys" @row-click="clickRowHandle" @expand-change="clickRowHandle"
          style="cursor: pointer;" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
          <el-table-column prop="menuName" label="权限名称" :show-overflow-tooltip="true" width="160"></el-table-column>
          <el-table-column prop="meta.icon" label="图标" align="center" width="100">
            <template #default="scope">
              <svg-icon :icon-class="scope.row.meta == null ? '' : scope.row.meta.icon" />
            </template>
          </el-table-column>
          <el-table-column prop="orderNum" label="排序" width="60"></el-table-column>
          <el-table-column prop="menuCode" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="meta.component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" width="160" prop="createTime">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="210" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click.native.stop="handleUpdate(scope.row)"
                v-hasPermi="['system:menu:edit']">修改</el-button>
              <el-button link type="primary" icon="Plus" @click.native.stop="handleAdd(scope.row)"
                v-hasPermi="['system:menu:add']">新增</el-button>
              <el-button link type="primary" icon="Delete" @click.native.stop="handleDelete(scope.row)"
                v-hasPermi="['system:menu:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 添加或修改权限对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级权限">
              <el-tree-select v-model="form.parentId" :data="menuOptions"
                :props="{ value: 'id', label: 'menuName', children: 'children' }" value-key="id"
                placeholder="选择上级权限" check-strictly />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="权限类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="DIR">目录</el-radio>
                <el-radio label="MENU">菜单</el-radio>
                <el-radio label="BUTTON">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuType != 'BUTTON'">
            <el-form-item label="菜单图标" prop="meta.icon">
              <el-popover placement="bottom-start" :width="540" v-model:visible="showChooseIcon" trigger="click"
                @show="showSelectIcon">
                <template #reference>
                  <el-input v-model="form.meta.icon" placeholder="点击选择图标" v-click-outside="hideSelectIcon" readonly>
                    <template #prefix>
                      <svg-icon v-if="form.meta.icon" :icon-class="form.meta.icon" class="el-input__icon"
                        style="height: 32px;width: 16px;" />
                      <el-icon v-else style="height: 32px;width: 16px;">
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.meta.icon" />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入权限名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'BUTTON'">
            <el-form-item prop="menuUrl">
              <template #label>
                <span>
                  <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="form.menuUrl" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'MENU'">
            <el-form-item prop="meta.component">
              <template #label>
                <span>
                  <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.meta.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'DIR'">
            <el-form-item>
              <el-input v-model="form.menuCode" placeholder="请输入权限标识" maxlength="100" />
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  启用状态
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.dictCode" :label="dict.dictCode">{{ dict.dictName
                }}</el-radio>
              </el-radio-group>
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

<script setup name="Menu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from "@/api/system/menu";
import SvgIcon from "@/components/SvgIcon";
import IconSelect from "@/components/IconSelect";
import { ClickOutside as vClickOutside } from 'element-plus'

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const menuList = ref([]);
const menuTree = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const menuOptions = ref([]);
const refreshTable = ref(true);
const showChooseIcon = ref(false);
const iconSelectRef = ref(null);
const expandRowKeys = ref([])

const data = reactive({
  form: {},
  queryParams: {
    menuName: undefined
  },
  rules: {
    menuName: [{ required: true, message: "权限名称不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "权限顺序不能为空", trigger: "blur" }],
    menuUrl: [{ required: true, message: "路由地址不能为空", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询权限列表 */
function getList() {
  loading.value = true;
  listMenu(queryParams.value).then(response => {
    menuList.value = response
    menuTree.value = proxy.handleTree(response);
    loading.value = false;
  });
}

/** 查询权限下拉树结构 */
function getTreeselect(excludeParentId) {
  menuOptions.value = [];
  listMenu({ excludeParentId }).then(response => {
    const menu = { id: "0", menuName: "顶级菜单", children: [] };
    menu.children = proxy.handleTree(response);
    menuOptions.value.push(menu);
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    parentId: 0,
    id: undefined,
    menuName: undefined,
    meta: {
      title: undefined,
      icon: undefined,
      component: undefined
    },
    menuType: "DIR",
    orderNum: undefined,
    status: true
  };
  proxy.resetForm("menuRef");
}
/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset();
  showChooseIcon.value = true;
}
/** 选择图标 */
function selected(name) {
  form.value.meta.icon = name;
  showChooseIcon.value = false;
}
/** 图标外层点击隐藏下拉列表 */
function hideSelectIcon(event) {
  var elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget;
  var className = elem.className;
  if (className !== "el-input__inner") {
    showChooseIcon.value = false;
  }
}
/** 搜索按钮操作 */
function handleQuery() {
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.id) {
    form.value.parentId = row.id;
  } else {
    form.value.parentId = "0";
  }
  open.value = true;
  title.value = "添加权限";
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  if (expandRowKeys.value.length > 0) {
    expandRowKeys.value = []
  } else {
    expandRowKeys.value = menuList.value.map(p => String(p.id))
  }
  nextTick(() => {
    refreshTable.value = true;
  });
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect(row.id);
  getMenu(row.id).then(response => {
    form.value = response;
    open.value = true;
    title.value = "修改权限";
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["menuRef"].validate(valid => {
    if (valid) {
      if (form.value.meta) {
        form.value.meta.title = form.value.menuName
      }
      if (form.value.id != undefined) {
        updateMenu(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMenu(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除名称为"' + row.menuName + '"的数据项?').then(function () {
    return delMenu(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 行点击展开 */
function clickRowHandle(row) {
  if (expandRowKeys.value.includes(String(row.id))) {
    // expandRowKeys中之前有这个数据 --去除它
    expandRowKeys.value = expandRowKeys.value.filter((item) => {
      return item != String(row.id);
    });
  } else {
    // 原来没有这个数据 --增加它
    expandRowKeys.value.push(String(row.id));
  }
}

getList();

</script>

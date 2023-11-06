<template>
  <div class="app-container">
    <el-row>
      <el-col :xs="24">
        <!--搜索条件-->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="字典名称" prop="dictName">
                <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="字典状态" clearable style="width: 200px">
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:dict:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery"
            @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table v-if="refreshTable" v-loading="loading" :data="dictTree" row-key="id"
          :expand-row-keys="expandRowKeys" @row-click="clickRowHandle" @expand-change="clickRowHandle"
          style="cursor: pointer;" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
          <el-table-column prop="dictName" label="字典名称"></el-table-column>
          <el-table-column prop="dictCode" label="字典编号"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click.native.stop="handleUpdate(scope.row)"
                v-hasPermi="['system:dict:edit']">修改</el-button>
              <el-button link type="primary" icon="Plus" @click.native.stop="handleAdd(scope.row)"
                v-hasPermi="['system:dict:add']">新增</el-button>
              <el-button link type="primary" icon="Delete"
                @click.native.stop="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 添加或修改字典对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="dictRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="上级字典" prop="parentId">
              <el-tree-select v-model="form.parentId" :data="dictOptions"
                :props="{ value: 'id', label: 'dictName', children: 'children' }" value-key="id"
                placeholder="选择上级字典" check-strictly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典编号" prop="dictCode">
              <el-input v-model="form.dictCode" placeholder="请输入字典编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典名称" prop="dictName">
              <el-input v-model="form.dictName" placeholder="请输入字典名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.dictCode" :label="dict.dictCode">{{
                  dict.dictName }}</el-radio>
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

<script setup name="Dict">
import { listDict, getDict, delDict, addDict, updateDict } from "@/api/system/dict";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const dictList = ref([]);
const dictTree = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const dictOptions = ref([]);
const refreshTable = ref(true);
const expandRowKeys = ref([])

const data = reactive({
  form: {},
  queryParams: {
    dictName: undefined,
    status: undefined
  },
  rules: {
    parentId: [{ required: true, message: "上级字典不能为空", trigger: "blur" }],
    dictName: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询字典列表 */
function getList() {
  loading.value = true;
  listDict(queryParams.value).then(response => {
    dictList.value = response;
    dictTree.value = proxy.handleTree(response, "id");
    loading.value = false;
  });
}
/** 查询权限下拉树结构 */
function getTreeselect(excludeParentId) {
  dictOptions.value = [];
  listDict({ excludeParentId }).then(response => {
    const dict = { id: "0", dictName: "顶级字典", children: [] };
    dict.children = proxy.handleTree(response, "id");
    dictOptions.value.push(dict);
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
    id: undefined,
    parentId: undefined,
    dictName: undefined,
    dictCode: undefined,
    managerName: undefined,
    managerPhone: undefined,
    managerEmail: undefined,
    status: false
  };
  proxy.resetForm("dictRef");
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
async function handleAdd(row) {
  reset();
  await getTreeselect()
  if (row != null && row.id) {
    form.value.parentId = row.id;
  } else {
    form.value.parentId = "0";
  }
  open.value = true;
  title.value = "添加字典";
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  if (expandRowKeys.value.length > 0) {
    expandRowKeys.value = []
  } else {
    expandRowKeys.value = dictList.value.map(p => String(p.id))
  }
  nextTick(() => {
    refreshTable.value = true;
  });
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect(row.id)
  getDict(row.id).then(response => {
    form.value = response;
    open.value = true;
    title.value = "修改字典";
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["dictRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateDict(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDict(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除名称为"' + row.dictName + '"的数据项?').then(function () {
    return delDict(row.id);
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

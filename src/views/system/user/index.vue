<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--左侧部门树-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="Search"
            style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="deptOptions" :props="{ label: 'deptName', children: 'children' }"
            :expand-on-click-node="false" :filter-node-method="filterNode" ref="deptTreeRef" node-key="deptId"
            highlight-current :default-expand-all="false" @node-click="handleNodeClick" />
        </div>
      </el-col>

      <!--搜索条件-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-row justify="space-between">
            <el-col :span="6">
              <el-form-item label="用户账号" prop="username">
                <el-input v-model="queryParams.username" placeholder="请输入用户账号" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="用户姓名" prop="realName">
                <el-input v-model="queryParams.realName" placeholder="请输入用户姓名" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="queryParams.phone" placeholder="请输入手机号码" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 200px">
                  <el-option v-for="dict in sys_normal_disable" :key="dict.dictCode" :label="dict.dictName"
                    :value="dict.dictCode" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="创建时间" style="width: 268px;">
                <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
                  start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
              v-hasPermi="['system:user:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['system:user:import']"
              disabled>导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:user:export']"
              disabled>导出</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="用户账号" align="center" key="username" prop="username" v-if="columns[0].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="用户编号" align="center" key="code" prop="code" v-if="columns[1].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="用户姓名" align="center" key="realName" prop="realName" v-if="columns[2].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="部门" align="center" key="deptName" prop="deptName" v-if="columns[3].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" key="phone" prop="phone" v-if="columns[4].visible" width="120" />
          <el-table-column label="状态" align="center" key="status" v-if="columns[5].visible">
            <template #default="scope">
              <el-switch v-model="scope.row.status" :active-value="true" :inactive-value="false"
                @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[5].visible" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="修改" placement="top" v-if="!scope.row.isAdmin">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:user:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" v-if="!scope.row.isAdmin">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['system:user:remove']"></el-button>
              </el-tooltip>
              <el-tooltip content="重置密码" placement="top" v-if="!scope.row.isAdmin">
                <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)"
                  v-hasPermi="['system:user:resetPwd']"></el-button>
              </el-tooltip>
              <el-tooltip content="分配角色" placement="top" v-if="!scope.row.isAdmin">
                <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)"
                  v-hasPermi="['system:user:edit']"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size"
          @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.id == undefined" label="用户账号" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户账号" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.id == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入用户姓名" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.gender" placeholder="请选择" @change="changeGender">
                <el-option v-for="dict in sys_user_sex" :key="dict.dictCode" :label="dict.dictName"
                  :value="dict.dictCode"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户编号" prop="code">
              <el-input v-model="form.code" placeholder="请输入用户编号" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="deptId">
              <el-tree-select v-model="form.deptId" :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }" value-key="deptId"
                placeholder="请选择部门" check-strictly filterable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
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

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
              @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser } from "@/api/system/user";
import { deptTree } from "@/api/system/dept";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const usernames = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const deptName = ref("");
const deptOptions = ref([]);
const initPassword = ref('1234@com');
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
});
// 列显隐信息
const columns = ref([
  { key: 0, label: `用户账号`, visible: true },
  { key: 1, label: `用户编号`, visible: true },
  { key: 2, label: `用户姓名`, visible: true },
  { key: 3, label: `部门`, visible: true },
  { key: 4, label: `手机号码`, visible: true },
  { key: 5, label: `状态`, visible: true },
  { key: 6, label: `创建时间`, visible: true }
]);

const data = reactive({
  form: {},
  queryParams: {
    current: 1,
    size: 10,
    username: undefined,
    realName: undefined,
    phone: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    username: [{ required: true, message: "用户账号不能为空", trigger: "blur" }, { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }],
    password: [{ required: true, message: "用户密码不能为空", trigger: "blur" }, { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }],
    realName: [{ required: true, message: "用户姓名不能为空", trigger: "blur" }],
    code: [{ required: true, message: "用户编号不能为空", trigger: "blur" }],
    phone: [{ required: true, pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
    email: [{ required: true, type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    deptId: [{ required: true, message: "部门不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.deptName.indexOf(value) !== -1;
};
/** 根据名称筛选部门树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val);
});
/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTree().then(response => {
    deptOptions.value = response;
  });
};
/** 查询用户列表 */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value, "CreateTime")).then(res => {
    loading.value = false;
    userList.value = res.records;
    total.value = res.total;
  });
};
/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
};
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.current = 1;
  getList();
};
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.deptId = undefined;
  proxy.$refs.deptTreeRef.setCurrentKey(null);
  handleQuery();
};
/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.id || ids.value.join(',');
  const delNames = row.username || usernames.value.join(',');
  proxy.$modal.confirm('是否确认删除用户编号为[' + delNames + ']的数据项？').then(function () {
    return delUser(userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
};
/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  }, `user_${new Date().getTime()}.xlsx`);
};
/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.username + '"用户吗?').then(function () {
    return changeUserStatus(row.id, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(() => {
    row.status = !row.status
  });
};
function changeGender(item) {
  form.gender = item.dictCode
  form.genderName = item.dictName
}
/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row);
      break;
    case "handleAuthRole":
      handleAuthRole(row);
      break;
    default:
      break;
  }
};
/** 跳转角色分配 */
function handleAuthRole(row) {
  const id = row.id;
  router.push("/system/user-auth/role/" + id);
};
/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$prompt('请输入"' + row.username + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
  }).then(({ value }) => {
    resetUserPwd(row.id, value).then(response => {
      proxy.$modal.msgSuccess("修改成功，新密码是：" + value);
    });
  }).catch(() => { });
};
/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  usernames.value = selection.map(item => item.username);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
};
/** 下载模板操作 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};
/** 重置操作表单 */
function reset() {
  form.value = {
    id: undefined,
    deptId: undefined,
    username: undefined,
    realName: undefined,
    code: undefined,
    password: undefined,
    phone: undefined,
    email: undefined,
    gender: 0,
    genderName: '女',
    status: false,
    remark: undefined,
  };
  proxy.resetForm("userRef");
};
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
};
/** 新增按钮操作 */
function handleAdd() {
  reset();
  //   getUser().then(response => {
  open.value = true;
  title.value = "添加用户";
  form.value.password = initPassword.value;
  form.value.deptId = queryParams.value.deptId
  //   });
};
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  getUser(id).then(response => {
    form.value = response;
    open.value = true;
    title.value = "修改用户";
  });
};
/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addUser(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
};

getDeptTree();
getList();
</script>

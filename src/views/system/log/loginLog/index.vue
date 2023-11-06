<template>
  <div class="app-container">
    <el-row>
      <el-col :xs="24">
        <!--搜索条件-->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="用户账号" prop="createUserCode">
                <el-input v-model="queryParams.createUserCode" placeholder="请输入用户账号" clearable style="width: 200px;"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态" prop="event">
                <el-select v-model="queryParams.event" placeholder="登陆状态" clearable style="width: 200px">
                  <el-option v-for="dict in login_type" :key="dict.dictCode" :label="dict.dictName"
                    :value="dict.dictCode" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="访问时间" style="width: 268px">
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
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
              v-hasPermi="['system:loginLog:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" @click="handleClean"
              v-hasPermi="['system:loginLog:remove']">清空</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
              v-hasPermi="['system:loginLog:export']">导出</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table ref="loginLogRef" v-loading="loading" :data="loginLogList" @selection-change="handleSelectionChange"
          :default-sort="defaultSort" @sort-change="handleSortChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="账号" align="center" prop="createUserCode" :show-overflow-tooltip="true" />
          <el-table-column label="姓名" align="center" prop="createUserName" :show-overflow-tooltip="true" />
          <el-table-column label="IP地址" align="center" prop="ipAddress" :show-overflow-tooltip="true" />
          <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
          <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
          <el-table-column label="登录状态" align="center" prop="event">
            <template #default="scope">
              <dict-tag :options="login_type" :value="scope.row.event" />
            </template>
          </el-table-column>
          <el-table-column label="描述" align="center" prop="msg" :show-overflow-tooltip="true" width="380" />
          <el-table-column label="访问时间" align="center" prop="createTime" sortable="custom" :sort-orders="['desc', 'asc']"
            width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size"
          @pagination="getList" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="LoginLog">
import { list, delLoginLog, cleanLoginLog } from "@/api/system/log/loginLog";

const { proxy } = getCurrentInstance();
const { login_type } = proxy.useDict("login_type");

const loginLogList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const selectName = ref("");
const total = ref(0);
const dateRange = ref([]);
const defaultSort = ref({ prop: "loginTime", order: "descending" });

// 查询参数
const queryParams = ref({
  current: 1,
  size: 10,
  createUserCode: undefined,
  event: undefined,
  orderByColumn: undefined,
  sort: undefined
});

/** 查询登录日志列表 */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value, "CreateTime")).then(response => {
    loginLogList.value = response.records;
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
  proxy.$refs["loginLogRef"].sort(defaultSort.value.prop, defaultSort.value.order);
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
  single.value = selection.length != 1;
  selectName.value = selection.map(item => item.createUserName);
}
/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  queryParams.value.sortColumn = column.prop;
  queryParams.value.sort = column.order;
  getList();
}
/** 删除按钮操作 */
function handleDelete(row) {
  const infoIds = row.id || ids.value.join(',');
  proxy.$modal.confirm('是否确认删除日志数据?').then(function () {
    return delLoginLog(infoIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 清空按钮操作 */
function handleClean() {
  proxy.$modal.confirm("是否确认清空所有登录日志数据项?").then(function () {
    return cleanLoginLog();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("清空成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("user/log/LOGIN_LOG/export", {
    ...queryParams.value,
    current: -1,
    size: -1
  }, `登录日志_${new Date().getTime()}.xlsx`);
}

getList();
</script>

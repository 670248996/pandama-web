<template>
  <div class="app-container">
    <el-row>
      <el-col :xs="24">
        <!--搜索条件-->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="操作人员" prop="createUserName">
                <el-input v-model="queryParams.createUserName" placeholder="请输入操作人员" clearable style="width: 200px;"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="事件" prop="event">
                <el-tree-select v-model="queryParams.event" :data="operTypeTree"
                  :props="{ value: 'dictCode', parent: 'dictParentId', label: 'dictName', children: 'children' }"
                  value-key="dictCode" placeholder="选择操作事件" check-strictly style="width: 200px;" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="操作时间" style="width: 268px">
                <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
                  start-placeholder="开始日期" end-placeholder="结束日期"
                  :default-time="[new Date(2000, 1, 1), new Date(2000, 1, 1)]"></el-date-picker>
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
              v-hasPermi="['system:operLog:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" @click="handleClean"
              v-hasPermi="['system:operLog:remove']">清空</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
              v-hasPermi="['system:operLog:export']">导出</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @handleQuery="handleQuery" @resetQuery="resetQuery" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 列表数据 -->
        <el-table ref="operLogRef" v-loading="loading" :data="operLogList" @selection-change="handleSelectionChange"
          :default-sort="defaultSort" @sort-change="handleSortChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="系统模块" align="center" prop="module" :show-overflow-tooltip="true" />
          <el-table-column label="操作事件" align="center" prop="event">
            <template #default="scope">
              <dict-tag :options="operate_type" :value="scope.row.event" />
            </template>
          </el-table-column>
          <el-table-column label="操作人员" align="center" width="110" prop="createUserName" :show-overflow-tooltip="true" />
          <el-table-column label="IP地址" align="center" prop="ipAddress" width="130" :show-overflow-tooltip="true" />
          <el-table-column label="操作日期" align="center" prop="createTime" width="180" sortable="custom"
            :sort-orders="['desc', 'asc']">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="View" @click="handleView(scope.row, scope.index)"
                v-hasPermi="['system:operLog:query']">详细</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.current" v-model:limit="queryParams.size"
          @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" v-model="open" width="700px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
            <el-form-item label="登录信息：">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="消耗时间：">{{ form.costTime }}毫秒</el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="operLog">
import { list, delOperLog, cleanOperLog } from "@/api/system/log/operLog";

const { proxy } = getCurrentInstance();
const { operate_type } = proxy.useDict("operate_type");

const operLogList = ref([]);
const operTypeTree = ref(proxy.handleTree(operate_type.value, "dictId", "dictParentId"));
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref([]);
const defaultSort = ref({ prop: "createTime", order: "desc" });

const data = reactive({
  form: {},
  queryParams: {
    current: 1,
    size: 10,
    title: undefined,
    createUserName: undefined,
    event: undefined
  }
});

const { queryParams, form } = toRefs(data);

/** 查询登录日志 */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value, "CreateTime")).then(response => {
    operLogList.value = response.records;
    total.value = response.total;
    loading.value = false;
  });
}
/** 操作日志类型字典翻译 */
function typeFormat(row, column) {
  return proxy.selectDictLabel(operate_type.value, row.event);
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
  queryParams.value.current = 1;
  proxy.$refs["operLogRef"].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.logId);
  multiple.value = !selection.length;
}
/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 详细按钮操作 */
function handleView(row) {
  open.value = true;
  form.value = row;
}
/** 删除按钮操作 */
function handleDelete(row) {
  const operIds = row.logId || ids.value.join(',');
  proxy.$modal.confirm('是否确认删除日志数据?').then(function () {
    return delOperLog(operIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 清空按钮操作 */
function handleClean() {
  proxy.$modal.confirm("是否确认清空所有操作日志数据项?").then(function () {
    return cleanOperLog();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("清空成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("user/log/OPERATE_LOG/export", {
    ...queryParams.value,
    current: -1,
    size: -1
  }, `操作日志_${new Date().getTime()}.xlsx`);
}

getList();
</script>

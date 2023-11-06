<template>
  <div class="app-container">
    <el-row>
      <el-col :xs="24">
        <!--搜索条件-->
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
          <el-row justify="start">
            <el-col :span="6">
              <el-form-item label="登录地址" prop="ipAddress">
                <el-input v-model="queryParams.ipAddress" placeholder="请输入登录地址" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="用户账号" prop="username">
                <el-input v-model="queryParams.username" placeholder="请输入用户账号" clearable style="width: 200px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 搜索重置按钮 -->
          <el-row justify="end">
            <el-col :span="1.5">
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 列表数据 -->
        <el-table v-loading="loading" :data="onlineList" style="width: 100%;">
          <el-table-column label="序号" width="50" type="index" align="center">
            <template #default="scope">
              <span>{{ (queryParams.current - 1) * queryParams.size + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="登陆账号" align="center" prop="username" :show-overflow-tooltip="true" />
          <el-table-column label="用户姓名" align="center" prop="realName" :show-overflow-tooltip="true" />
          <el-table-column label="主机" align="center" prop="ipAddress" :show-overflow-tooltip="true" />
          <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
          <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
          <el-table-column label="登录时间" align="center" prop="loginTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Delete" @click="handleForceLogout(scope.row)"
                v-hasPermi="['monitor:online:forceLogout']">强退</el-button>
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

<script setup name="Online">
import { forceLogout, list as initData } from "@/api/monitor/online";

const { proxy } = getCurrentInstance();

const onlineList = ref([]);
const loading = ref(true);
const total = ref(0);

const queryParams = ref({
  current: 1,
  size: 10,
  ipAddress: undefined,
  username: undefined
});

/** 查询登录日志列表 */
function getList() {
  loading.value = true;
  initData(queryParams.value).then(response => {
    onlineList.value = response.records;
    total.value = response.total;
    loading.value = false;
  });
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
/** 强退按钮操作 */
function handleForceLogout(row) {
  proxy.$modal.confirm('是否确认强退名称为"' + row.username + '"的用户?').then(function () {
    return forceLogout(row.onlineId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

getList();
</script>

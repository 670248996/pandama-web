<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.dictCode)">
        <span
          v-if="item.elTagType == 'default' || item.elTagType == ''"
          :key="item.dictCode"
          :index="index"
          :class="item.elTagClass"
        >{{ item.dictName }}</span>
        <el-tag
          v-else
          :disable-transitions="true"
          :key="item.dictCode + ''"
          :index="index"
          :type="item.elTagType === 'primary' ? '' : item.elTagType"
          :class="item.elTagClass"
        >{{ item.dictName }}</el-tag>
      </template>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  // 数据
  options: {
    type: Array,
    default: null,
  },
  // 当前的值
  value: [Number, String, Array, Boolean],
})

const values = computed(() => {
  if (props.value === null || typeof props.value == 'undefined') {
    return [];
  } else if (typeof props.value == 'boolean') {
    return Array.isArray(props.value) ? props.value : [props.value]
  } else {
    return Array.isArray(props.value) ? props.value : [String(props.value)];
  }
})

</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
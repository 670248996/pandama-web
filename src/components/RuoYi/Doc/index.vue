<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://codeup.aliyun.com/634626d8b765641dc6177700/gientech-iot-dev/gientech-iot-framework.git');

function goto() {
  window.open(url.value)
}
</script>
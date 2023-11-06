<template>
    <div ref="childSystem" :y_data="y_data" :x_data="x_data"></div>
</template>
   
<script setup name="Statistics">
import * as echarts from 'echarts';
import { ref, nextTick, getCurrentInstance, watch } from 'vue';

const { proxy } = getCurrentInstance()

const props = defineProps({
    y_data: {
        required: true,
        type: Array,
        default: Array.from({ length: 7 }, (v, k) => k)
    },
    x_data: {
        required: true,
        type: Array,
        default() {
            // 生成最近7天的日期字符串数组
            const dateArray = [];
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() - i);
                const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
                const day = ("0" + currentDate.getDate()).slice(-2);
                const dateString = month + "/" + day;
                dateArray.push(dateString);
            }
            return dateArray
        }
    }
})

const childSystem = ref(null)

// 指定图表的配置项和数据
const option = {
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: function (parms) {
            const str =
                parms[0].axisValue +
                "</br>" +
                parms[0].marker +
                "当日登录：" +
                parms[0].value + '次'
            return str;
        },

    },
    color: ["#7BA9FA", "#4690FA"],
    grid: {
        containLabel: true,
        left: "10%",
        top: "20%",
        bottom: "10%",
        right: "10%",
    },
    xAxis: {
        type: "category",
        data: props.x_data,
        axisLine: {
            lineStyle: {
                color: "#333",
            },
        },
        axisTick: {
            show: false,
        },
        axisLabel: {
            margin: 20 //刻度标签与轴线之间的距离。
        },
    },
    yAxis: {
        name: '活跃人数',
        type: "value",
        axisLine: {
            show: true,
            lineStyle: {
                color: "#B5B5B5",
            },
        },
        splitLine: {
            lineStyle: {
                // 使用深浅的间隔色
                color: ["#B5B5B5"],
                type: "dashed",
                opacity: 0.5,
            },
        },
        axisLabel: {},
        minInterval: 1,
    },
    series: [{
        data: props.y_data,
        stack: "zs",
        type: "bar",
        barMaxWidth: "auto",
        barWidth: 20,
        itemStyle: {
            color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                type: "linear",
                global: false,
                colorStops: [{
                    offset: 0,
                    color: "#5EA1FF",
                },
                {
                    offset: 1,
                    color: "#90BEFF",
                },
                ],
            },
        },
    },

    //下面的立体,控制颜色是color第一个
    {
        data: props.y_data,
        type: "pictorialBar",
        barMaxWidth: "10",
        symbol: "diamond",
        symbolOffset: [0, "50%"],
        symbolSize: [20, 15],
        zlevel: 2,
    },
    //上面的立体,控制颜色是color第二个
    {
        data: props.y_data,
        type: "pictorialBar",
        barMaxWidth: "10",
        symbolPosition: "end",
        symbol: "diamond",
        symbolOffset: [0, "-50%"],
        symbolSize: [20, 12],
        zlevel: 2,
    }
    ],
}

function initChart() {
    nextTick(() => {
        const myChart = echarts.init(childSystem.value);
        // 使用配置项和数据显示图表。
        myChart.setOption(option)
    })
}

initChart()
</script>
   
<style lang='scss' scoped></style>
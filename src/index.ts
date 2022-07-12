// @ts-nocheck
import { reactive } from "./reactivity/reactive";
import { effect } from "./reactivity/effect";
import { ref } from "./reactivity/ref";
import { computed } from "./reactivity/computed";

// 常规模式 + 对象嵌套
const testdemo = (window.testdemo = reactive({
    count: 1,
    depObj: {
        count: 2
    }
}));
effect(() => {
    console.log('testdemo.count', testdemo.count);
});
effect(() => {
    console.log('testdemo.depObj.count', testdemo.depObj.count);
});

// 数组
// const testdemo = (window.testdemo = reactive([1,2,3]));
// effect(() => {
//     console.log('testdemo[4] ', testdemo[4]);
// });
// effect(() => {
//     console.log('testdemo.length ', testdemo.length);
// });

// 嵌套effect
// const testdemo = (window.testdemo = reactive({
//     count1: 1,
//     count2: 2
// }));
// effect(() => {
//     effect(() => {
//         console.log('testdemo.count2 ', testdemo.count2);
//     });
//     console.log('testdemo.count1 ', testdemo.count1);
// });

// ref 测试
// const testdemo = (window.testdemo = ref(2));
// effect(() => {
//     console.log('testdemo.value ', testdemo.value);
// });

// computed 测试
// const testdemo = (window.testdemo = ref(2));
// const c = (window.c = computed(() => {
//     console.log('testdemo.value ', testdemo.value);
//     return testdemo.value * 3;
// }));


// 该参数用来记录此时执行的 effect内传入的方法，用来记录存储
let activeEffect;
// 使用栈的方式存储effect触发的嵌套情形，避免出现嵌套effect最终导致 activeEffect指向方法错误，最终变量监听修改的变量会有问题
const effctStack = [];
export function effect(fn, options: any = {}) {
    const effectFn = () => {
        /**
         * 这里记录进行进栈出栈操作，并且记录此时记录的activeEffect
         * 在fn执行时查找会调用方法，并触发相应依赖变量的get方法
         * 这里的方法执行有点诡异，在try finally中，如果有return会在finally执行后再return。 
         * try中return并不会截断finally的执行，但是如果return是方法，它会在finally中代码之前执行
         * ps: 呐呐呐，面试题这不就来了。但是一般谁tm会注意这个啊
        */
        try {
            activeEffect = effectFn;
            effctStack.push(effectFn);
            return fn()
        } finally {
            effctStack.pop();
            activeEffect = effctStack[effctStack.length - 1];
        }
    }
    // lazy 用来控制是否进行首次执行回调fn
    // 例如effect方法注册时会自动执行一次，可是computed并不会一声明就执行，只有该computed所声明的变量被引用时才会执行，并做依赖收集
    if(!options.lazy) {
        effectFn();
    }
    // scheduler 控制权交出，computed等方法会自定义一些逻辑在里面
    effectFn.scheduler = options.scheduler;
    return effectFn;
}



// targetMap 用来存储所有监听的对象哈希映射，WeakMap 弱引用，防止内存泄漏。
let targetMap = new WeakMap();
// 依赖收集
export function track(target, key) {
    if(!activeEffect) return;
    // depsMap 用来存储监听对象(完整数据对象，例如reactive括号内声明的完整变量)
    let depsMap = targetMap.get(target);
    // 如果没有监听过该对象，就将它添加到targetMap中 并将其值为一个新的map
    if(!depsMap) targetMap.set(target, (depsMap = new Map()));
    // deps 用来存储此时depsMap 这个map中是否有过某个值的引用 例如引用了reactive括号内声明的某个变量
    let deps = depsMap.get(key);
    // 如果没有该对象属性的监听，那么就声明一个set
    if(!deps) depsMap.set(key, (deps = new Set()));
    // 利用set的不重复特性，存储当前的执行方法，例如每个computed内部的方法，都是一个新的执行方法。
    // 将这些方法收集到set中存下来，当触发某个变量的set方法时 再遍历这里存储的deps就可以更新所有的变量变化了
    deps.add(activeEffect);
}

// 触发更新
export function trigger(target, key) {
    // 和track一一对应的逻辑，取出相应变量之前存储的所有方法，并且遍历执行，这样就可以更新所有computed中修改的值了
    const depsMap = targetMap.get(target);
    if(!depsMap) return;
    const deps = depsMap.get(key);
    if(!deps) return;
    deps.forEach(effectFn => {
        if(effectFn.scheduler) {
            effectFn.scheduler()
        } else {
            effectFn();
        }
    });
}

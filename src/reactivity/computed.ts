import { effect, trigger, track } from "./effect";
export function computed(getterOrOption) {
    // 这里的setter、getter的逻辑是用来扩充getterOrOption如果有set和get的时候增加配置
    let getter = getterOrOption;
    let setter = () => {
        console.warn('computed is readonly');
    }
    return new ComputedImpl(setter, getter)
}
class ComputedImpl {
    private _setter: () => void;
    private effect: () => void;
    private _value: any;
    private _dirty: boolean;
    
    constructor(setter, getter) {
        this._setter = setter;
        this._value = undefined;
        // 加个锁，如果没有变化就不要频繁触发修改
        this._dirty = true;
        this.effect = effect(getter, {
            // computed 首次声明时，传入方法并不会真正执行，只有引用的时候才会执行
            lazy: true,
            scheduler: () => {
                if (!this._dirty) {
                    this._dirty = true;
                    trigger(this, 'value');
                }
            },
        });
    }
    get value() {
        if (this._dirty) {
            this._value = this.effect();
            this._dirty = false; 
            track(this, 'value');
        }
        return this._value;
    }
    set value(newValue) {
        this._setter();
    }
}
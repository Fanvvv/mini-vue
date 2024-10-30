const person = {
  name: "John",
  get aliasName() { // this 指向的是 person 对象
    return this.name + " Doe";
  },
};

const proxy = new Proxy(person, {
    get(target, prop, receiver) {
        console.log("proxy get: " + prop);
        return target[prop];
    },
    set(target, prop, value, receiver) {
        target[prop] = value;
        return true;
    },
});
// 这样我们只监控到了 aliasName 的取值，name的取值操作监控不到
console.log("proxy: " + proxy.aliasName); // 取 aliasName 属性时，触发了获取 name 的操作

const person2 = {
    name: "Fan",
    get aliasName() { // this 指向的是 person2 对象
        return this.name + " fan";
    },
};

const proxy2 = new Proxy(person2, {
    get(target, prop, receiver) {
        console.log("proxy2 get: " + prop);
        return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
    }
})
console.log("proxy2: " + proxy2.aliasName);
// 收集器
class Dep{
    constructor(){
        this.subs = [];
    }
    addSub(sub){
        this.subs.push(sub);
    }
    notify(newValue){
        this.subs.forEach(sub=>{
            sub.update(newValue);
        })
    }
}

// 订阅者
class Watcher{
    constructor(data,key,cb){
        this.cb = cb;
        Dep.target = this;  //watcher自身
        data[key];  //触发get 收集了
        Dep.target =  null;
    }
    update(newValue){
        this.cb(newValue);
    }
}


// 收集器
// let dep = new Dep();

// let w1 = new Watcher(newValue=>{
//     console.log("w1",newValue)
// });
// let w2 = new Watcher(newValue=>{
//     console.log("w2",newValue)
// });
// let w3 = new Watcher(newValue=>{
//     console.log("w3",newValue)
// });

// dep.addSub(w1);
// dep.addSub(w2);
// dep.addSub(w3);

// 触发 
// setTimeout(()=>{
//     dep.notify("新值");
// },1000)





let data = {
    message:"测试数据",
    mydata:"我的数据"
}
let deps = [];

function Observe(data){
    let keys = Object.keys(data);
        keys.forEach(key=>{
            let value = data[key];
            let dep = new Dep();
            dep['key'] = key;
            Object.defineProperty(data,key,{
                configurable:true,
                enumerable:true,
                get(){
                    console.log("get");
                    // 收集watcher；
                    if(Dep.target){
                        dep.addSub(Dep.target); 
                    }
                    deps.push(dep);
                    return value;
                },
                set(newValue){
                    dep.notify(newValue)
                    value = newValue;
                }
            })
        })
}

Observe(data);
console.log(data);

function compile(){
    // 实例化同时 触发get；
    new Watcher(data,"message",newValue=>{
        console.log("message",newValue);
    });

    //人为触发get
    // data.message;
    // data.message;
    // new Watcher(data,"mydata",newValue=>{
    //     console.log("message",newValue);
    // });
}
compile();
console.log(deps);
// data.mydata = "修改的值";




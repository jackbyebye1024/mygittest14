// 根据数据生成 dep 收集器  ; dep -->收集订阅者 Watcher  ; set 触发 dep-->notify-->  Watcher -->update(回调)

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

class Vue{
    constructor(options){
        this.$options = options;
        this._data = this.$options.data;
        this.observe(this._data);
        this.compile();
    }
    observe(data){
        let temp = {};
        this._data = new Proxy(data,{
            get(target,key){
                if(typeof temp[key] === "undefined"){
                    temp[key] = new Dep();
                }
                if(Dep.target){
                    temp[key].addSub(Dep.target);
                }
                return Reflect.get(target,key);
            },
            set(target,key,newValue){
                temp[key].notify(newValue);
                return Reflect.set(target,key,newValue);
            }
        })

    }


    // observe(data){
    //     let keys = Object.keys(data);
    //     keys.forEach(key=>{
    //         // message dep:数据 [w1,w2]（编译）  mydata dep [w1,w2]（编译）;
    //         let dep  = new Dep();
    //         let value = data[key];
    //         Object.defineProperty(data,key,{
    //             configurable:true,
    //             enumerable:true,
    //             get(){
    //                 console.log("get");
    //                 // 收集watcher 
    //                 if(Dep.target){
    //                     dep.addSub(Dep.target)
    //                 }
    //                 // return data[key];
    //                 return value;
    //             },
    //             set(newValue){
    //                 console.log("set",dep);
    //                 dep.notify(newValue);
    //                 value = newValue;
    //             }
    //         })
    //     })
    // }
    compile(){
        let eles = document.querySelector(this.$options.el);
        this.compileNodes(eles);
    }
    compileNodes(eles){
        let childNodes = eles.childNodes;
        // console.log(childNodes);
        childNodes.forEach(node=>{
            if(node.nodeType===1){
                // console.log("元素");
                if(node.childNodes.length>0){
                    this.compileNodes(node);
                }
                let attrs = node.attributes;
                // console.log(attrs)
                [...attrs].forEach(attr=>{
                    let attrName = attr.name;
                    let attrValue = attr.value;
                    // console.log(attrName,attrValue);
                    if(attrName==="v-model"){
                        node.value = this._data[attrValue];
                        node.addEventListener("input",e=>{
                            let newValue = e.target.value;
                            // console.log(value);
                            // 自动响应式？？触发set
                            this._data[attrValue] = newValue;
                        })
                    }else if(attrName==="v-html"){
                        
                        node.innerHTML =  this._data[attrValue];
                        new Watcher(this._data,attrValue,newValue => {
                            node.innerHTML = newValue;
                        })
                    }else if(attrName==="v-text"){
                        // node.innerTEXT
                        node.innerText =  this._data[attrValue];
                        new Watcher(this._data,attrValue,newValue => {
                            node.innerHTML = newValue;
                        })
                    }
                })
            }else if(node.nodeType===3){
                // console.log("文本");
                let textContent = node.textContent;
                // console.log(textContent);
                let reg = /\{\{\s*([^\{\}\s]+)\s*\}\}/g;
                if(reg.test(textContent)){
                    console.log("有大胡子");
                    let $1 = RegExp.$1;
                    // console.log("("+$1+")")
                    // console.log(this._data[$1]);
                    node.textContent = node.textContent.replace(reg,this._data[$1]);
                    // 生成watcher同时 触发 get收集自身
                     new Watcher(this._data,$1,(newValue)=>{
                        console.log("触发了cb",newValue);
                        let oldValue = this._data[$1];
                        let reg = new RegExp(oldValue,"g");
                        node.textContent = node.textContent.replace(reg,newValue);
                    })
                    // dep.addSub(watcher);
                }

            }
        })
    }   
}
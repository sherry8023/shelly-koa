'use strict'
const redis = require('ioredis')
const uid = require('uid-safe')
class Store {
   constructor() { 
      this.redis = new redis()   //默认 127.0.0.1 6379端口
    }
    getId(length) {
        return uid.sync(length)  //生成id
    }
    get(sid) {  //实现get方法
        return this.redis.get(`session-${sid}`).then((resp) => {
            try { //如果返回结果不是json字符串，返回空
                return Promise.resolve(JSON.parse(resp)) 
            } catch(e) {
                return Promise.resolve({})
            }
       })
    }  
    set(session, opts) {  //实现set方法
        if(!opts.sid) {
            opts.sid = this.getId(24)
        }
        //存入redis要将对象转成JSON字符串
        //存入redis的key为： session-uid
        return this.redis.set(`session-${opts.sid}`, JSON.stringify(session)).then(() => {
            return Promise.resolve(opts.sid)
        })
    }
    destroy(sid) {  //实现distroy方法
        return this.redis.del(`session-${sid}`)
    }
}
module.exports = Store
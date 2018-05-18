const co = require('co')
const fs = require('fs')
const router = require('koa-router')
const log4js = require('koa-log4')
const route =new router()
const logger = log4js.getLogger('router')
let filePath = './user.json'
let readFromFile = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if(err){
                reject(err)
            }
            resolve(data)
        })
    })
}
let writeToFile = (content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, err => {
            if(err){
                reject(err)
            }
            resolve({state: 'ok'})
        })
    })
}
route.get('/', co.wrap(function* (ctx){
    logger.debug('this is test log')
    if(ctx.session.view === undefined){
        ctx.session.view = 0
    }else{
        ctx.session.view += 1
    }
    console.log('viewNum', ctx.session.view)
    yield ctx.render('index', {title: 'Nunjucks'})
}))
route.get('/api/user', co.wrap(function* (ctx, next){
    try{
        let users = JSON.parse(yield readFromFile())
        ctx.body = JSON.stringify({status: 'success', data: users})
    }catch(err){
        logger.error('err', err)
        ctx.status = 500
        ctx.body = JSON.stringify({status: 'failed'})
    }
}))
route.post('/api/user', co.wrap(function* (ctx, next){
    let newUser = {}
    newUser.name = ctx.request.body.name
    newUser.age = ctx.request.body.age
    try{
        let users = JSON.parse(yield readFromFile())
        users.push(newUser)
        yield writeToFile(JSON.stringify(users))
        ctx.body = JSON.stringify({status: 'success'})
    }catch(err){
        logger.error('err', err)
        ctx.status = 500
        ctx.body = JSON.stringify({status: 'failed'})
    }
}))
route.patch('/api/user/:name', co.wrap(function* (ctx, next) {
    let name = ctx.params.name //获取url中携带的参数
    let age = ctx.request.body.age //获取请求body中的参数
    try {
        let users = JSON.parse(yield readFromFile())
        for(let i=0; i<users.length; i++) { //更新数据
            if(users[i].name === name) {
                users[i].age = age
                break
            }
        }
        yield writeToFile(JSON.stringify(users))
        ctx.body = JSON.stringify({status: 'success'})
    } catch(err) {
        logger.error('err', err)
        ctx.status = 500
        ctx.body = JSON.stringify({status: 'failed'})
    }
}))
//API DELETE, 删除数据
route.del('/api/user/:name', co.wrap(function* (ctx, next) {
    let name = ctx.params.name  //获取url参数
    try {
        let users = JSON.parse(yield readFromFile())
        for(let i=0; i<users.length; i++) {  //删除name所指数据
            if(users[i].name === name) {
                users.splice(i, 1)
                break
            }
        }
        yield writeToFile(JSON.stringify(users))
        ctx.body = JSON.stringify({status: 'success'})
    } catch(err) {
        logger.error('err', err)
        ctx.status = 500
        ctx.body = JSON.stringify({status: 'failed'})
    }
}))
module.exports = route  //导出模块
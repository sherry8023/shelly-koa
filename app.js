const Koa = require('koa')
const co = require('co')
const nunjucksViews = require('koa-nunjucks-promise')
// const router = require('koa-router')
const mount = require('koa-mount')
const server = require('koa-static')
const session = require('koa-session2')
const bodyParser = require('koa-bodyparser')
const log4js = require('koa-log4')

require('./log.js')
const logger = log4js.getLogger('app')
logger.info('---------------step into koa---------------')
const route = require('./router.js')

const store = require('./store.js')
const app = new Koa()
// const route = new router()

app.use(nunjucksViews(`${__dirname}/views`,{
    ext: 'html',
    noCache: true,
    watch: true,
    filters: {
        json: function(str){
            return JSON.stringify(str, null, 2)
        }
    },
    globals:{

    }
}))
app.use(mount('/static', server(`${__dirname}/public`)))
app.use(log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }))
app.use(session({
   key: "sessionId",   //default "koa:sess",
   store: new store(),  //添加 store 配置项
   maxAge: 5000  //设置session超时时间
}))
// route.get('/', co.wrap(function* (ctx) {
//     logger.debug('this is test log')
//     if(ctx.session.view === undefined){
//         ctx.session.view = 0
//     }else{
//         ctx.session.view += 1
//     }
//     console.log('viewNum', ctx.session.view)
//     yield ctx.render('index', {title: 'Nunjucks', content: 'Feifeiyu yeah!'})
// }))
// route.get('/route/test', co.wrap(function* (ctx) {
//     logger.info('this is test log2')
//     ctx.body = 'shelly'
// }))
app.use(bodyParser())

app.use(route.routes())
 .use(route.allowedMethods())
app.listen(3000, () => console.log('server started, port 3000'))
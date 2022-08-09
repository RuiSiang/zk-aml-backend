import Koa from 'koa'
const app = new Koa()
import json from 'koa-json'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import index from './routes/index'
import entryRoute from './routes/entry-route'

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
)
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

// logger
app.use(async (ctx: Koa.Context, next: Koa.Next) => {
  const start: any = new Date()
  await next()
  const last: any = new Date()
  const ms: any = last - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
// routes
app.use(index.routes())
app.use(entryRoute.routes())

// error-handling
app.on('error', (err: any, ctx: any) => {
  console.error('server error', err, ctx)
})

module.exports = app

import Koa from 'koa'
import Router from 'koa-router'
const router = new Router()
import Entry from '../src/entry-service'

router.prefix('/entries')

router.use('/', async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
  //console.log("test");
  await next()
})

router.get('/list', async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
  if (!ctx.query.org) {
    ctx.status = 400
    return
  }
  const data = await Entry.getEntries(ctx.query.org)
  ctx.body = data
})

router.post('/new', async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
  Entry.newEntry(ctx.request.body)
  ctx.status = 200
})

// router.get('/view', async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
//   const data = await File.viewFile(ctx.query)
//   ctx.status = 200
//   ctx.body = data
// })

export default router

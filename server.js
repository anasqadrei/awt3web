const Koa = require('koa')
const next = require('next')
const Router = require('koa-router')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
  const server = new Koa()
  const router = new Router()

  router.get('/playlist/:id/:slug', async ctx => {
    await app.render(ctx.req, ctx.res, '/playlist', Object.assign(ctx.params, ctx.query))
    ctx.respond = false
  })

  router.get('/hashtag/:hashtag', async ctx => {
    await app.render(ctx.req, ctx.res, '/hashtag', Object.assign(ctx.params, ctx.query))
    ctx.respond = false
  })

  router.get('/artist/:id(\\d+)/:slug?', async ctx => {
    await app.render(ctx.req, ctx.res, '/artist', Object.assign(ctx.params, ctx.query))
    ctx.respond = false
  })

  router.get('/song/:id/:slug', async ctx => {
    await app.render(ctx.req, ctx.res, '/song', Object.assign(ctx.params, ctx.query))
    ctx.respond = false
  })

  router.get('/blogpost/:id/:slug', async ctx => {
    await app.render(ctx.req, ctx.res, '/blogpost', Object.assign(ctx.params, ctx.query))
    ctx.respond = false
  })

  router.get('/user/:id/:slug', async ctx => {
    await app.render(ctx.req, ctx.res, '/user', Object.assign(ctx.params, ctx.query))
    ctx.respond = false
  })

  router.get('/user/:id/:slug/uploads', async ctx => {
    await app.render(ctx.req, ctx.res, '/user-uploads', Object.assign(ctx.params, ctx.query))
    ctx.respond = false
  })

  router.get('*', async ctx => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200
    await next()
  })

  server.use(router.routes())
  server.listen(3003, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3003')
  })
})

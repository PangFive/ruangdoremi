/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DiscordLogger from '@ioc:Logger/Discord'
import { honeypotConfig } from 'Config/honeypot'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected disableStatusPagesInDevelopment = true

  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor () {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if (error.code === 'E_VALIDATION_FAILURE' && ctx.up.isUnpolyRequest) {
      await super.handle(error, ctx)
      
      ctx.up.setTarget(ctx.up.getFailTarget())
      ctx.up.setStatus(400)
      
      return ctx.response.redirect().back()
    }

    if (error.code === 'E_BAD_CSRF_TOKEN') {
      return this.handleExpiredCsrf(ctx)
    }

    if (!error.status || this.expandedStatusPages[error.status]) {
      ctx.up.fullReload()
    }

    return super.handle(error, ctx)
  }

  public async report(error: any, ctx: HttpContextContract) {
    if (!this.shouldReport(error)) {
      return
    }

    ctx.logger.error({ url: ctx.request.url(true), userId: ctx.auth?.user?.id, ...error }, error.message)

    if (error.code === 'E_TOO_MANY_REQUESTS') return
    if (error.code === 'E_HONEYPOT_FAILURE' && ctx.request.url() === '/contact') return
    if (error.code === 'E_CANNOT_READ_FILE' && ctx.request.url() === '/img/178/VSCode_1614756076826.png') return
    if (error.code === 'E_BAD_CSRF_TOKEN') return

    if (error.code === 'E_HONEYPOT_FAILURE') {
      const { phone, ...honeyFields } = ctx.request.only(honeypotConfig.fields)
      await DiscordLogger.error(error.message, {
        requestUrl: ctx.request.url(true),
        ...honeyFields
      })
      return
    }
    
    await DiscordLogger.error(error.message, {
      method: ctx.request.method,
      url: ctx.request.url(true)
    })
  }

  public async handleExpiredCsrf(ctx: HttpContextContract) {
    if (!ctx.request.accepts(['json'])) {
      ctx.session.reflashExcept(['password'])
      ctx.session.flash('warn', "Your session was expired. We've refresh your session, please try again.")
      return ctx.response.redirect().withQs().back()
    }

    return ctx.response.status(419)
  }
}

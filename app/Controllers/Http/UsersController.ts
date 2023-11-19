import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HistoryService from 'App/Services/HistoryService'
import NotificationService from 'App/Services/NotificationService'
import WatchlistService from 'App/Services/WatchlistService'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import Role from 'App/Models/Role'
import UserRoleValidator from 'App/Validators/UserRoleValidator'
import UserService from 'App/Services/UserService'

export default class UsersController {
  public async menu({ response, view, auth }: HttpContextContract) {
    const notifications = await NotificationService.getForUser(auth.user)

    await NotificationService.markAsRead(notifications.unread)

    if (notifications.unread.length) {
      response.header('X-Up-Clear-Cache', '/users/*')
    }

    return view.render('pages/users/menu', { notifications })
  }

  public async watchlist({ view, auth }: HttpContextContract) {
    const posts = await WatchlistService.getLatestPosts(auth.user!)
    const collections = await WatchlistService.getLatestCollections(auth.user!)

    return view.render('pages/users/watchlist', { posts, collections })
  }

  public async history({ view, auth }: HttpContextContract) {
    const posts = await HistoryService.getLatestPostProgress(auth.user!)
    const collections = await HistoryService.getLatestSeriesProgress(auth.user!)

    return view.render('pages/users/history', { posts, collections })
  }

  public async check({ auth }: HttpContextContract) {
    return !!auth.user
  }

  public async billto({ request, response, auth }: HttpContextContract) {
    const _schema = schema.create({
      billToInfo: schema.string.nullableAndOptional([rules.maxLength(500)])
    })

    let clearedBillTo = false
    let { billToInfo } = await request.validate({ schema: _schema })
    let user = auth.user!

    if (billToInfo == '\n') {
      billToInfo = null
      clearedBillTo = true
    }

    await user.merge({ billToInfo }).save()

    return response.status(200).json({ clearedBillTo, billToInfo })
  }

  public async index({ view, request, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('viewUsers')

    const page = request.input('page', 1)
    const users = await User.query()
      .preload('profile')
      .orderBy('createdAt', 'desc')
      .paginate(page, 100)

    users.baseUrl(Route.makeUrl('studio.users.index'))

    return view.render('studio/users/index', { users })
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({ view, params, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('viewUsers')

    const roles = await Role.all()
    const user = await User.findOrFail(params.id)
    const profile = await user.related('profile').query().firstOrFail()
    const invoices = await user.related('invoices').query().orderBy('updatedAt', 'desc')

    return view.render('studio/users/show', { roles, user, profile, invoices })
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async role({ request, response, params, session, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const data = await request.validate(UserRoleValidator)
    const user = await User.findOrFail(params.id)
    const oldRole = await user.related('role').query().firstOrFail()
    const newRole = await Role.findOrFail(data.roleId)

    await user.merge(data).save()

    session.flash('success', 'Role updated successfully')

    await UserService.sendRoleUpdateNotification(user, newRole, oldRole)

    return response.redirect().toRoute('studio.users.show', { id: params.id })
  }

  public async destroy({}: HttpContextContract) {}
}

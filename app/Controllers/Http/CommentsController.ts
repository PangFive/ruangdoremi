import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import States from 'App/Enums/States'
import CommentService from 'App/Services/CommentService'
import CommentValidator from 'App/Validators/CommentValidator'

export default class CommentsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const data = await request.validate(CommentValidator)
    const referrer = request.header('referrer')

    const comment = await CommentService.store(request, auth, data)

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  public async update({ request, response, params, bouncer }: HttpContextContract) {
    const data = request.only(['body'])
    const comment = await Comment.findOrFail(params.id)
    const referrer = request.header('referrer')

    await bouncer.with('CommentPolicy').authorize('update', comment)
    await CommentService.update(comment, data)

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  public async like({ params, response, auth }: HttpContextContract) {
    await CommentService.likeToggle(auth, params.id)

    return response.redirect().back()
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('delete', comment)

    await CommentService.destroy(comment)

    return response.redirect().back()
  }

  public async index({ view, request, auth, params }: HttpContextContract) {
    const page = request.input('page', 1)
    const comments = await Comment.query()
      .if(params.stateId,
          q => q.where('stateId', params.stateId),
          q => q.whereNot('stateId', States.ARCHIVED))
      .where(query => query
        .whereHas('post', query => query.whereHas('authors', q => q.where('users.id', auth.user!.id)))
        .orWhereHas('parent', query => query.where('userId', auth.user!.id))
      )
      .preload('user')
      .preload('post')
      .orderBy('created_at', 'desc')
      .paginate(page, 10)

    comments.baseUrl('/comments')

    return view.render('studio/comments/index', { comments })
  }

  public async state({ response, params, bouncer, session }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('state', comment)

    if (!Object.values(States).includes(params.stateId)) {
      session.flash('error', "State provided was invalid. Please provide a valid state to set the comment to.")
      return response.redirect().back()
    }

    await comment.merge({ stateId: params.stateId }).save()

    session.flash('success', "Comment state successfully updated.")

    return response.redirect().back()
  }
}

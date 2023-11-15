/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

/**
 * images
 */
Route.get('/img/:userId/:filename', 'AssetsController.show').as('userimg')
Route.get('/img/*', 'AssetsController.show').where('path', /.*/).as('img')

Route.group(() => {
  // PUBLIC -- Redirects from old
  Route.on('/topics/adonisjs-5').redirectToPath('/topics/adonisjs')
  Route.on('/topics/adonis-5').redirectToPath('/topics/adonisjs')
  Route.on('/series/lets-learn-adonis-5').redirectToPath('/series/lets-learn-adonisjs-5')



  /**
   * auth
   */
  Route.get('/signin', 'AuthController.signin').as('auth.signin').middleware(['guest'])
  Route.post('/signin', 'AuthController.authenticate').as('auth.authenticate').middleware(['guest'])
  Route.get('/signup', 'AuthController.signup').as('auth.signup').middleware(['guest'])
  Route.post('/signup', 'AuthController.register').as('auth.register').middleware(['guest', 'turnstile'])
  Route.post('/signout', 'AuthController.signout').as('auth.signout')



  /**
   * auth social
   */
  Route.get('/:provider/redirect', 'AuthSocialController.redirect').as('auth.social.redirect')
  Route.get('/:provider/callback', 'AuthSocialController.callback').as('auth.social.callback')
  Route.get('/:provider/unlink', 'AuthSocialController.unlink').as('auth.social.unlink').middleware(['auth'])



  /**
   * password reset
   */
  Route.get('/forgot-password', 'PasswordResetController.forgotPassword').as('auth.password.forgot');
  Route.get('/forgot-password/sent', 'PasswordResetController.forgotPasswordSent').as('auth.password.forgot.sent')
  Route.post('/forgot-password', 'PasswordResetController.forgotPasswordSend').as('auth.password.forgot.send').middleware('turnstile')
  Route.get('/reset-password/:email', 'PasswordResetController.resetPassword').as('auth.password.reset');
  Route.post('/reset-password', 'PasswordResetController.resetPasswordStore').as('auth.password.reset.store')



  /**
   * email verification
   */
  Route.post('/verification/email/send', 'EmailVerificationController.send').as('verification.email.send').middleware(['auth'])
  Route.get('/verification/email/:email', 'EmailVerificationController.verify').as('verification.email.verify')



  /**
   * user settings
   */
  Route.get('/settings/:section?', 'UserSettingsController.index').as('users.settings.index').middleware(['auth'])
  Route.get('/settings/invoices/:invoice', 'UserSettingsController.invoice').as('users.settings.invoice').middleware(['auth'])
  Route.patch('/users/update/username', 'UserSettingsController.updateUsername').as('users.update.username').middleware(['auth'])
  Route.put('/users/update/email', 'UserSettingsController.updateEmail').as('users.update.email').middleware(['auth'])
  Route.get('/users/revert/:id/:oldEmail/:newEmail', 'UserSettingsController.revertEmail').as('users.revert.email')
  Route.put('/users/notifications/email', 'UserSettingsController.updateNotificationEmails').as('users.notifications.email')
  Route.get('/users/:userId/notifications/:field/off', 'UserSettingsController.disableNotificationField').as('users.notifications.disable.field')
  Route.get('/users/:userId/notifications/off', 'UserSettingsController.disableNotifications').as('users.notifications.disable')
  Route.delete('/users/delete', 'UserSettingsController.deleteAccount').as('users.destroy')
  Route.put('/users/profile', 'ProfilesController.update').as('users.profiles.update').middleware(['auth'])
  Route.put('/users/preferences', 'PreferencesController.update').as('users.preferences.update').middleware(['auth'])
  Route.delete('/users/sessions/:id?', 'SessionsController.destroy').as('users.sessions.destroy').middleware(['auth'])



  /**
   * main pages
   */
  Route.get('/:username', 'ProfilesController.show').as('profiles.show').where('username', /^@/)
  Route.get('/', 'HomeController.index').as('home.index')
  Route.get('/analytics', 'HomeController.analytics').as('analytics')
  Route.get('/pricing', 'HomeController.pricing').as('pricing')
  Route.get('/search', 'SearchController.index').as('search.index')
  Route.post('/search', 'SearchController.search').as('search.search')
  Route.get('/attributions', 'HomeController.attributions').as('attributions')
  Route.get('/series', 'SeriesController.index').as('series.index')
  Route.on('/series/lets-learn').redirectToPath('/series/lets-learn-adonisjs-5')
  Route.get('/series/:slug', 'SeriesController.show').as('series.show')
  Route.get('/series/:slug/lesson/:index',  'SeriesController.lesson').as('series.lesson')
  Route.get('/paths/:slug', 'PathsController.show').as('paths.show')
  Route.get('/paths/:slug/lesson/:index', 'PathsController.lesson').as('paths.lesson')
  Route.get('/topics', 'TopicsController.index').as('topics.index')
  Route.get('/topics/:slug', 'TopicsController.show').as('topics.show')
  Route.get('/lessons', 'LessonsController.index').as('lessons.index')
  Route.get('/lessons/:slug', 'LessonsController.show').as('lessons.show').middleware(['postTypeCheck'])
  Route.get('/paths/:collectionSlug/lessons/:slug', 'LessonsController.show').as('paths.lessons.show')
  Route.get('/series/:collectionSlug/lessons/:slug', 'LessonsController.show').as('series.lessons.show').middleware(['postTypeCheck'])
  Route.get('/streams', 'StreamsController.index').as('streams.index')
  Route.get('/streams/:slug', 'StreamsController.show').as('streams.show').middleware(['postTypeCheck'])
  Route.get('/paths/:collectionSlug/streams/:slug', 'StreamsController.show').as('paths.streams.show')
  Route.get('/series/:collectionSlug/streams/:slug', 'StreamsController.show').as('series.streams.show').middleware(['postTypeCheck'])
  Route.get('/news', 'NewsController.index').as('news.index')
  Route.get('/news/:slug', 'NewsController.show').as('news.show').middleware(['postTypeCheck'])
  Route.get('/blog', 'BlogController.index').as('blog.index')
  Route.get('/blog/:slug', 'BlogController.show').as('blog.show').middleware(['postTypeCheck'])
  Route.get('/snippets', 'SnippetsController.index').as('snippets.index')
  Route.get('/snippets/:slug', 'SnippetsController.show').as('snippets.show').middleware(['postTypeCheck'])
  Route.post('/comments', 'CommentsController.store').as('comments.store')
  Route.put('/comments/:id', 'CommentsController.update').as('comments.update')
  Route.patch('/comments/:id/like', 'CommentsController.like').as('comments.like')
  Route.delete('/comments/:id', 'CommentsController.destroy').as('comments.destroy')
  Route.get('/requests/lessons', 'LessonRequestsController.index').as('requests.lessons.index')
  Route.get('/requests/lessons/create', 'LessonRequestsController.create').as('requests.lessons.create').middleware('auth')
  Route.get('/requests/lessons/:id', 'LessonRequestsController.show').as('requests.lessons.show')
  Route.post('/requests/lessons', 'LessonRequestsController.store').as('requests.lessons.store').middleware('auth')
  Route.get('/requests/lessons/:id/edit', 'LessonRequestsController.edit').as('requests.lessons.edit')
  Route.put('/requests/lessons/:id', 'LessonRequestsController.update').as('requests.lessons.update').middleware('auth')
  Route.delete('/requests/lessons/:id', 'LessonRequestsController.destroy').as('requests.lessons.destroy').middleware('auth')
  Route.post('/requests/lessons/search', 'LessonRequestsController.search').as('requests.lessons.search')
  Route.patch('/requests/lessons/:id/vote', 'LessonRequestsController.vote').as('requests.lessons.vote').middleware('auth')
  Route.patch('/requests/lessons/:id/approve', 'LessonRequestsController.approve').as('requests.lessons.approve').middleware('auth')
  Route.patch('/requests/lessons/:id/reject', 'LessonRequestsController.reject').as('requests.lessons.reject').middleware('auth')
  Route.patch('/requests/lessons/:id/complete', 'LessonRequestsController.complete').as('requests.lessons.complete').middleware('auth')
  Route.get('/cookies', 'LegalsController.cookies').as('legals.cookies')
  Route.get('/privacy', 'LegalsController.privacy').as('legals.privacy')
  Route.get('/terms', 'LegalsController.terms').as('legals.terms')
  Route.get('/guidelines', 'LegalsController.guidelines').as('legals.guidelines')
  Route.get('/users/watchlist', 'UsersController.watchlist').as('users.watchlist').middleware(['auth'])
  Route.get('/users/history', 'UsersController.history').as('users.history').middleware(['auth'])
  Route.get('/contact', 'ContactController.index').as('contact.index')
  Route.post('/contact', 'ContactController.store').as('contact.store').middleware(['turnstile'])
  Route.get('/sitemap',     'SyndicationController.sitemap').as('sitemap')
  Route.get('/sitemap.xml', 'SyndicationController.xml').as('sitemap.xml')
  Route.get('/rss',         'SyndicationController.feed').as('rss')
  Route.get('/uses', 'HomeController.uses').as('uses')
  Route.get('/schedule', 'SchedulesController.index').as('schedule')
  Route.get('/schedule/:id', 'SchedulesController.show').as('schedule.show')



  /**
   * stripe routes
   */
  Route.get('/stripe/subscription/success', 'StripeSubscriptionsController.success').as('stripe.success')
  Route.post('/stripe/subscription/checkout/:slug', 'StripeSubscriptionsController.checkout').as('stripe.checkout').middleware(['auth'])
  Route.post('/stripe/subscription/portal', 'StripeSubscriptionsController.portal').as('stripe.portal').middleware(['auth'])



  /**
   * fragments, modals, drawers
   */
  Route.get('/users/menu', 'UsersController.menu').as('users.menu').middleware(['auth'])
  Route.patch('/histories/progression/toggle', 'ProgressionsController.toggle').as('histories.progression.toggle')
  Route.patch('/watchlist/:table/toggle', 'WatchlistsController.toggle').as('watchlists.toggle')
  Route.get('/fragments/requests/lessons/:id/:fragment', 'LessonRequestsController.fragment').as('requests.lessons.fragment')
  Route.get('/fragments/:fragment', 'FragmentsController.index').as('fragments.index')
  Route.get('/fragments/:fragment/:id', 'FragmentsController.show').as('fragments.show')
}).middleware(['unpoly', 'throttle:global'])

Route.post('/stripe/webhook', 'StripeWebhooksController.index')

Route.group(() => {
  /**
   * api
   */
  Route.put('/api/user/theme', 'ThemesController.update').as('api.user.theme')
  Route.get('/api/user/check', 'UsersController.check').as('api.user.check')
  Route.patch('/api/users/billto', 'UsersController.billto').as('api.users.billto').middleware(['auth'])
  Route.post('/api/session/set', 'SessionsController.set').as('sessions.set')
  Route.post('/api/history/progression/:id?', 'ProgressionsController.record').as('api.histories.progression')


  /**
   * go
   */
  Route.get('/go/posts/:id/comment/:commentId', 'GoController.postComment').as('go.posts.comment')
  Route.get('/go/post/:id/comment/:commentId', 'GoController.postComment').as('go.post.comment')
  Route.get('/go/requests/lessons/:id/comment/:commentId', 'GoController.lessonRequestComment').as('go.requests.lessons.comment')
  Route.get('/go/auth/reset', 'GoController.authReset').as('go.auth.reset')
}).middleware(['throttle:api'])

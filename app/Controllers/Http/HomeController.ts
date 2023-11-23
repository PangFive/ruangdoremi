import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CollectionService from 'App/Services/CollectionService'
import PostService from 'App/Services/PostService'
import TaxonomyService from 'App/Services/TaxonomyService'
import Post from "App/Models/Post";
import Collection from "App/Models/Collection";
import Taxonomy from "App/Models/Taxonomy";
import HistoryService from 'App/Services/HistoryService';
import Plan from 'App/Models/Plan';
import Plans from 'App/Enums/Plans';
import StripeService from 'App/Services/StripeService';
import NotAllowedException from 'App/Exceptions/NotAllowedException';
import PostTypes from 'App/Enums/PostTypes';

export default class HomeController {
  /**
   * Displays home page
   * @param param0
   * @returns
   */
  public async index({ view, auth }: HttpContextContract) {
    const trending = await PostService.getTrending(15)
    const posts = await PostService.getLatest(auth.user ? 17 : 12, [], [PostTypes.LESSON, PostTypes.LIVESTREAM])
    const blogs = await PostService.getLatest(6, [], [PostTypes.BLOG, PostTypes.NEWS])
    const snippets = await PostService.getLatest(3, [], [PostTypes.SNIPPET])
    const series = await CollectionService.getLastUpdated(3, false)
    const topics = await TaxonomyService.getList()

    const postCount = await Post.query().apply(s => s.published()).getCount()
    const seriesCount = await Collection.series().wherePublic().getCount()
    const topicCount = await Taxonomy.query().getCount()

    if (auth.user) {
      view.share({ 
        inProgressPosts: await HistoryService.getLatestPostProgress(auth.user!, 8),
        inProgressCollections: await HistoryService.getLatestSeriesProgress(auth.user!, 4)
      })
    }

    const stats = {
      postCount,
      seriesCount,
      topicCount
    }

    return view.render('pages/index', { trending, stats, posts, blogs, snippets, series, topics })
  }

  public async pricing({ view }: HttpContextContract) {
    if (!StripeService.isActive) throw new NotAllowedException("Plans are currently turned off")
    
    const plusMonthly = await Plan.findOrFail(Plans.PLUS_MONTHLY)
    const plusAnnual = await Plan.findOrFail(Plans.PLUS_ANNUAL)
    const forever = await Plan.findOrFail(Plans.FOREVER)

    return view.render('pages/pricing', {
      plusMonthly,
      plusAnnual,
      forever
    })
  }

  public async analytics({ view }: HttpContextContract) {
    return view.render('pages/analytics')
  }

  public async uses({ view }: HttpContextContract) {
    return view.render('pages/uses')
  }

  public async attributions({ view }: HttpContextContract) {
    return view.render('pages/attributions')
  }
}

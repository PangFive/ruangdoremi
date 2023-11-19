import View from '@ioc:Adonis/Core/View'
import PostTypes from 'App/Enums/PostTypes'
import Roles from 'App/Enums/Roles'
import States, { StateDesc } from 'App/Enums/States'
import Status from 'App/Enums/Status'
import Plans from 'App/Enums/Plans'
import Plan from 'App/Models/Plan'
import NotificationService from 'App/Services/NotificationService'
import PostService from 'App/Services/PostService'
import StripeService from 'App/Services/StripeService'
import UtilityService from 'App/Services/UtilityService'
import { DateTime } from 'luxon'
import HtmlParser from 'App/Services/HtmlParser'
import VideoTypes from 'App/Enums/VideoTypes'
import Env from '@ioc:Adonis/Core/Env'
import StripeSubscriptionStatuses from 'App/Enums/StripeSubscriptionStatuses'
import PaywallTypes from 'App/Enums/PaywallTypes'
import CouponDurations from 'App/Enums/CouponDurations'

import AssetService from 'App/Services/AssetService'
import { StatusDesc } from 'App/Enums/Status'
import CollectionType, { CollectionTypeDesc } from 'App/Enums/CollectionTypes'
import PostType, { PostTypeDesc } from 'App/Enums/PostType'
import Database from '@ioc:Adonis/Lucid/Database'
import { string } from '@ioc:Adonis/Core/Helpers'
import Post from 'App/Models/Post'
import Comment from 'App/Models/Comment'
import AffiliateService from 'App/Services/AffiliateService'
import Themes from 'App/Enums/Themes'
import * as timeago from 'timeago.js'
import IdentityService from 'App/Services/IdentityService'
import AssetTypes from 'App/Enums/AssetTypes'

if (Env.get('NODE_ENV') === 'test') {
  View.global('csrfField', () => '')
}

View.global('DateTime', DateTime)
View.global('Roles', Roles)
View.global('PostTypes', PostTypes)
View.global('States', States)
View.global('Status', Status)
View.global('Plans', Plans)
View.global('Plan', Plan)
View.global('VideoTypes', VideoTypes)
View.global('PaywallTypes', PaywallTypes)
View.global('StripeSubscriptionStatuses', StripeSubscriptionStatuses)
View.global('CouponDurations', CouponDurations)

View.global('NotificationService', NotificationService)

View.global('stripHTML', UtilityService.stripHTML)
View.global('getSingularOrPlural', UtilityService.getSingularOrPlural)
View.global('secondsForDisplay', UtilityService.secondsForDisplay)
View.global('secondsToTimestring', UtilityService.secondsToTimestring)
View.global('getAbbrev', UtilityService.getAbbrev)
View.global('timeago', UtilityService.timeago)
View.global('routePost', PostService.getPostPath)
View.global('formatNumber', UtilityService.formatNumber)
View.global('formatCurrency', UtilityService.formatCurrency)
View.global('displaySocialUrl', UtilityService.displaySocialUrl)
View.global('getBodyPreview', HtmlParser.getPreview)
View.global('htmlParser', HtmlParser)
View.global('stripeDateTime', StripeService.toDateTime)
View.global('assetDomain', Env.get('ASSET_DOMAIN', ''))


View.global('appUrl', (path) => {
  return Env.get('APP_DOMAIN') + path
})

View.global('affiliateService', AffiliateService)

View.global('PaywallTypes', PaywallTypes)

View.global('routePost', (post: Post, _params: { [x: string]: any }, _options: { [x: string]: any }) => {
  return post.routeUrl
})

View.global('img', AssetService.getAssetUrl)

View.global('getSingularOrPlural', (str: string, count: string|number|any[] ) => {
  let isPlural = false

  if (Array.isArray(count)) {
    isPlural = count.length == 0 || count.length > 1
  } else {
    isPlural = count == 0 || count != 1
  }

  return isPlural ? string.pluralize(str) : str
})

View.global('stripHtml', (string: string, replacement: string = '') => string.replace(/<[^>]*>?/gm, replacement))

View.global('Db', (table: string) => {
  return Database.from(table)
})

View.global('getCommentGoUrl', (comment: Comment) => {
  return NotificationService.getGoPath(comment)
})

View.global('getAbbrev', (text: string) => {
  if (typeof text != 'string' || !text) {
    return '';
  }
  const acronym = text
    .match(/\b([A-Z])/g)
    ?.reduce((previous, next) => previous + ((+next === 0 || parseInt(next)) ? parseInt(next): next[0] || ''), '')
    .toUpperCase()
  return acronym;
})

View.global('secondsForDisplay', (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const days = Math.floor(totalSeconds / (3600 * 24));

  let maxDisplay = days
  let maxDisplayKey = 'day'

  if (!days) {
    maxDisplay = hours
    maxDisplayKey = 'hour'
  }

  if (!hours) {
    maxDisplay = minutes
    maxDisplayKey = 'minute'
  }

  if (!minutes) {
    maxDisplay = seconds
    maxDisplayKey = 'second'
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    maxDisplay,
    maxDisplayKey
  }
})

View.global('timeago', (date: string | DateTime | null) => {
  if (typeof date === 'string') {
    date = DateTime.fromISO(date)
  }
  return date ? timeago.format(date.toJSDate()) : ''
})

View.global('ipLocate', async (ip) => {
  return IdentityService.getLocation(ip)
})

View.global('secondsToTimestring', (totalSeconds: number | string) => {
  if (typeof totalSeconds === 'string') {
    totalSeconds = Number(totalSeconds)
  }

  const hours = Math.floor(totalSeconds / 3600);

  totalSeconds %= 3600;

  const minutes = Math.floor(totalSeconds / 60);

  return `${hours}h ${minutes}m`
})

View.global('GA_PROPERTY', Env.get('GA_PROPERTY'))

View.global('DateTime', DateTime)
View.global('AssetTypes', AssetTypes)
View.global('StateEnum', States)
View.global('StateEnumDesc', StateDesc)
View.global('StatusEnum', Status)
View.global('StatusEnumDesc', StatusDesc)
View.global('CollectionTypeEnum', CollectionType)
View.global('CollectionTypeEnumDesc', CollectionTypeDesc)
View.global('PostTypeEnum', PostType)
View.global('PostTypeEnumDesc', PostTypeDesc)
View.global('Roles', Roles)
View.global('Themes', Themes)
View.global('VideoTypes', VideoTypes)
View.global('CouponDurations', CouponDurations)

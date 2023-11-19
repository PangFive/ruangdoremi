import Redis from '@ioc:Adonis/Addons/Redis'
import CacheKeys from 'App/Enums/CacheKeys'
import RedisConfig from 'Config/redis'
import Post from 'App/Models/Post'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'
import { DateTime } from 'luxon'

export default class CacheService {
  public static enabled = RedisConfig.enabled
  public static fiveMinutes = 300
  public static oneDay = 86_400
  public static stdTTL = CacheService.oneDay

  public static get globalKeys() {
    return [
      CacheKeys.HOME,
      CacheKeys.SERIES,
      CacheKeys.TOPICS,
      CacheKeys.RSS_FEED
    ]
  }

  public static async set(key: string, value: any, ttl: number | null = null): Promise<void> {
    if (!this.enabled) return

    if (ttl) {
      await Redis.set(key, value, "EX", ttl)
    } else {
      await Redis.set(key, value)
    }
  }

  public static async setSerialized(key: string, value: any, ttl: number | null = null): Promise<void> {
    if (!this.enabled) return

    if (typeof value === 'object' && typeof value.__onCache === 'function') {
      value = value.__onCache()
    }

    return this.set(key, JSON.stringify(value), ttl)
  }

  public static async destroy(key: string | string[]): Promise<void> {
    if (!this.enabled) return

    await Redis.del(...key)
  }

  public static async destroyAll() {
    if (!this.enabled) return

    await Redis.flushdb()
  }

  public static async destroyExpiry(key: string) {
    if (!this.enabled) return

    await Redis.del(`EXPIRE_${key}`)
  }

  public static async get(key: string, defaultValue: any = null): Promise<any> {
    if (!this.enabled) return defaultValue

    const value = await Redis.get(key)
    return value ?? defaultValue
  }

  public static async getParsed(key: string): Promise<any> {
    if (!this.enabled) return

    const result = await Redis.get(key)
    return result ? JSON.parse(result) : result
  }

  public static async has(key: string): Promise<boolean> {
    if (!this.enabled) return false

    return (await Redis.exists(key)) === 1
  }

  public static async keys(pattern: string = ''): Promise<string[]> {
    if (!this.enabled) return []

    return Redis.keys(pattern)
  }

  public static async try(key: string, callback: () => Promise<any>, ttl: number | null = null) {
    if (!this.enabled) return callback()
  
    if (await this.has(key)) {
      return this.getParsed(key)
    }

    const data = await callback()
    await this.destroyExpiry(key)
    await this.setSerialized(key, data, ttl)
    return data
  }

  public static async clearGlobals() {
    await this.destroy(this.globalKeys)
  }
  
  public static async setExpiry(key: string, expireAt: DateTime): Promise<void> {
    return this.set(`EXPIRE_${key}`, expireAt.toISO())
  }

    public static async getExpiry(key: string): Promise<DateTime> {
    const expireAtStr = await this.get(`EXPIRE_${key}`, DateTime.now().plus({ hour: 1 }).toISO())
    return DateTime.fromISO(expireAtStr)
  }

  public static getPostKey(post: Post | string) {
    if (post instanceof Post) {
      return CacheKeys.POST_ + post.slug
    }

    return CacheKeys.POST_ + post
  }

  public static getCollectionKey(collection: Collection | string) {
    if (collection instanceof Collection) {
      return CacheKeys.COLLECTION_ + collection.slug
    }

    return CacheKeys.COLLECTION_ + collection
  }

  public static getTaxonomyKey(taxonomy: Taxonomy | string) {
    if (taxonomy instanceof Taxonomy) {
      return CacheKeys.TAXONOMY_ + taxonomy.slug
    }

    return CacheKeys.TAXONOMY_ + taxonomy
  }

  public static async schedulePost(post: Post) {
    if (!post.publishAt) return
    const keys = [...this.globalKeys, this.getPostKey(post.slug)]
    const promises = keys.map(k => this.setExpiry(k, post.publishAt!))
    await Promise.all(promises)
  }

  public static async clearForPost(postId: number) {
    const post = await Post.findOrFail(postId)
    await post.load('collections')
    await post.load('taxonomies')

    let keys = [...this.globalKeys, this.getPostKey(post.slug)]
    keys = [...keys, ...post.collections.map(c => this.getCollectionKey(c.slug))]
    keys = [...keys, ...post.taxonomies.map(t => this.getTaxonomyKey(t.slug))]

    await this.destroy(keys)
    await this.schedulePost(post)

    await this.destroy(keys)
  }

  public static async clearForCollection(collectionId: number | string) {
    let slug = collectionId

    if (typeof slug !== 'string') {
      const collection = await Collection.findOrFail(collectionId)
      slug = collection.slug
    }

    await this.destroy([...this.globalKeys, this.getCollectionKey(slug)])
  }

  public static async clearForTaxonomy(taxonomyId: number | string) {
    let slug = taxonomyId

    if (typeof slug !== 'string') {
      const taxonomy = await Taxonomy.findOrFail(taxonomyId)
      slug = taxonomy.slug
    }

    await this.destroy([...this.globalKeys, this.getTaxonomyKey(slug)])
  }

}

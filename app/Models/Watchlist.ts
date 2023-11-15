import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'

export default class Watchlist extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public postId: number | null

  @column()
  public collectionId: number | null

  @column()
  public taxonomyId: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Post)
  public post: BelongsTo<typeof Post>

  @belongsTo(() => Collection)
  public collection: BelongsTo<typeof Collection>

  @belongsTo(() => Taxonomy)
  public taxonomy: BelongsTo<typeof Taxonomy>
}

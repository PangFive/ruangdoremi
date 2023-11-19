declare module '@ioc:Adonis/Lucid/Orm' {
  import States from 'App/Enums/States'

  interface ModelQueryBuilderContract<
    Model extends LucidModel,
    Result = InstanceType<Model>
    > {
    whereTrue(columnName: string): this
    whereFalse(columnName: string): this
    wherePublic(): this
    whereState(stateId: States): this
    withWatchlist(userId: number | undefined): this
    any(primaryKey?: string): Promise<boolean>
    firstOr<T = undefined>(orFunction: () => T): Promise<Result> | T
    getCount(): Promise<BigInt>
    getSum(column: string): Promise<number>
    selectIds(idColumn?: string): Promise<number[]>
    selectId(idColumn?: string): Promise<number>
    selectIdOrFail(idColumn?: string): Promise<number>
    selectColumn(columnName: string): Promise<string[]>
    highlight(columnName?: string, targetColumnName?: string): Promise<Result>
    highlightOrFail(columnName?: string, targetColumnName?: string): Promise<Result>
    highlightAll(columnName?: string, targetColumnName?: string): Promise<Result[]>
    makeAllSharable(columnName?: string, targetColumnName?: string): Promise<Result[]>
  }
}

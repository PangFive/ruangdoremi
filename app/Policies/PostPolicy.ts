import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import Plans from 'App/Enums/Plans'
import PaywallTypes from 'App/Enums/PaywallTypes'
import { action } from '@ioc:Adonis/Addons/Bouncer'

export default class PostPolicy extends BasePolicy {
	@action({ allowGuest: true })
	public async view(user: User, post: Post) {
		if (user && user.planId !== Plans.FREE) return true
		if (post.paywallTypeId === PaywallTypes.NONE) return true
		if (post.paywallTypeId === PaywallTypes.FULL) return false

		const isOwner = await this.isOwner(user, post)
		
		return isOwner || post.isPaywalled
	}

	@action({ allowGuest: true })
	public async viewFutureDated(user: User) {
		if (this.isAdmin(user) || this.isContributorLvl1(user) || this.isContributorLvl2(user)) return true
		return false
	}

	public async before(user: User) {
		if (this.isAdmin(user)) {
			return true
		}
	}

	public async viewList(user: User) {
		return this.isLvl1Contributor(user)
	}

	public async store(user: User) {
    return this.isLvl1Contributor(user)
	}

	public async update(user: User, post: Post) {
    return this.isOwner(user, post)
	}

	public async destroy(user: User, post: Post) {
    return this.isOwner(user, post)
	}

  private async isOwner(user: User, post: Post) {
    const author = await post.related('authors').query().where('users.id', user.id).first()
    return !!author
  }
}

// import IdentityService from "./IdentityService";
import User from 'App/Models/User'
import DiscordLogger from "@ioc:Logger/Discord";

export default class SecurityService {
  public static async isGraylisted(ip: string, user: User | undefined) {
    try {
      
      if (!user) {
        return true
      }
    } catch (error) {
      DiscordLogger.error('SecurityService.isGraylisted', { error, userId: user?.id, ip })
    }

    return false
  }
}
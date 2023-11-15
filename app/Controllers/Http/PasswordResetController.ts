import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'
import { schema as Schema, rules } from '@ioc:Adonis/Core/Validator'
import AuthAttemptService from 'App/Services/AuthAttemptService';
import NotAllowedException from 'App/Exceptions/NotAllowedException'
import Hash from '@ioc:Adonis/Core/Hash'
import DiscordLogger from '@ioc:Logger/Discord'
import Env from '@ioc:Adonis/Core/Env'

export default class PasswordResetController {
  public async forgotPassword({ view }: HttpContextContract) {
    return view.render('pages/auth/password/forgot')
  }

  public async forgotPasswordSent({ view }: HttpContextContract) {
    return view.render('pages/auth/password/sent')
  }

  public async forgotPasswordSend({ request, response, session }: HttpContextContract) {
    try {
      const email = request.input('email');
      const user = await User.findByOrFail('email', email)
      const signedUrl = Route.makeSignedUrl('auth.password.reset', {
        params: { email },
        expiresIn: '1h'
      });

      if (user) {
        const href = Env.get('APP_DOMAIN') + signedUrl

        await Mail.sendLater(message => {
          message
            .from('noreply@adocasts.com')
            .to(user.email)
            .subject('[Adocasts] Reset your password')
            .htmlView('emails/password_reset', { user, href })
        })
      }

      return response.redirect().toRoute('auth.password.forgot.sent');
    } catch (error) {
      const email = request.input('email');

      DiscordLogger.error('AuthController.forgotPasswordSend', { email, error })
      session.flash('error', "Account couldn't be found for this email");

      return response.redirect().back()
    }
  }

  public async resetPassword({ request, view, params }: HttpContextContract) {
    const isSignatureValid = request.hasValidSignature();
    const email = params.email;
    const token = await Hash.make(email)

    return view.render('pages/auth/password/reset', { isSignatureValid, email, token });
  }

  public async resetPasswordStore({ request, response, session, auth }: HttpContextContract) {
    try {
      const schema = Schema.create({
        token: Schema.string(),
        email: Schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'email' })]),
        password: Schema.string({ trim: true }, [rules.minLength(8)]),
      })

      const { token, email, password } = await request.validate({ schema })

      if (!await Hash.verify(token, email)) {
        throw new NotAllowedException("The request structure is invalid.")
      }

      const user = await User.findByOrFail('email', email);
      user.password = password;
      await user.save();

      await Mail.sendLater(message => {
        message
          .from('noreply@adocasts.com')
          .to(user.email)
          .subject('[Adocasts] Your password has been successfully reset')
          .htmlView('emails/password_reset_success', { user })
      })

      await auth.attempt(email, password);
      await AuthAttemptService.deleteBadAttempts(email);

      session.flash('success', "Your password has been successfully reset");

      return response.redirect('/');
    } catch (error) {
      const { email } = request.only(['email']);
      DiscordLogger.error('AuthController.resetPasswordStore', { email, error });

      session.flash('error', "Something went wrong and we may not have been able to reset your password.");
      return response.redirect().back();
    }
  }
}

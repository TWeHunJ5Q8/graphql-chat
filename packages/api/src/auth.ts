import { AuthenticationError } from 'apollo-server-express'
import { User } from './models'
import { SESS_NAME } from './config'
import { Request, Response, UserDocument } from './types'

export const attemptSignIn = async (
  email: string,
  password: string
): Promise<UserDocument> => {
  const message = 'Incorrect email or password. Please try again.'

  const user = await User.findOne({ email })

  if (!user || !(await user.matchesPassword(password))) {
    throw new AuthenticationError(message)
  }

  return user
}

const signedIn = (req: Request): boolean => req.session.userId

export const ensureSignedIn = (req: Request): void => {
  if (!signedIn(req)) {
    throw new AuthenticationError('You must be signed in.')
  }
}

export const ensureSignedOut = (req: Request): void => {
  if (signedIn(req)) {
    throw new AuthenticationError('You are already signed in.')
  }
}

export const signOut = (req: Request, res: Response): Promise<boolean> =>
  new Promise((resolve, reject) => {
    req.session.destroy(err => {
      if (err) reject(err)

      res.clearCookie(SESS_NAME)

      resolve(true)
    })
  })

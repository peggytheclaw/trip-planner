import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const GOOGLE_CLIENT_ID = '1004134331025-dnd8ivf4t0t6gallb5g7ii2a5fj9mvgk.apps.googleusercontent.com'

interface GoogleSignInProps {
  onSuccess?: () => void
  redirectTo?: string
  theme?: 'outline' | 'filled_black' | 'filled_blue'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export function GoogleSignIn({
  onSuccess,
  redirectTo = '/app',
  theme = 'filled_black',
  shape = 'pill',
  size = 'large',
  text = 'continue_with',
}: GoogleSignInProps) {
  const { signInWithGoogle } = useAuthStore()
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    try {
      await signInWithGoogle(credentialResponse.credential)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate(redirectTo)
      }
    } catch (err) {
      console.error('Sign-in failed:', err)
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error('Google sign-in failed')}
        theme={theme}
        shape={shape}
        text={text}
        size={size}
        useOneTap={false}
      />
    </GoogleOAuthProvider>
  )
}

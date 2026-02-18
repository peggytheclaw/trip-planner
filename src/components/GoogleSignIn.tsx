import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from './Toast'

const GOOGLE_CLIENT_ID = '1004134331025-dnd8ivf4t0t6gallb5g7ii2a5fj9mvgk.apps.googleusercontent.com'

// Supabase signInWithIdToken requires a nonce for security.
// We generate a random nonce, pass the SHA-256 hash to Google,
// and the original to Supabase for verification.
async function generateNonce(): Promise<[string, string]> {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(nonce))
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return [nonce, hashedNonce]
}

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
  const [nonce, setNonce] = useState('')
  const [hashedNonce, setHashedNonce] = useState('')

  useEffect(() => {
    generateNonce().then(([raw, hashed]) => {
      setNonce(raw)
      setHashedNonce(hashed)
    })
  }, [])

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    try {
      await signInWithGoogle(credentialResponse.credential, nonce)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate(redirectTo)
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err)
      toast.error(err?.message ?? 'Sign-in failed — please try again')
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google sign-in failed — please try again')}
        theme={theme}
        shape={shape}
        text={text}
        size={size}
        nonce={hashedNonce}
        useOneTap={false}
      />
    </GoogleOAuthProvider>
  )
}

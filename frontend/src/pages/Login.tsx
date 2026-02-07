import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const { loginWithGoogle } = useAuth()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <h1>Login</h1>

      <GoogleLogin
  onSuccess={credentialResponse => {
    console.log('GOOGLE LOGIN SUCCESS:', credentialResponse)

    if (!credentialResponse.credential) {
      console.error('❌ No credential returned from Google')
      return
    }

    console.log('✅ Google credential received')
    loginWithGoogle(credentialResponse.credential)
  }}
  onError={() => {
    console.error('❌ Google Login Failed')
    alert('Google Login Failed')
  }}
/>

    </div>
  )
}

export default Login

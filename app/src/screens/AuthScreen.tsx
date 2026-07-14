import { useState } from 'react';
import { PhoneFrame } from '../components/PhoneFrame';
import { getAuthErrorMessage, signInWithEmail, signInWithGoogle, signUpWithEmail, updateUserProfile } from '../lib/auth';
import { createDefaultCategories } from '../lib/firestore';
import type { Language } from '../types';

type Mode = 'login' | 'signup';

interface AuthScreenProps {
  onAuthenticated: () => void;
  language: Language;
  initialMode?: Mode;
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  border: '1px solid rgba(63,82,64,0.3)',
  borderRadius: 10,
  padding: 12,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#F7F9F2',
  color: '#3F5240',
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
};

export function AuthScreen({ onAuthenticated, language, initialMode = 'login' }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';

  const handleSubmit = async () => {
    setError(null);
    if (isSignup && password !== passwordConfirm) {
      setError(language === 'ko' ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      if (isSignup) {
        const credential = await signUpWithEmail(email, password);
        await createDefaultCategories(credential.user.uid, language);
        if (name.trim()) {
          await updateUserProfile(credential.user, name.trim());
        }
      } else {
        await signInWithEmail(email, password);
      }
      onAuthenticated();
    } catch (err) {
      setError(getAuthErrorMessage(err, language));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onAuthenticated();
    } catch (err) {
      setError(getAuthErrorMessage(err, language));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PhoneFrame background="#F7F9F2" language={language}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          padding: '44px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src="/assets/logo-book.png" alt="" style={{ width: 72, height: 72, objectFit: 'contain' }} />
        <img
          src="/assets/logo-wordmark.png"
          alt="Later Island"
          style={{ width: 150, objectFit: 'contain', marginTop: -4, marginBottom: 28 }}
        />

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {isSignup && (
            <div>
              <label style={labelStyle}>{language === 'en' ? 'Name (Nickname)' : '이름 (닉네임)'}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'en' ? 'Enter your name' : '이름을 입력하세요'}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>{language === 'en' ? 'Email' : '이메일'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>{language === 'en' ? 'Password' : '비밀번호'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'en' ? 'Enter password' : '비밀번호를 입력하세요'}
              style={inputStyle}
            />
          </div>

          {isSignup && (
            <div>
              <label style={labelStyle}>{language === 'en' ? 'Confirm Password' : '비밀번호 확인'}</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder={language === 'en' ? 'Re-enter password' : '비밀번호를 다시 입력하세요'}
                style={inputStyle}
              />
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <span style={{ fontSize: 12, color: '#6E8C6A', fontWeight: 600, cursor: 'pointer' }}>
                {language === 'en' ? 'Forgot password?' : '비밀번호를 잊으셨나요?'}
              </span>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, fontWeight: 600, color: '#B15C4A', marginTop: -4 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              border: '1px solid #6E8C6A',
              borderRadius: 10,
              padding: 14,
              background: '#6E8C6A',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              fontFamily: 'inherit',
              marginTop: 6,
            }}
          >
            {isLogin ? (language === 'en' ? 'Log In' : '로그인') : (language === 'en' ? 'Sign Up' : '회원가입')}
          </button>
        </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(63,82,64,0.15)' }} />
            <div style={{ fontSize: 11, opacity: 0.5 }}>또는</div>
            <div style={{ flex: 1, height: 1, background: 'rgba(63,82,64,0.15)' }} />
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              style={{
                width: '100%',
                border: '1px solid rgba(63,82,64,0.25)',
                borderRadius: 10,
                padding: 13,
                background: '#F7F9F2',
                color: '#3F5240',
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                fontFamily: 'inherit',
              }}
            >
              Google로 계속하기
            </button>
          </div>

        <div style={{ flex: 1 }} />

        <div style={{ fontSize: 12, opacity: 0.55, textAlign: 'center', paddingTop: 20 }}>
          {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <span
            onClick={() => setMode(isLogin ? 'signup' : 'login')}
            style={{ color: '#6E8C6A', fontWeight: 700, cursor: 'pointer' }}
          >
            {isLogin ? '회원가입' : '로그인'}
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}

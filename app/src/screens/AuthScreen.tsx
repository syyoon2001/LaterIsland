import { useState } from 'react';
import { PhoneFrame } from '../components/PhoneFrame';
import type { Language } from '../types';

type Mode = 'login' | 'signup';

interface AuthScreenProps {
  onAuthenticated: () => void;
  language: Language;
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

export function AuthScreen({ onAuthenticated, language }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';

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

        <div
          style={{
            width: '100%',
            display: 'flex',
            border: '1px solid rgba(63,82,64,0.2)',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 28,
          }}
        >
          <div
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 999,
              background: isLogin ? '#6E8C6A' : '#F7F9F2',
              color: isLogin ? '#fff' : '#3F5240',
            }}
          >
            로그인
          </div>
          <div
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 999,
              background: isSignup ? '#6E8C6A' : '#F7F9F2',
              color: isSignup ? '#fff' : '#3F5240',
            }}
          >
            회원가입
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isSignup && (
            <div>
              <label style={labelStyle}>이름</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>이메일</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              style={inputStyle}
            />
          </div>

          {isSignup && (
            <div>
              <label style={labelStyle}>비밀번호 확인</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                style={inputStyle}
              />
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <span style={{ fontSize: 12, color: '#6E8C6A', fontWeight: 600, cursor: 'pointer' }}>
                비밀번호를 잊으셨나요?
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onAuthenticated}
            style={{
              width: '100%',
              border: '1px solid #6E8C6A',
              borderRadius: 10,
              padding: 14,
              background: '#6E8C6A',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginTop: 6,
            }}
          >
            {isLogin ? '로그인' : '회원가입'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(63,82,64,0.15)' }} />
            <div style={{ fontSize: 11, opacity: 0.5 }}>또는</div>
            <div style={{ flex: 1, height: 1, background: 'rgba(63,82,64,0.15)' }} />
          </div>

          <button
            type="button"
            onClick={onAuthenticated}
            style={{
              width: '100%',
              border: '1px solid rgba(63,82,64,0.25)',
              borderRadius: 10,
              padding: 13,
              background: '#F7F9F2',
              color: '#3F5240',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
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

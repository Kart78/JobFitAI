import { BriefcaseBusiness, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { isSupabaseConfigured, signInWithGoogle } from '../services/supabase';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const configured = isSupabaseConfigured();

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Google sign-in could not be started.');
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo"><BriefcaseBusiness size={30}/></div>
        <span className="eyebrow">PRIVATE JOB SEARCH</span>
        <h1>Welcome to JobFit AI</h1>
        <p>Sign in before viewing or editing any resume, profile, preferences, or saved applications.</p>
        <div className="auth-privacy"><LockKeyhole size={18}/><span>Your workspace is private and separated by your Google account.</span></div>
        <button className="button auth-google" type="button" disabled={!configured || loading} onClick={handleSignIn}>
          <span className="google-mark" aria-hidden="true">G</span>
          {loading ? 'Opening Google…' : 'Continue with Google'}
        </button>
        {!configured && <p className="auth-error">Supabase environment variables are missing.</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}

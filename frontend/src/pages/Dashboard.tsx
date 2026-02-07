
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ComposeEmail from '../components/ComposeEmail';
import EmailTable from '../components/EmailTable';
import { getScheduledEmails, getSentEmails } from '../api/api';
import type { Email } from '../types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [showCompose, setShowCompose] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const scheduled = await getScheduledEmails();
      const sent = await getSentEmails();
      setScheduledEmails(scheduled.emails || []);
      setSentEmails(sent.emails || []);
    } catch (err) {
      console.error('Failed to fetch emails', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  if (!user) return null;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Welcome, {user.name}</h2>
          <p>{user.email}</p>
        </div>
        <div>
          <img src={user.avatar} alt="avatar" width={40} style={{ borderRadius: '50%' }} />
          <button onClick={logout} style={{ marginLeft: '12px' }}>Logout</button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button onClick={() => setActiveTab('scheduled')}>Scheduled Emails</button>
        <button onClick={() => setActiveTab('sent')}>Sent Emails</button>
        <button onClick={() => setShowCompose(true)}>Compose New Email</button>
      </div>

      {/* Content */}
      <div style={{ marginTop: '24px' }}>
        {loading && <p>Loading...</p>}

        {!loading && activeTab === 'scheduled' && (
          <EmailTable emails={scheduledEmails} />
        )}

        {!loading && activeTab === 'sent' && (
          <EmailTable emails={sentEmails} />
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmail
          onClose={() => setShowCompose(false)}
          onSuccess={fetchEmails}
        />
      )}
    </div>
  );
}
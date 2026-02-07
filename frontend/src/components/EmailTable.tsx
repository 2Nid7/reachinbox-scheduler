import type { Email } from '../types';

interface Props {
  emails: Email[];
}

export default function EmailTable({ emails }: Props) {
  if (emails.length === 0) {
    return <p>No emails found</p>;
  }

  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          <th>Email</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {emails.map((email) => (
          <tr key={email.id}>
            <td>{email.recipientEmail}</td>
            <td>{email.subject}</td>
            <td>{email.status}</td>
            <td>
  {email.sentAt
    ? new Date(email.sentAt).toLocaleString()
    : new Date(email.scheduledAt).toLocaleString()}
</td>

          </tr>
        ))}
      </tbody>
    </table>
  );
}

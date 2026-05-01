'use client';

import { useState } from 'react';
import styles from './QuestionsOrFeedback.module.scss';
import { TextField } from '../TextField';
import { TextArea } from '../TextArea';
import { Button } from '../Button';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface QuestionsOrFeedbackProps {
  mobile?: boolean;
  showOnMobile?: boolean;
}

export function QuestionsOrFeedback({ mobile = false, showOnMobile = false }: QuestionsOrFeedbackProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error('Submission failed');

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };

  const rootClass = mobile
    ? styles.mobileContent
    : `${styles.root}${showOnMobile ? ` ${styles.rootShowOnMobile}` : ''}`;
  const rootId = mobile ? undefined : 'questions-feedback';

  if (status === 'success') {
    return (
      <section id={rootId} className={rootClass}>
        <div className={styles.header}>
          <h2 className={`heading-2 ${styles.heading}`}>
            Questions or Feedback?
          </h2>
          <p className={`body-small-regular ${styles.description}`}>
            We're building this directory with community input. Found something missing? Have a suggestion or a question? Let us know.
          </p>
        </div>

        <div className={styles.successState}>
          <i className={`fa-solid fa-circle-check ${styles.successIcon}`} aria-hidden="true" />
          <p className={`body-large-regular ${styles.successMessage}`}>
            Thanks! We received your message and will follow up soon.
          </p>
          <Button
            variant="secondary"
            surface="dark"
            type="button"
            onClick={() => setStatus('idle')}
          >
            Submit another question
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id={rootId} className={rootClass}>
      <div className={styles.header}>
        <h2 className={`heading-2 ${styles.heading}`}>
          Questions or Feedback?
        </h2>
        <p className={`body-small-regular ${styles.description}`}>
            We're building this directory with community input. Found something missing? Have a suggestion or a question? Let us know.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label className={`label-small ${styles.label}`} htmlFor="qof-name">
            Name*
          </label>
          <TextField
            id="qof-name"
            placeholder="Provide name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={`label-small ${styles.label}`} htmlFor="qof-email">
            Email*
          </label>
          <TextField
            id="qof-email"
            type="email"
            placeholder="Provide email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={`label-small ${styles.label}`} htmlFor="qof-message">
            Question or Feedback*
          </label>
          <TextArea
            id="qof-message"
            placeholder="Your thoughts..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <Button
          variant="secondary"
          surface="dark"
          type="submit"
          className={styles.submitBtn}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Submitting…' : 'Submit'}
        </Button>

        {status === 'error' && (
          <p className={`body-small-regular ${styles.errorMessage}`}>
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </section>
  );
}

import type React from 'react';

import styles from './AiNowCredit.module.css';

interface AiNowCreditProps {
  description?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

/** Match the footer background; auto follows a site-controlled .dark class. */
export function AiNowCredit({
  description = 'AI სისტემები ბიზნესისთვის',
  theme = 'light',
  className,
}: Readonly<AiNowCreditProps>): React.ReactElement {
  return (
    <a
      className={[styles.credit, className].filter(Boolean).join(' ')}
      data-theme={theme}
      href="https://ainow.ge"
      target="_blank"
      rel="nofollow noopener noreferrer"
      aria-label={'powered by aiNOW.ge — ' + description}
      title={description}
    >
      <span className={styles.label}>powered by</span>
      <span className={styles.brand}>aiNOW<span className={styles.domain}>.ge</span></span>
      <span className={styles.mark} aria-hidden="true"><i /><i /><i /></span>
      <span className={styles.arrow} aria-hidden="true">↗</span>
    </a>
  );
}

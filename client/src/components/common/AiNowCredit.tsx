import type React from 'react';

import styles from './AiNowCredit.module.css';

/** The link owns the accessible name; the decorative wordmark must stay hidden. */
export function AiNowCredit(): React.ReactElement {
  return (
    <a
      href="https://ainow.ge"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="AI სისტემები ბიზნესისთვის"
      className={styles.credit}
    >
      <span aria-hidden="true" className={styles.wordmark}>
        <span className={styles.ai}>ai</span>
        <span className={styles.now}>NOW</span>
        <span className={styles.stripes} />
      </span>
    </a>
  );
}

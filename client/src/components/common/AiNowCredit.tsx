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
      {/* Bundle Solar's vector paths so the duotone icon needs no font or icon API. */}
      <svg
        className={styles.arrow}
        data-icon="solar:arrow-right-up-bold-duotone"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <metadata>
          Solar Icons, arrow-right-up-bold-duotone, by 480 Design.
          Source: https://www.figma.com/community/file/1166831539721848736.
          License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/.
        </metadata>
        <path fill="currentColor" fillRule="evenodd" d="M17.47 15.53a.75.75 0 0 0 1.28-.53V6a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0-.53 1.28z" clipRule="evenodd" />
        <path fill="currentColor" d="M5.47 17.47a.75.75 0 1 0 1.06 1.06l6.97-6.97l-1.06-1.06z" opacity=".5" />
      </svg>
    </a>
  );
}


import React from 'react';

export const SoccerBallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 22C17.5228 22 22 17.5228 22 12" />
      <path d="M12 2C6.47715 2 2 6.47715 2 12" />
      <path d="M12 2L9.4641 7.00001" />
      <path d="M12 22L9.4641 17" />
      <path d="M12 2L14.5359 7.00001" />
      <path d="M12 22L14.5359 17" />
      <path d="M2 12L7 9.46411" />
      <path d="M22 12L17 9.46411" />
      <path d="M2 12L7 14.5359" />
      <path d="M22 12L17 14.5359" />
      <path d="M9.4641 7.00001L7 9.46411" />
      <path d="M14.5359 7L17 9.46411" />
      <path d="M9.4641 17L7 14.5359" />
      <path d="M14.5359 17L17 14.5359" />
    </svg>
);

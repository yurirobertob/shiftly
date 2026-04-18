export function BrazilFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#009c3b" />
      <polygon points="320,76 588,240 320,404 52,240" fill="#ffdf00" />
      <circle cx="320" cy="240" r="90" fill="#002776" />
      <path
        d="M230,240 Q320,190 410,240"
        fill="none"
        stroke="#fff"
        strokeWidth="12"
      />
    </svg>
  );
}

export function UKFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#012169" />
      <path d="M0,0 L640,480 M640,0 L0,480" stroke="#fff" strokeWidth="80" />
      <path d="M0,0 L640,480 M640,0 L0,480" stroke="#C8102E" strokeWidth="52" />
      <path d="M320,0 V480 M0,240 H640" stroke="#fff" strokeWidth="120" />
      <path d="M320,0 V480 M0,240 H640" stroke="#C8102E" strokeWidth="72" />
    </svg>
  );
}

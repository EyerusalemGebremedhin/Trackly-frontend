export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 420" className="w-full h-auto" role="img" aria-label="A weekly check-in card next to a rising progress chart">
      <circle cx="240" cy="210" r="200" fill="#F4E7EA" />

      {}
      <g>
        <rect x="60" y="70" width="230" height="200" rx="10" fill="#FFFFFF" stroke="#E9DEE1" strokeWidth="1.5" />
        <rect x="60" y="70" width="230" height="40" rx="10" fill="#450920" />
        <rect x="60" y="100" width="230" height="10" fill="#450920" />
        <text x="84" y="96" fontFamily="Georgia, serif" fontSize="15" fill="#FFFFFF">This week</text>

        <text x="84" y="135" fontFamily="Inter, sans-serif" fontSize="10" fill="#8A6270">Achieved</text>
        <rect x="84" y="142" width="182" height="8" rx="4" fill="#F4E7EA" />
        <rect x="84" y="142" width="182" height="8" rx="4" fill="#F4E7EA" />
        <rect x="84" y="156" width="140" height="8" rx="4" fill="#F4E7EA" />

        <text x="84" y="185" fontFamily="Inter, sans-serif" fontSize="10" fill="#8A6270">Blocker</text>
        <rect x="84" y="192" width="182" height="20" rx="4" fill="#FFFBEB" stroke="#FACC15" strokeWidth="1" />

        <rect x="84" y="228" width="182" height="26" rx="6" fill="#450920" />
        <text x="175" y="245" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#FFFFFF" fontWeight="500">Submit check-in</text>
      </g>

      {}
      <g transform="translate(330,60)">
        <circle cx="30" cy="30" r="30" fill="#FFFFFF" stroke="#E9DEE1" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="22" fill="none" stroke="#F4E7EA" strokeWidth="6" />
        <circle cx="30" cy="30" r="22" fill="none" stroke="#166534" strokeWidth="6" strokeDasharray="103 138" strokeLinecap="round" transform="rotate(-90 30 30)" />
        <text x="30" y="35" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="#2E0219">75%</text>
      </g>

      {}
      <g transform="translate(300,220)">
        <rect x="0" y="70" width="24" height="40" rx="3" fill="#F4E7EA" />
        <rect x="34" y="50" width="24" height="60" rx="3" fill="#F4E7EA" />
        <rect x="68" y="20" width="24" height="90" rx="3" fill="#450920" />
        <rect x="102" y="35" width="24" height="75" rx="3" fill="#8A6270" />
      </g>

      {}
      <g transform="translate(70,300)">
        <circle cx="0" cy="0" r="14" fill="#450920" />
        <circle cx="24" cy="0" r="14" fill="#8A6270" />
        <circle cx="48" cy="0" r="14" fill="#166534" />
        <text x="70" y="5" fontFamily="Inter, sans-serif" fontSize="11" fill="#8A6270">+ your team</text>
      </g>
    </svg>
  );
}

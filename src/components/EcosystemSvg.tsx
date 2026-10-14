import React from 'react';
import { EcosystemHealth } from '../types';
import { Volume2 } from 'lucide-react';
import { SpeechService } from '../services/voice/speechService';

interface EcosystemSvgProps {
  health: EcosystemHealth;
  reducedMotion?: boolean;
}

export const EcosystemSvg: React.FC<EcosystemSvgProps> = ({ health, reducedMotion = false }) => {
  const isHealthy = health.score >= 70;
  const isModerate = health.score >= 40 && health.score < 70;

  // Paleta orgánica según salud del ecosistema
  const foliageColor = isHealthy ? '#2e7d32' : isModerate ? '#689f38' : '#8d6e63';
  const leafColorSecondary = isHealthy ? '#4caf50' : isModerate ? '#8bc34a' : '#a1887f';
  const trunkColor = '#5d4037';
  const groundColor = isHealthy ? '#81c784' : '#a5d6a7';

  const handleSpeakState = () => {
    SpeechService.speak(health.aria_speech || health.description);
  };

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-b from-green-50 to-white rounded-3xl p-6 shadow-sm border border-green-100">
      {/* Botón accesible para escuchar el estado del ecosistema */}
      <button
        onClick={handleSpeakState}
        aria-label="Escuchar descripción accesible del ecosistema"
        title="Escuchar descripción del ecosistema"
        className="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:bg-green-50 border border-green-200 text-green-700 transition"
      >
        <Volume2 size={20} />
      </button>

      {/* Gráfico SVG interactivo y accesible */}
      <svg
        viewBox="0 0 300 240"
        className={`w-full max-w-[280px] h-56 transition-all duration-700 ${reducedMotion ? '' : 'animate-float'}`}
        role="img"
        aria-label={`Ecosistema financiero interactivo: ${health.description}`}
      >
        <title>Árbol Financiero Dinámico</title>
        <desc>{health.description}</desc>

        {/* Cielo y sol sutil */}
        <circle cx="240" cy="50" r="22" fill="#fff59d" opacity="0.8" />
        <circle cx="240" cy="50" r="16" fill="#ffee58" />

        {/* Suelo suave */}
        <ellipse cx="150" cy="215" rx="120" ry="20" fill={groundColor} />
        <ellipse cx="150" cy="220" rx="90" ry="12" fill="#a5d6a7" opacity="0.6" />

        {/* Tronco */}
        <path
          d="M142 215 C142 170, 135 150, 138 120 C138 100, 150 90, 150 90 C150 90, 162 100, 162 120 C165 150, 158 170, 158 215 Z"
          fill={trunkColor}
        />
        {/* Raíces */}
        <path d="M142 215 C135 220, 120 222, 110 223" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M158 215 C165 220, 180 222, 190 223" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" />

        {/* Ramas secundarias */}
        <path d="M140 145 C125 135, 110 135, 95 140" stroke={trunkColor} strokeWidth="5" strokeLinecap="round" />
        <path d="M160 140 C175 130, 190 132, 205 138" stroke={trunkColor} strokeWidth="5" strokeLinecap="round" />
        <path d="M146 115 C135 105, 120 100, 105 102" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" />

        {/* Copa del árbol / Follaje dinámico */}
        <g className={reducedMotion ? '' : 'transition-transform duration-500'}>
          {/* Follaje principal */}
          <circle cx="150" cy="85" r="42" fill={foliageColor} />
          <circle cx="115" cy="110" r="34" fill={leafColorSecondary} />
          <circle cx="185" cy="110" r="34" fill={leafColorSecondary} />
          <circle cx="150" cy="115" r="38" fill={foliageColor} />
          <circle cx="110" cy="80" r="28" fill={foliageColor} />
          <circle cx="190" cy="80" r="28" fill={foliageColor} />
          <circle cx="150" cy="55" r="26" fill={leafColorSecondary} />

          {/* Flores / Frutos según ahorro (sólo si saludable) */}
          {isHealthy && (
            <>
              {/* Flor 1 */}
              <circle cx="125" cy="85" r="5" fill="#f48fb1" />
              <circle cx="125" cy="85" r="2" fill="#fff59d" />
              {/* Flor 2 */}
              <circle cx="175" cy="90" r="5" fill="#f48fb1" />
              <circle cx="175" cy="90" r="2" fill="#fff59d" />
              {/* Flor 3 */}
              <circle cx="150" cy="70" r="6" fill="#f06292" />
              <circle cx="150" cy="70" r="2.5" fill="#fff59d" />
              {/* Flor 4 */}
              <circle cx="138" cy="115" r="5" fill="#ffb74d" />
              <circle cx="162" cy="115" r="5" fill="#ffb74d" />
            </>
          )}

          {/* Moneda dorada en la copa (metáfora de alcancía viva) */}
          <g transform="translate(142, 35)">
            <circle cx="8" cy="8" r="9" fill="#ffb300" stroke="#ff8f00" strokeWidth="1.5" />
            <text x="8" y="11" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#fff">S/</text>
          </g>
        </g>
      </svg>

      {/* Descripción empática y estado */}
      <div className="text-center mt-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          isHealthy ? 'bg-green-100 text-green-800' : isModerate ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
        }`}>
          {isHealthy ? '🌿 Ecosistema Floreciente' : isModerate ? '🌱 En Crecimiento Constante' : '🍂 Requiere Nutrición'}
        </span>
        <p className="text-sm font-medium text-gray-700 mt-2 px-2 max-w-sm">
          {health.description}
        </p>
      </div>
    </div>
  );
};

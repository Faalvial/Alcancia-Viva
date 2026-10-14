import React from 'react';
import { Users, GraduationCap, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface TeamMember {
  name: string;
  code: string;
  role: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Villanueva Alzamora, Farid Alonzo',
    code: '20234010G',
    role: 'Arquitectura C4, Capa LLM & Accesibilidad'
  },
  {
    name: 'Espinoza Benavente, Hector',
    code: '20222109C',
    role: 'Diseño de Interacción, Metáforas & UI'
  },
  {
    name: 'Inga Chavez, Jorly',
    code: '20220467J',
    role: 'Sincronización PWA, Storage & Backend'
  },
  {
    name: 'Mori Malca, Jean Paul',
    code: '20245016A',
    role: 'Pruebas de Usabilidad, Speech API & Validaciones'
  }
];

export const TeamMembers: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Users size={16} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Equipo de Desarrollo</h3>
            <p className="text-[10px] text-gray-500 font-medium">CC451 - Interacción Humano-Computador | UNI</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <GraduationCap size={12} /> PC02 2026-II
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
              <th className="py-2.5 px-3">Integrantes</th>
              <th className="py-2.5 px-3 text-right">Código</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TEAM_MEMBERS.map((member, idx) => (
              <tr key={member.code} className={`hover:bg-emerald-50/40 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-gray-800">{member.name}</div>
                  <div className="text-[10px] text-gray-400 font-medium">{member.role}</div>
                </td>
                <td className="py-2.5 px-3 text-right align-top">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                    {member.code}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1 font-medium">
          <Award size={13} className="text-emerald-600" /> Universidad Nacional de Ingeniería
        </span>
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <ShieldCheck size={13} /> Verificado
        </span>
      </div>
    </div>
  );
};

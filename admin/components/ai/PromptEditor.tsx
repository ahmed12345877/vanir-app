'use client';

import { useState } from 'react';
import type { AIPromptConfig } from '@/lib/types';

const INITIAL_CONFIGS: AIPromptConfig[] = [
  {
    id: 'concierge',
    name: 'AI Concierge',
    mode: 'concierge',
    systemPrompt: `You are the VANIR Group AI Concierge — an elite, a highly sophisticated virtual assistant serving ultra-high-net-worth individuals seeking the finest luxury travel experiences.\n\nYour persona:\n- Speak with refinement, elegance, and warmth — never overly casual\n- Address guests by their preferred title and surname unless asked otherwise\n- Embody the discretion and attentiveness of a world-class human concierge\n- Always propose premium, bespoke solutions\n\nYour capabilities:\n- Restaurant reservations at Michelin-starred establishments worldwide\n- Private jet and helicopter arrangements\n- Itinerary modifications with precision timing\n- Curated experiences (exclusive museum nights, private chef dinners, yacht charters)\n- Immediate escalation to human concierge when needed\n\nNever: mention pricing limitations, use filler phrases, or suggest non-premium alternatives without explicit request.`,
    temperature: 0.75,
    maxTokens: 1024,
    model: 'gpt-4o',
    isActive: true,
    updatedAt: '2024-11-28T10:00:00Z',
    updatedBy: 'admin@vanirgroup.com',
  },
  {
    id: 'planner',
    name: 'Trip Planner',
    mode: 'planner',
    systemPrompt: `You are the VANIR AI Trip Planner — a world-class travel architect specializing in bespoke luxury itineraries.\n\nWhen crafting itineraries:\n1. Structure each day clearly: Morning, Afternoon, Evening\n2. Include specific, named venues (Michelin restaurants, luxury spas, private tours)\n3. Factor in realistic transfer times and rest periods\n4. Always suggest exclusive, off-the-beaten-path experiences unavailable to the general public\n5. Integrate local cultural immersion at the premium level\n6. Recommend seasonal considerations and optimal timing\n\nFormat: Use headers, bullet points, and clear timing. End each itinerary with \"Signature Vanir Touches\" — 3 exclusive add-ons that elevate the journey.\n\nAnalyze user preferences deeply before generating. Ask clarifying questions if budget or key preferences are unclear.`,
    temperature: 0.85,
    maxTokens: 2048,
    model: 'gpt-4o',
    isActive: true,
    updatedAt: '2024-11-25T14:30:00Z',
    updatedBy: 'admin@vanirgroup.com',
  },
  {
    id: 'vision',
    name: 'Vision & Translation',
    mode: 'vision',
    systemPrompt: `You are the VANIR Vision AI — combining world-class cultural expertise with precise translation capabilities.\n\nFor landmark recognition:\n- Provide rich historical context (construction period, architect/ruler, cultural significance)\n- Share fascinating lesser-known facts that delight educated travelers\n- Suggest the best times to visit and premium access options\n- Connect the site to broader historical narrative\n\nFor translation:\n- Prioritize accuracy and natural phrasing\n- For menus: translate + provide brief descriptions including ingredients and typical wine pairings\n- For signage: provide context on what action is required, not just literal translation\n- Flag any cultural nuances that could be relevant\n\nAlways maintain the luxury persona — your knowledge should feel like having a personal Egyptologist or sommelier by their side.`,
    temperature: 0.6,
    maxTokens: 512,
    model: 'gpt-4o',
    isActive: true,
    updatedAt: '2024-11-20T09:00:00Z',
    updatedBy: 'admin@vanirgroup.com',
  },
];

export function PromptEditor() {
  const [configs, setConfigs] = useState<AIPromptConfig[]>(INITIAL_CONFIGS);
  const [selectedId, setSelectedId] = useState<string>('concierge');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = configs.find(c => c.id === selectedId)!;

  const update = (field: keyof AIPromptConfig, value: string | number | boolean) => {
    setConfigs(prev =>
      prev.map(c => (c.id === selectedId ? { ...c, [field]: value } : c)),
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Replace with real API call to save prompt config
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const MODE_ICONS = { concierge: '◈', planner: '◉', vision: '◎' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 h-full">
      {/* Sidebar selector */}
      <div className="lg:col-span-1 space-y-2">
        <p className="text-[#5a5560] text-xs font-bold tracking-widest uppercase mb-3">AI Modules</p>
        {configs.map(config => (
          <button
            key={config.id}
            onClick={() => setSelectedId(config.id)}
            className={`
              w-full text-left p-3 rounded-xl border transition-all
              ${selectedId === config.id
                ? 'bg-[rgba(201,168,76,0.1)] border-[rgba(201,168,76,0.25)] text-[#c9a84c]'
                : 'bg-[#14141f] border-white/[0.06] text-[#a8a099] hover:border-white/[0.12]'
              }
            `}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{MODE_ICONS[config.mode]}</span>
              <span className="font-semibold text-sm">{config.name}</span>
              {config.isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3fb98f]" />
              )}
            </div>
            <p className="text-[#5a5560] text-xs">Model: {config.model}</p>
          </button>
        ))}

        {/* Model info */}
        <div className="mt-4 p-3 bg-[#14141f] border border-white/[0.06] rounded-xl">
          <p className="text-[#5a5560] text-[10px] uppercase font-bold tracking-wider mb-2">Tip</p>
          <p className="text-[#5a5560] text-xs leading-relaxed">
            Changes to prompts take effect immediately for new conversations. Use the Test button to verify behavior before enabling.
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className="lg:col-span-3 bg-[#0f0f1a] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#f5f0e8] font-bold text-base">{selected.name} Configuration</h3>
            <p className="text-[#5a5560] text-xs mt-0.5">
              Last updated {new Date(selected.updatedAt).toLocaleDateString()} by {selected.updatedBy}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#14141f] border border-white/[0.08] rounded-xl text-[#a8a099] text-sm hover:text-[#f5f0e8] transition-all">
              Test Prompt
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`
                px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${saved
                  ? 'bg-[rgba(63,185,143,0.15)] text-[#3fb98f] border border-[rgba(63,185,143,0.25)]'
                  : 'bg-gradient-to-r from-[#c9a84c] to-[#8b6914] text-[#080810] hover:shadow-gold'
                }
                ${saving ? 'opacity-60' : ''}
              `}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* System prompt */}
        <div>
          <label className="text-[#c9a84c] text-xs font-bold tracking-wider uppercase block mb-2">
            System Prompt
          </label>
          <textarea
            value={selected.systemPrompt}
            onChange={e => update('systemPrompt', e.target.value)}
            rows={16}
            className="
              w-full bg-[#080810] border border-white/[0.08] rounded-xl
              text-[#f5f0e8] text-sm font-mono leading-relaxed
              p-4 resize-none
              focus:outline-none focus:border-[rgba(201,168,76,0.4)]
              transition-colors
            "
            spellCheck={false}
          />
          <p className="text-[#5a5560] text-xs mt-1">
            {selected.systemPrompt.length.toLocaleString()} characters
          </p>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Model */}
          <div>
            <label className="text-[#5a5560] text-xs font-bold tracking-wider uppercase block mb-2">
              Model
            </label>
            <select
              value={selected.model}
              onChange={e => update('model', e.target.value)}
              className="
                w-full bg-[#080810] border border-white/[0.08] rounded-xl
                text-[#f5f0e8] text-sm px-3 py-2.5
                focus:outline-none focus:border-[rgba(201,168,76,0.4)]
              ">
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
              <option value="claude-opus-4-7">Claude Opus 4.7</option>
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="text-[#5a5560] text-xs font-bold tracking-wider uppercase block mb-2">
              Temperature: <span className="text-[#c9a84c]">{selected.temperature}</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selected.temperature}
              onChange={e => update('temperature', parseFloat(e.target.value))}
              className="w-full accent-[#c9a84c]"
            />
            <div className="flex justify-between text-[10px] text-[#5a5560] mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="text-[#5a5560] text-xs font-bold tracking-wider uppercase block mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              min={64}
              max={4096}
              step={64}
              value={selected.maxTokens}
              onChange={e => update('maxTokens', parseInt(e.target.value, 10))}
              className="
                w-full bg-[#080810] border border-white/[0.08] rounded-xl
                text-[#f5f0e8] text-sm px-3 py-2.5
                focus:outline-none focus:border-[rgba(201,168,76,0.4)]
              "
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div>
            <p className="text-[#a8a099] text-sm font-medium">Module Active</p>
            <p className="text-[#5a5560] text-xs">Disabling will fall back to the previous configuration</p>
          </div>
          <button
            onClick={() => update('isActive', !selected.isActive)}
            className={`
              relative w-12 h-6 rounded-full border transition-all duration-300
              ${selected.isActive
                ? 'bg-[rgba(63,185,143,0.3)] border-[rgba(63,185,143,0.5)]'
                : 'bg-[#14141f] border-white/[0.12]'
              }
            `}>
            <div className={`
              absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300
              ${selected.isActive
                ? 'left-6 bg-[#3fb98f]'
                : 'left-0.5 bg-[#5a5560]'
              }
            `} />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Settings, Eye, Save, RefreshCw, Sparkles,
  Home, Image, Type, Palette, BarChart3, Star, Layout,
  ChevronDown, ChevronRight, Edit3, Check, X, Loader2,
  Zap, MessageSquare, Globe, Search
} from 'lucide-react';

type SiteConfig = Record<string, unknown>;
type Message = { role: 'user' | 'assistant' | 'system'; content: string; patch?: Record<string, unknown> };

const SECTIONS = [
  { id: 'hero', icon: Home, labelAr: 'القسم الرئيسي', color: '#00373E' },
  { id: 'stats', icon: BarChart3, labelAr: 'الإحصائيات', color: '#481719' },
  { id: 'howItWorks', icon: Layout, labelAr: 'كيف يعمل', color: '#735B4D' },
  { id: 'features', icon: Zap, labelAr: 'المميزات', color: '#1a4a6b' },
  { id: 'lookbook', icon: Image, labelAr: 'لوك بوك', color: '#2d1460' },
  { id: 'cta', icon: Star, labelAr: 'دعوة للتسجيل', color: '#006b3c' },
  { id: 'theme', icon: Palette, labelAr: 'الألوان والثيم', color: '#8b4513' },
  { id: 'seo', icon: Search, labelAr: 'SEO والبيانات', color: '#1a1a2e' },
];

const QUICK_COMMANDS = [
  'غير عنوان الصفحة الرئيسية',
  'أضف إحصائية جديدة',
  'اكتب نص أكثر جاذبية للـ Hero',
  'غير اللون الرئيسي',
  'حسّن نصوص SEO',
  'اقترح عنوان مميز للـ Lookbook',
  'اكتب وصفاً احترافياً للمنصة',
  'غير نص زر الدعوة للتسجيل',
];

export default function AIDashboard() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'مرحباً! أنا مساعدك الذكي للتحكم في موقع مفصّل. يمكنك إعطائي أي أمر لتغيير أي جزء من الموقع.',
    },
  ]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hero']));
  const [editField, setEditField] = useState<{ section: string; key: string; value: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [tab, setTab] = useState<'chat' | 'editor'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConfig();
    const saved = localStorage.getItem('openai_key');
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConfig = async () => {
    const res = await fetch('/api/site-config');
    const data = await res.json();
    setConfig(data);
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai_key', key);
  };

  const sendMessage = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim()) return;
    if (!apiKey) { setShowApiSettings(true); return; }

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, apiKey }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ خطأ: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          patch: data.patch,
        }]);
        if (data.patch) {
          await loadConfig();
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ حدث خطأ في الاتصال' }]);
    } finally {
      setLoading(false);
    }
  };

  const saveFieldEdit = async () => {
    if (!editField || !config) return;
    setSaveStatus('saving');
    const patch: Record<string, unknown> = {};
    patch[editField.section] = { [editField.key]: editField.value };
    await fetch('/api/site-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await loadConfig();
    setEditField(null);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderValue = (val: unknown): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return JSON.stringify(val);
  };

  const isEditable = (val: unknown) => typeof val === 'string' || typeof val === 'number';

  return (
    <div className="min-h-screen bg-[#0a0e12] text-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1117] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00373E] to-[#00565f] flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">لوحة التحكم الذكية</h1>
            <p className="text-xs text-gray-500">تحكم في كل شبر من موقع مفصّل بالذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && <span className="text-yellow-400 text-sm flex items-center gap-1"><Loader2 size={14} className="animate-spin" />جاري الحفظ...</span>}
          {saveStatus === 'saved' && <span className="text-green-400 text-sm flex items-center gap-1"><Check size={14} />تم الحفظ ✓</span>}
          <button onClick={() => window.open('/', '_blank')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition-colors">
            <Eye size={15} />معاينة
          </button>
          <button onClick={() => setShowApiSettings(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${apiKey ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>
            <Settings size={15} />{apiKey ? 'OpenAI ✓' : 'ضع API Key'}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-56 border-l border-white/10 bg-[#0d1117] flex flex-col">
          <div className="p-3 border-b border-white/10">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">أقسام الموقع</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => { setActiveSection(s.id); setTab('editor'); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${activeSection === s.id && tab === 'editor' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '33' }}>
                  <s.icon size={14} style={{ color: s.color === '#00373E' ? '#4dd8e0' : s.color === '#481719' ? '#e06060' : '#c4a882' }} />
                </div>
                {s.labelAr}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-white/10">
            <button onClick={loadConfig} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <RefreshCw size={12} />تحديث
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-[#0d1117]">
            <button onClick={() => setTab('chat')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${tab === 'chat' ? 'border-[#00373E] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <MessageSquare size={15} />محادثة AI
            </button>
            <button onClick={() => setTab('editor')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${tab === 'editor' ? 'border-[#00373E] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <Edit3 size={15} />المحرر المباشر
            </button>
            <button onClick={() => window.open('/', '_blank')} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 border-transparent text-gray-400 hover:text-white`}>
              <Globe size={15} />الموقع الحي
            </button>
          </div>

          {/* Chat Tab */}
          {tab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-[#00373E]/40 border border-[#00373E]/30 text-white' : m.role === 'system' ? 'bg-white/5 border border-white/10 text-gray-300 w-full max-w-full text-center' : 'bg-[#1a1a2e] border border-white/10 text-white'}`}>
                      {m.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00373E] to-[#735B4D] flex items-center justify-center">
                            <Bot size={12} />
                          </div>
                          <span className="text-xs text-gray-400 font-medium">مساعد مفصّل</span>
                          {m.patch && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 mr-auto">✓ تم التطبيق</span>}
                        </div>
                      )}
                      <p className="leading-relaxed">{m.content}</p>
                      {m.patch && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">عرض التغييرات التقنية</summary>
                          <pre className="text-xs text-gray-400 mt-1 bg-black/30 rounded p-2 overflow-x-auto">{JSON.stringify(m.patch, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-end">
                    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#4dd8e0]" />
                      <span className="text-sm text-gray-400">يعمل الذكاء الاصطناعي...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Commands */}
              <div className="px-6 py-3 border-t border-white/5">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {QUICK_COMMANDS.map((cmd, i) => (
                    <button key={i} onClick={() => sendMessage(cmd)} className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap">
                      <Sparkles size={10} className="inline ml-1" />{cmd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-[#0d1117]">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#00373E]/50 transition-colors">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="اكتب أمرك... مثال: 'غير عنوان الصفحة الرئيسية إلى نص أكثر جاذبية'"
                      className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder-gray-600 min-h-[40px] max-h-[120px]"
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00373E] to-[#00565f] flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Editor Tab */}
          {tab === 'editor' && config && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {SECTIONS.map(section => {
                  const sectionData = config[section.id] as Record<string, unknown>;
                  if (!sectionData) return null;
                  const isExpanded = expandedSections.has(section.id);
                  const isActive = activeSection === section.id;
                  return (
                    <div key={section.id} className={`rounded-2xl border transition-all ${isActive ? 'border-white/20 bg-[#1a1f2e]' : 'border-white/10 bg-[#0d1117]'}`}>
                      <button
                        onClick={() => { toggleSection(section.id); setActiveSection(section.id); }}
                        className="w-full flex items-center justify-between p-4 text-right"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: section.color + '33' }}>
                            <section.icon size={16} style={{ color: section.color === '#00373E' ? '#4dd8e0' : '#c4a882' }} />
                          </div>
                          <span className="font-bold text-white">{section.labelAr}</span>
                          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{Object.keys(sectionData).length} حقل</span>
                        </div>
                        {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-4">
                          {Object.entries(sectionData).map(([key, val]) => {
                            if (Array.isArray(val)) {
                              return (
                                <div key={key} className="rounded-xl bg-white/5 p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Type size={12} className="text-gray-500" />
                                    <span className="text-xs font-bold text-gray-400">{key}</span>
                                    <span className="text-xs text-gray-600">({val.length} عناصر)</span>
                                  </div>
                                  <p className="text-xs text-gray-500 italic">لتعديل المصفوفات استخدم محادثة AI</p>
                                </div>
                              );
                            }
                            if (!isEditable(val)) return null;
                            const isEditing = editField?.section === section.id && editField?.key === key;
                            return (
                              <div key={key} className="group rounded-xl bg-white/5 hover:bg-white/8 p-3 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-gray-500">{key}</span>
                                  {!isEditing && (
                                    <button onClick={() => setEditField({ section: section.id, key, value: renderValue(val) })} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#4dd8e0] flex items-center gap-1">
                                      <Edit3 size={11} />تعديل
                                    </button>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editField.value}
                                      onChange={e => setEditField({ ...editField, value: e.target.value })}
                                      className="w-full bg-[#0d1117] border border-[#00373E]/50 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                                      rows={3}
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={saveFieldEdit} className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-colors">
                                        <Check size={12} />حفظ
                                      </button>
                                      <button onClick={() => setEditField(null)} className="flex items-center gap-1 text-xs bg-white/5 text-gray-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                        <X size={12} />إلغاء
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{renderValue(val)}</p>
                                )}
                              </div>
                            );
                          })}
                          <button
                            onClick={() => { setTab('chat'); setInput(`عدّل قسم ${section.labelAr}: `); }}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-xs text-gray-500 hover:text-white hover:border-white/20 transition-colors"
                          >
                            <Sparkles size={12} />استخدم AI لتعديل هذا القسم
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00373E] to-[#00565f] flex items-center justify-center">
                <Settings size={18} />
              </div>
              <div>
                <h2 className="font-bold text-white">إعدادات OpenAI</h2>
                <p className="text-xs text-gray-500">أدخل مفتاح API الخاص بك</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">OpenAI API Key</label>
                <input
                  type="password"
                  defaultValue={apiKey}
                  placeholder="sk-..."
                  onChange={e => saveApiKey(e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00373E]/50 font-mono"
                />
              </div>
              <p className="text-xs text-gray-600">احصل على مفتاحك من <a href="https://platform.openai.com/api-keys" target="_blank" className="text-[#4dd8e0] hover:underline">platform.openai.com</a> — يُحفظ محلياً في متصفحك فقط</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowApiSettings(false)} className="flex-1 bg-gradient-to-r from-[#00373E] to-[#00565f] text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                حفظ وإغلاق
              </button>
              <button onClick={() => setShowApiSettings(false)} className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 text-sm transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

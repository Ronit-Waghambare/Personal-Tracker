import React, { useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, Trash2, Moon, Sun, CheckCircle2, LayoutGrid, AlertTriangle, Trophy, ShieldCheck, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

// --- Global Styles ---
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0; padding: 0;
    font-family: 'Inter', sans-serif;
    background: ${props => props.theme.bg};
    color: ${props => props.theme.text};
    transition: all 0.4s ease;
  }
`;

const Container = styled.div` max-width: 1200px; margin: 0 auto; padding: 40px 20px; `;

const GlassCard = styled(motion.div)`
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 28px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  margin-bottom: 24px;
`;

const RankHeader = styled(GlassCard)`
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, ${props => props.color}22 0%, rgba(0,0,0,0) 100%);
  border: 2px solid ${props => props.color}44;
  position: sticky; top: 20px; z-index: 100;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'danger' ? '#ef444422' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'};
  color: ${props => props.variant === 'danger' ? '#ef4444' : 'white'};
  border: none; padding: 12px 18px; border-radius: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const StyledInput = styled.input`
  background: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text};
  padding: 14px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;
`;

const StyledSelect = styled.select`
  background: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text};
  padding: 14px; border-radius: 12px; width: 100%;
`;

const TaskRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 0; border-bottom: 1px solid ${props => props.theme.border};
  &:last-child { border: none; }
`;

const Badge = styled.span`
  font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;
  background: ${props => props.color}22; color: ${props => props.color};
`;

// --- Themes ---
const darkTheme = { bg: "#020617", cardBg: "rgba(15, 23, 42, 0.9)", text: "#f8fafc", border: "rgba(255,255,255,0.08)", inputBg: "#1e293b" };
const lightTheme = { bg: "#f1f5f9", cardBg: "rgba(255,255,255,0.95)", text: "#0f172a", border: "rgba(0,0,0,0.05)", inputBg: "#ffffff" };

// --- Helpers ---
const todayISO = () => new Date().toISOString().split("T")[0];
const diffInDays = (a, b) => Math.floor((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));
const COLORS = ["#818cf8", "#f43f5e", "#10b981", "#fbbf24", "#a855f7"];

export default function PersonalTracker() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tracker_v15") || "[]"));
  const [theme, setTheme] = useState("dark");
  const [input, setInput] = useState({ name: "", category: "", mode: "flexible", frequency: "daily" });

  useEffect(() => { localStorage.setItem("tracker_v15", JSON.stringify(tasks)); }, [tasks]);

  // --- Global Stats Logic ---
  const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 0), 0);
  const totalStreaks = tasks.reduce((acc, t) => acc + (t.streak || 0), 0);

  const getRank = (pts) => {
    if (pts >= 20000) return { name: "LEGEND", color: "#3b82f6", icon: <Trophy size={40} /> };
    if (pts >= 10000) return { name: "CHAMPION", color: "#ef4444", icon: <ShieldCheck size={40} /> };
    if (pts >= 6000) return { name: "MASTER", color: "#a855f7", icon: <ShieldCheck size={40} /> };
    if (pts >= 3000) return { name: "CRYSTAL", color: "#5eead4", icon: <ShieldCheck size={40} /> };
    if (pts >= 1500) return { name: "GOLD", color: "#ffd700", icon: <ShieldCheck size={40} /> };
    if (pts >= 500) return { name: "SILVER", color: "#c0c0c0", icon: <ShieldCheck size={40} /> };
    return { name: "BRONZE", color: "#cd7f32", icon: <ShieldCheck size={40} /> };
  };

  const rank = getRank(totalPoints);

  // --- Task Operations ---
  const addTask = () => {
    if (!input.name || !input.category) return;
    setTasks([...tasks, { ...input, id: crypto.randomUUID(), streak: 0, points: 0, lastCompleted: null, history: [] }]);
    setInput({ ...input, name: "" });
  };

  const markDone = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id || t.lastCompleted === todayISO()) return t;
      const last = t.lastCompleted;
      let newPoints = t.points;
      
      if (last) {
        const gap = diffInDays(todayISO(), last);
        let allowed = 1;
        if (t.frequency === "daily") allowed = 1;
        else if (t.frequency === "3x_week") allowed = 3;
        else if (t.frequency === "2x_week") allowed = 4;
        else if (t.frequency === "weekly") allowed = 7;
        else if (t.frequency === "monthly") allowed = 30;

        if (gap > allowed) {
            const penalty = Math.floor(t.streak * (t.mode === "strict" ? 1.5 : 0.5) * gap);
            newPoints = Math.max(0, t.points - penalty);
        }
      }
      const newStreak = t.streak + 1;
      newPoints += 10; 
      return { ...t, streak: newStreak, points: newPoints, lastCompleted: todayISO(), history: [...t.history, { date: todayISO(), streak: newStreak }] };
    }));
  };

  const removeTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const categories = [...new Set(tasks.map(t => t.category))];

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Container>
        {/* Top Branding & Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Personal <span style={{color: '#6366f1'}}>Tracker</span></h1>
          <ActionButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
          </ActionButton>
        </div>

        {/* --- Global Trophy Header (Clash of Clans Style) --- */}
        <RankHeader color={rank.color} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ color: rank.color, filter: `drop-shadow(0 0 10px ${rank.color}44)` }}>{rank.icon}</div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6, letterSpacing: '1px' }}>GLOBAL RANK</div>
              <h1 style={{ margin: 0, letterSpacing: '1px', color: rank.color, fontSize: '1.8rem' }}>{rank.name}</h1>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{totalPoints.toLocaleString()}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.6 }}>TOTAL DISCIPLINE XP</div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f59e0b22', padding: '4px 8px', borderRadius: '8px' }}>
                    <Flame size={14} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.8rem' }}>{totalStreaks} Streaks</span>
                </div>
            </div>
          </div>
        </RankHeader>

        {/* --- Unified Input Control Panel --- */}
        <GlassCard>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
            <StyledInput placeholder="Habit Name" value={input.name} onChange={e => setInput({...input, name: e.target.value})} />
            <StyledInput placeholder="Category (e.g. Health)" value={input.category} onChange={e => setInput({...input, category: e.target.value})} />
            <StyledSelect value={input.frequency} onChange={e => setInput({...input, frequency: e.target.value})}>
                <option value="daily">Daily</option>
                <option value="3x_week">3x per Week</option>
                <option value="2x_week">2x per Week</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </StyledSelect>
            <StyledSelect value={input.mode} onChange={e => setInput({...input, mode: e.target.value})}>
                <option value="flexible">Flexible Mode</option>
                <option value="strict">Strict Mode</option>
            </StyledSelect>
            <ActionButton onClick={addTask}><Plus size={20}/> Add Habit</ActionButton>
          </div>
        </GlassCard>

        {/* --- Category Cards with Integrated Graphs --- */}
        {categories.map(cat => {
            const catTasks = tasks.filter(t => t.category === cat);
            const allDates = [...new Set(catTasks.flatMap(t => t.history.map(h => h.date)))].sort();
            const graphData = allDates.map(date => {
                const entry = { date };
                catTasks.forEach(t => {
                    const hist = t.history.find(h => h.date === date);
                    entry[t.name] = hist ? hist.streak : null;
                });
                return entry;
            });

            return (
              <GlassCard key={cat} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', borderBottom: `2px solid ${theme === 'dark' ? '#ffffff08' : '#00000005'}`, paddingBottom: '15px' }}>
                    <LayoutGrid size={22} color="#6366f1" />
                    <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1rem', letterSpacing: '1px' }}>{cat}</h2>
                </div>

                {catTasks.map((t, idx) => {
                  let allowed = 1;
                  if (t.frequency === "daily") allowed = 1;
                  else if (t.frequency === "3x_week") allowed = 3;
                  else if (t.frequency === "2x_week") allowed = 4;
                  else if (t.frequency === "weekly") allowed = 7;
                  else if (t.frequency === "monthly") allowed = 30;

                  const isOverdue = t.lastCompleted && diffInDays(todayISO(), t.lastCompleted) > allowed;

                  return (
                    <TaskRow key={t.id}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: COLORS[idx % COLORS.length] }} />
                          <strong style={{ fontSize: '1.1rem' }}>{t.name}</strong>
                          {isOverdue && <AlertTriangle size={16} color="#ef4444" />}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <Badge color="#818cf8">{t.frequency.replace('_', ' ')}</Badge>
                          <Badge color={t.mode === 'strict' ? '#ef4444' : '#22c55e'}>{t.mode}</Badge>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', opacity: 0.7, fontSize: '0.75rem' }}>
                            <Zap size={12} fill="#a855f7" stroke="none" />
                            {t.points} XP
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>STREAK</div>
                          <div style={{ fontWeight: '900', color: '#f59e0b', fontSize: '1.4rem' }}>{t.streak}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <ActionButton 
                            style={{ padding: '10px 20px', borderRadius: '12px' }}
                            disabled={t.lastCompleted === todayISO()}
                            onClick={() => markDone(t.id)}
                          >
                            {t.lastCompleted === todayISO() ? <CheckCircle2 size={20}/> : "Check In"}
                          </ActionButton>
                          <Trash2 size={18} style={{ opacity: 0.15, cursor: 'pointer' }} onClick={() => removeTask(t.id)} />
                        </div>
                      </div>
                    </TaskRow>
                  );
                })}

                {/* Multi-Line Visual Progress */}
                {graphData.length > 1 && (
                    <div style={{ height: '220px', width: '100%', marginTop: '35px' }}>
                        <ResponsiveContainer>
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#ffffff05' : '#00000005'} />
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['dataMin', 'dataMax + 5']} />
                                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px', fontSize: '0.8rem' }} />
                                <Legend iconType="rect" wrapperStyle={{ paddingTop: '15px' }} />
                                {catTasks.map((t, idx) => (
                                    <Line key={t.id} type="monotone" dataKey={t.name} stroke={COLORS[idx % COLORS.length]} strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
              </GlassCard>
            );
        })}
      </Container>
    </ThemeProvider>
  );
}
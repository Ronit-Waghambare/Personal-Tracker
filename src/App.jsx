import React, { useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, Trash2, Moon, Sun, CheckCircle2, LayoutGrid, AlertTriangle } from "lucide-react";
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
  padding: 14px; border-radius: 12px; outline: none;
`;

const StyledSelect = styled.select`
  background: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text};
  padding: 14px; border-radius: 12px;
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
const darkTheme = { bg: "#020617", cardBg: "rgba(15, 23, 42, 0.8)", text: "#f8fafc", border: "rgba(255,255,255,0.08)", inputBg: "#1e293b" };
const lightTheme = { bg: "#f1f5f9", cardBg: "rgba(255,255,255,0.9)", text: "#0f172a", border: "rgba(0,0,0,0.05)", inputBg: "#ffffff" };

// --- Helpers ---
const todayISO = () => new Date().toISOString().split("T")[0];
const diffInDays = (a, b) => Math.floor((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));
const COLORS = ["#818cf8", "#f43f5e", "#10b981", "#fbbf24", "#a855f7"];

export default function PersonalTracker() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tracker_v11") || "[]"));
  const [theme, setTheme] = useState("dark");
  const [input, setInput] = useState({ name: "", category: "", mode: "flexible", frequency: "daily" });

  useEffect(() => { localStorage.setItem("tracker_v11", JSON.stringify(tasks)); }, [tasks]);

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
        const allowed = t.frequency === "daily" ? 1 : t.frequency === "weekly" ? 7 : 30;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <h1 style={{ fontWeight: 900, fontSize: '2.5rem' }}>Personal <span style={{color: '#6366f1'}}>Tracker</span></h1>
          <ActionButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
          </ActionButton>
        </div>

        {/* Input Bar */}
        <GlassCard>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px' }}>
            <StyledInput placeholder="Task Name" value={input.name} onChange={e => setInput({...input, name: e.target.value})} />
            <StyledInput placeholder="Category" value={input.category} onChange={e => setInput({...input, category: e.target.value})} />
            <StyledSelect value={input.frequency} onChange={e => setInput({...input, frequency: e.target.value})}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </StyledSelect>
            <StyledSelect value={input.mode} onChange={e => setInput({...input, mode: e.target.value})}>
                <option value="flexible">Flexible</option>
                <option value="strict">Strict</option>
            </StyledSelect>
            <ActionButton onClick={addTask}><Plus size={20}/> Add Task</ActionButton>
          </div>
        </GlassCard>

        {/* Category Cards */}
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
              <GlassCard key={cat} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                    <LayoutGrid size={22} color="#6366f1" />
                    <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{cat}</h2>
                </div>

                {catTasks.map((t, idx) => {
                  const isOverdue = t.lastCompleted && diffInDays(todayISO(), t.lastCompleted) > (t.frequency === "daily" ? 1 : t.frequency === "weekly" ? 7 : 30);
                  return (
                    <TaskRow key={t.id}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                          <strong style={{ fontSize: '1.05rem' }}>{t.name}</strong>
                          {isOverdue && <AlertTriangle size={14} color="#ef4444" />}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <Badge color="#818cf8">{t.frequency}</Badge>
                          <Badge color={t.mode === 'strict' ? '#ef4444' : '#22c55e'}>{t.mode}</Badge>
                          <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: '5px' }}>{t.points} pts</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>STREAK</div>
                          <div style={{ fontWeight: '900', color: '#f59e0b', fontSize: '1.2rem' }}>{t.streak}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <ActionButton 
                            style={{ padding: '8px 14px', borderRadius: '10px' }}
                            disabled={t.lastCompleted === todayISO()}
                            onClick={() => markDone(t.id)}
                          >
                            {t.lastCompleted === todayISO() ? <CheckCircle2 size={18}/> : <Plus size={18}/>}
                          </ActionButton>
                          <Trash2 size={16} style={{ opacity: 0.2, cursor: 'pointer' }} onClick={() => removeTask(t.id)} />
                        </div>
                      </div>
                    </TaskRow>
                  );
                })}

                {graphData.length > 1 && (
                    <div style={{ height: '220px', width: '100%', marginTop: '30px' }}>
                        <ResponsiveContainer>
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#ffffff08' : '#00000008'} />
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['dataMin', 'dataMax + 2']} />
                                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                {catTasks.map((t, idx) => (
                                    <Line key={t.id} type="monotone" dataKey={t.name} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} connectNulls />
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
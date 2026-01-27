import React, { useState, useEffect, useRef } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, Trash2, Moon, Sun, CheckCircle2, LayoutGrid, AlertTriangle, Trophy, ShieldCheck, Zap, Download, Upload, FileText, History, FolderSync, FileCheck, Calculator } from "lucide-react";
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
  background: ${props => props.variant === 'danger' ? '#ef444422' : props.variant === 'secondary' ? '#64748b22' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'};
  color: ${props => props.variant === 'danger' ? '#ef4444' : props.variant === 'secondary' ? '#94a3b8' : 'white'};
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

const darkTheme = { bg: "#020617", cardBg: "rgba(15, 23, 42, 0.9)", text: "#f8fafc", border: "rgba(255,255,255,0.08)", inputBg: "#1e293b" };
const lightTheme = { bg: "#f1f5f9", cardBg: "rgba(255,255,255,0.95)", text: "#0f172a", border: "rgba(0,0,0,0.05)", inputBg: "#ffffff" };

const todayISO = () => new Date().toISOString().split("T")[0];
const diffInDays = (a, b) => Math.floor((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));
const COLORS = ["#818cf8", "#f43f5e", "#10b981", "#fbbf24", "#a855f7"];

export default function PersonalTracker() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tracker_v15") || "[]"));
  const [theme, setTheme] = useState("dark");
  const [input, setInput] = useState({ name: "", category: "", mode: "flexible", frequency: "daily" });
  const [dirHandle, setDirHandle] = useState(null); 
  const fileInputRef = useRef(null);

  const [calcStreak, setCalcStreak] = useState(tasks[0]?.streak || 0);
  const [calcGap, setCalcGap] = useState(1);
  const [calcMode, setCalcMode] = useState(tasks[0]?.mode || "flexible");

  useEffect(() => {
    if (tasks.length > 0) {
      setCalcStreak(tasks[0].streak);
      setCalcMode(tasks[0].mode);
    }
  }, [tasks]);

  useEffect(() => { localStorage.setItem("tracker_v15", JSON.stringify(tasks)); }, [tasks]);

  const autoSaveToFolder = async () => {
    try {
      let currentHandle = dirHandle;
      if (!currentHandle) {
        currentHandle = await window.showDirectoryPicker();
        setDirHandle(currentHandle);
      }
      const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 0), 0);
      const totalStreaks = tasks.reduce((acc, t) => acc + (t.streak || 0), 0);
      const dateStr = todayISO();

      const logFileName = `log_${dateStr}.txt`;
      const logHandle = await currentHandle.getFileHandle(logFileName, { create: true });
      let logText = `--- DISCIPLINE TRACKER LOG: ${new Date().toLocaleString()} ---\n`;
      logText += `Global XP: ${totalPoints} | Total Streaks: ${totalStreaks}\n\n`;
      tasks.forEach(t => {
        const status = t.lastCompleted === dateStr ? "✓ DONE" : "○ TODO";
        logText += `${status} | ${t.name} (Streak: ${t.streak} | XP: ${t.points})\n`;
      });
      const logWritable = await logHandle.createWritable();
      await logWritable.write(logText);
      await logWritable.close();

      const dataFileName = `data_backup_${dateStr}.json`;
      const dataHandle = await currentHandle.getFileHandle(dataFileName, { create: true });
      const dataWritable = await dataHandle.createWritable();
      await dataWritable.write(JSON.stringify(tasks, null, 2));
      await dataWritable.close();
      
      alert(`Success! Saved two files:\n1. ${logFileName}\n2. ${dataFileName}`);
    } catch (err) { alert("Folder access denied."); }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `tracker_backup_${todayISO()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) { setTasks(json); alert("Backup restored!"); }
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 0), 0);

  const getRank = (pts) => {
    if (pts >= 20000) return { name: "LEGEND", color: "#3b82f6", threshold: 3000 };
    if (pts >= 10000) return { name: "CHAMPION", color: "#ef4444", threshold: 2500 };
    if (pts >= 6000) return { name: "MASTER", color: "#a855f7", threshold: 2000 };
    if (pts >= 3000) return { name: "CRYSTAL", color: "#5eead4", threshold: 1500 };
    if (pts >= 1500) return { name: "GOLD", color: "#ffd700", threshold: 1000 };
    if (pts >= 500) return { name: "SILVER", color: "#c0c0c0", threshold: 500 };
    return { name: "BRONZE", color: "#cd7f32", threshold: 0 };
  };

  const rank = getRank(totalPoints);
  const ranks = [
    { name: "BRONZE", pts: 0, col: "#cd7f32" },
    { name: "SILVER", pts: 500, col: "#c0c0c0" },
    { name: "GOLD", pts: 1000, col: "#ffd700" },
    { name: "CRYSTAL", pts: 1500, col: "#5eead4" },
    { name: "MASTER", pts: 2000, col: "#a855f7" },
    { name: "CHAMPION", pts: 2500, col: "#ef4444" },
    { name: "LEGEND", pts: 3000, col: "#3b82f6" }
  ];

  const addTask = () => {
    if (!input.name || !input.category) return;
    setTasks([...tasks, { ...input, id: crypto.randomUUID(), streak: 0, points: 0, lastCompleted: null, history: [] }]);
    setInput({ ...input, name: "" });
  };

  const markDone = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id || t.lastCompleted === todayISO()) return t;
      
      let newPoints = t.points;
      const last = t.lastCompleted;
      
      if (last) {
        const gap = diffInDays(todayISO(), last);
        const frequencyMap = { "daily": 1, "3x_week": 3, "2x_week": 4, "weekly": 7, "monthly": 30 };
        const allowed = frequencyMap[t.frequency] || 1;

        // Change: Added + 1 to allowed so you aren't penalized for checking in "late" on the due day.
        // This ensures penalty only triggers for actual FULL days missed.
        if (gap > (allowed + 1)) {
          const actualMissedDays = gap - (allowed + 1); 
          const multiplier = t.mode === "strict" ? 1.5 : 0.5;
          const penalty = Math.floor(t.streak * multiplier * actualMissedDays);
          newPoints = Math.max(0, t.points - penalty);
        }
      }

      const newStreak = t.streak + 1;
      return { 
        ...t, 
        streak: newStreak, 
        points: newPoints + 10, 
        lastCompleted: todayISO(), 
        history: [...t.history, { date: todayISO(), streak: newStreak }] 
      };
    }));
  };

  const removeTask = (id) => {
    if(window.confirm("Delete this habit?")) setTasks(tasks.filter(t => t.id !== id));
  };

  const categories = [...new Set(tasks.map(t => t.category))];

  const restoreXP = () => {
    setTasks(prev => prev.map(t => ({
      ...t,
      // This resets your points to exactly what they should be: 
      // // (Check-ins * 10) assuming 40 total check-ins across 7 habits
      points: (t.streak > 0) ? (t.streak * 10) : t.points 
    })));
    alert("XP Restored based on current streaks!");
  };

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Personal <span style={{color: '#6366f1'}}>Tracker</span></h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <ActionButton variant={dirHandle ? "" : "secondary"} onClick={autoSaveToFolder}><FolderSync size={18}/></ActionButton>
            <ActionButton variant="secondary" onClick={exportData}><Download size={18}/></ActionButton>
            <ActionButton variant="secondary" onClick={() => fileInputRef.current.click()}>
              <Upload size={18}/><input type="file" ref={fileInputRef} onChange={importData} style={{display: 'none'}} accept=".json"/>
            </ActionButton>
            <ActionButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</ActionButton>
          </div>
        </div>

        <RankHeader color={rank.color}>
          <ActionButton onClick={restoreXP}>Reset Points to Streaks</ActionButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ShieldCheck size={40} color={rank.color} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6 }}>GLOBAL RANK</div>
              <h1 style={{ margin: 0, color: rank.color, fontSize: '1.8rem' }}>{rank.name}</h1>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{totalPoints.toLocaleString()}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.6 }}>DISCIPLINE XP</div>
          </div>
        </RankHeader>

        <GlassCard>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '15px', opacity: 0.6 }}>RANK PROGRESSION</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {ranks.map(r => (
              <div key={r.name} style={{ padding: '12px', borderRadius: '15px', background: totalPoints >= r.pts ? `${r.col}22` : '#80808008', border: `1px solid ${totalPoints >= r.pts ? r.col : 'transparent'}`, opacity: totalPoints >= r.pts ? 1 : 0.4 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: r.col }}>{r.pts} XP</div>
                <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{r.name}</div>
                {totalPoints < r.pts && <div style={{ fontSize: '0.6rem', color: '#6366f1', marginTop: '4px' }}>-{(r.pts - totalPoints).toLocaleString()} to go</div>}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard style={{ border: '1px solid #6366f133' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Calculator size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Live Streak Penalty Calculator</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>STREAK: {calcStreak}</label>
              <input type="range" min="0" max="100" value={calcStreak} onChange={e => setCalcStreak(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#6366f1' }} />
              <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginTop: '10px', display: 'block' }}>FULL DAYS MISSED: {calcGap}</label>
              <input type="range" min="0" max="30" value={calcGap} onChange={e => setCalcGap(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>MODE</label>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <ActionButton variant={calcMode === 'flexible' ? '' : 'secondary'} onClick={() => setCalcMode('flexible')} style={{ flex: 1, padding: '5px' }}>Flex (0.5x)</ActionButton>
                <ActionButton variant={calcMode === 'strict' ? '' : 'secondary'} onClick={() => setCalcMode('strict')} style={{ flex: 1, padding: '5px' }}>Strict (1.5x)</ActionButton>
              </div>
              <div style={{ marginTop: '15px', padding: '15px', borderRadius: '12px', background: '#ef444411', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ef4444' }}>RESULTING XP LOSS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>-{Math.floor(calcStreak * (calcMode === 'strict' ? 1.5 : 0.5) * calcGap)} XP</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
            <StyledInput placeholder="Habit Name" value={input.name} onChange={e => setInput({...input, name: e.target.value})} />
            <StyledInput placeholder="Category" value={input.category} onChange={e => setInput({...input, category: e.target.value})} />
            <StyledSelect value={input.frequency} onChange={e => setInput({...input, frequency: e.target.value})}>
                <option value="daily">Daily</option>
                <option value="3x_week">3x per Week</option>
                <option value="2x_week">2x per Week</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </StyledSelect>
            <StyledSelect value={input.mode} onChange={e => setInput({...input, mode: e.target.value})}>
                <option value="flexible">Flexible</option>
                <option value="strict">Strict</option>
            </StyledSelect>
            <ActionButton onClick={addTask}><Plus size={20}/> Add Habit</ActionButton>
          </div>
        </GlassCard>

        {categories.map(cat => {
            const catTasks = tasks.filter(t => t.category === cat);
            const allDates = [...new Set(catTasks.flatMap(t => t.history.map(h => h.date)))].sort();
            const graphData = allDates.map(date => {
                const entry = { date: new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) };
                catTasks.forEach(t => {
                    const h = t.history.find(x => x.date === date);
                    entry[t.name] = h ? h.streak : null;
                });
                return entry;
            });

            return (
              <GlassCard key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                    <LayoutGrid size={20} color="#6366f1" />
                    <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.9rem' }}>{cat}</h2>
                </div>
                {catTasks.map((t, idx) => (
                    <TaskRow key={t.id}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                          <strong 
                            style={{ fontSize: '1rem', cursor: 'pointer' }}
                            onClick={() => { setCalcStreak(t.streak); setCalcMode(t.mode); }}
                          >
                            {t.name}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <Badge color="#818cf8">{t.frequency}</Badge>
                          <Badge color={t.mode === 'strict' ? '#ef4444' : '#22c55e'}>{t.mode}</Badge>
                          <div style={{ opacity: 0.5, fontSize: '0.7rem' }}>{t.points} XP</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>STREAK</div>
                          <div style={{ fontWeight: '900', color: '#f59e0b', fontSize: '1.2rem' }}>{t.streak}</div>
                        </div>
                        <ActionButton disabled={t.lastCompleted === todayISO()} onClick={() => markDone(t.id)}>
                          {t.lastCompleted === todayISO() ? <CheckCircle2 size={18}/> : "Check In"}
                        </ActionButton>
                        <Trash2 size={18} style={{ opacity: 0.1, cursor: 'pointer' }} onClick={() => removeTask(t.id)} />
                      </div>
                    </TaskRow>
                ))}

                {graphData.length > 1 && (
                    <div style={{ height: '250px', marginTop: '30px' }}>
                        <ResponsiveContainer>
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#888" />
                                <YAxis hide />
                                <Tooltip contentStyle={{background: '#1e293b', border: 'none', borderRadius: '10px', fontSize: '12px'}} />
                                <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                                {catTasks.map((t, idx) => (
                                    <Line key={t.id} type="monotone" dataKey={t.name} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} dot={{r: 4}} connectNulls />
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
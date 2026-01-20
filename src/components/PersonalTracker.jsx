import React, { useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { Flame, Plus, Award, Download, Trash2 } from "lucide-react";

// --- Global Styles & Modern Reset ---
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: ${(props) => (props.theme.mode === "dark" ? "#0f172a" : "#f8fafc")};
    color: ${(props) => (props.theme.mode === "dark" ? "#f1f5f9" : "#1e293b")};
    transition: all 0.3s ease;
  }
`;

// --- Styled Components (The "Sleek" UI) ---
const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const GlassCard = styled.div`
  background: ${(props) => (props.theme.mode === "dark" ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)")};
  backdrop-filter: blur(12px);
  border: 1px solid ${(props) => (props.theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)")};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 30px;
`;

const MainButton = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  
  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const StyledInput = styled.input`
  background: ${(props) => (props.theme.mode === "dark" ? "#1e293b" : "#fff")};
  border: 1px solid ${(props) => (props.theme.mode === "dark" ? "#334155" : "#e2e8f0")};
  color: inherit;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  &:focus { border-color: #6366f1; }
`;

// --- Logic Helpers ---
const todayISO = () => new Date().toISOString().split("T")[0];

export default function PersonalTracker() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("streaks_v4") || "[]"));
  const [theme, setTheme] = useState("dark");
  const [name, setName] = useState("");

  useEffect(() => {
    localStorage.setItem("streaks_v4", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!name) return;
    const newTask = {
      id: Date.now(),
      name,
      streak: 0,
      points: 0,
      lastCompleted: null
    };
    setTasks([...tasks, newTask]);
    setName("");
  };

  const markDone = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id && t.lastCompleted !== todayISO()) {
        return { ...t, streak: t.streak + 1, points: t.points + 10, lastCompleted: todayISO() };
      }
      return t;
    }));
  };

  return (
    <ThemeProvider theme={{ mode: theme }}>
      <GlobalStyle />
      <Container>
        <Header>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Orbit <span style={{ color: '#6366f1' }}>Tracker</span></h1>
          <MainButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </MainButton>
        </Header>

        <GlassCard style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <StyledInput 
              style={{ flex: 1 }} 
              placeholder="What is your next goal?" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <MainButton onClick={addTask}><Plus size={20}/> Add Task</MainButton>
          </div>
        </GlassCard>

        <Grid>
          {tasks.map(task => (
            <GlassCard key={task.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>{task.name}</h3>
                <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={18} fill="#f59e0b" /> {task.streak}
                </div>
              </div>
              
              <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>
                Total Score: <strong>{task.points}</strong>
              </div>

              <MainButton 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => markDone(task.id)}
                disabled={task.lastCompleted === todayISO()}
              >
                {task.lastCompleted === todayISO() ? "Completed Today" : "Mark as Done"}
              </MainButton>
            </GlassCard>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
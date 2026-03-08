# 🏆 Streak Tracker:

**Streak Tracker** is a high-performance React application designed to gamify habit formation. Unlike traditional trackers, this system uses a **League Ranking System** where your consistency earns you "XP points," allowing you to climb ranks.

---

## 🚀 Key Features

### 📈 Smart Multi-Line Analytics
* **Categorized Tracking:** Group habits into "Health," "Work," or "Personal."
* **Adaptive Graphs:** Real-time Recharts integration that bridges gaps for non-daily habits (2x/3x week) using `connectNulls` logic.
* **Visual History:** Watch your streaks climb across different frequencies in a single unified view.

### ⚖️ Discipline Modes
* **Strict Mode:** High stakes. Missing a window results in a **1.5x penalty** based on your current streak.
* **Flexible Mode:** Life-friendly. A minor **0.5x penalty** for missed days.
* **Frequency Support:** Built-in logic for Daily, 3x Week, 2x Week, Weekly, and Monthly rhythms.

### 🌑 Premium UI/UX
* **Glassmorphism Design:** Modern, blurred background cards with sleek borders.
* **Dark/Light Mode:** Seamless transition between themes.
* **Mobile Responsive:** A grid-based layout that works on desktop and mobile.

---

## 🌐 Scalability & Backend Integration

The current architecture is designed for seamless transition from client-side storage to a full-stack environment.

### 🐍 Python & Google Colab Integration
The system can be integrated with **Google Colab** to act as a powerful compute engine for habit analytics:
* **Predictive Analytics:** Utilize Python's `scikit-learn` or `pandas` within Colab to analyze habit patterns and predict "risk days" where streaks are likely to break.
* **Data Processing:** Offload heavy `history` object processing to a Colab-hosted API, allowing for complex data transformation without slowing down the React UI.

### 🗄️ Enterprise Database Solutions
For users requiring cross-device synchronization and long-term data persistence, the schema is ready for migration to **RDBMS** (Relational Database Management Systems):
* **Oracle SQL / MySQL:** Transition from `LocalStorage` to a structured SQL backend. This allows for:
    * **Normalized Tables:** Separate tables for `User_Profiles` (XP/Ranks), `Habit_Configs` (Strict/Flexible modes), and `Progress_Logs`.
    * **ACID Compliance:** Ensures that XP updates and streak increments are handled with 100% data integrity.
* **Oracle Apex:** Potential for rapid deployment of a dashboard-style administrative view for the habit data.

### ☁️ API Architecture
The application is structured to support a **RESTful API** layer using `FastAPI` or `Flask`, enabling:
* **Cross-Device Sync:** Log in from any browser and retrieve your "Strict Mode" progress.
    * **SQL Connectivity:** Securely connect to an Oracle Cloud database to store years of habit history.
 
---

## 🛠️ Technical Stack

* **Frontend:** React.js
* **Styling:** Styled-Components (CSS-in-JS)
* **Animations:** Framer Motion
* **Icons:** Lucide-React
* **Charts:** Recharts
* **State Management:** React Hooks (useState, useEffect)
* **Persistence:** LocalStorage API

---

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Ronit-Waghambare/Personal-Tracker.git](https://github.com/Ronit-Waghambare/Personal-Tracker.git)

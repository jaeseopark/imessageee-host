import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

let logs = "";

const Hello = () => {
  const [hostname, setHostname] = useState<string>();
  const [, markUpdated] = useState(Date.now());

  useEffect(() => {
    const appendLog = (line: string) => {
      logs = `${Date.now()} ${line}
${logs}`
    };
    window.electron.ipcRenderer.invoke("getHostname").then(setHostname);
    window.electron.ipcRenderer.on("log", (log: string) => {
      appendLog(log);
      markUpdated(Date.now());
    });
  }, []);

  return (
    <div>
      <h1>{hostname}</h1>
      {/* <textarea value={logs} readOnly /> */}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}

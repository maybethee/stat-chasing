import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replays, setReplays] = useState([]);

  function avgSupersonic() {
    const sum = replays.reduce(
      (sum, obj) => sum + obj.percent_supersonic_speed,
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function avgDemos() {
    const sum = replays.reduce((sum, obj) => sum + obj.demos_inflicted, 0);
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  useEffect(() => {
    const fetchReplays = async () => {
      try {
        const startTime = new Date().getTime();
        const response = await fetch("/api/replays");
        if (response.status >= 400) {
          throw new Error("server error");
        }
        const data = await response.json();
        setReplays(data);
        const endTime = new Date().getTime();
        const apiResponseTime = endTime - startTime;
        console.log("result:", apiResponseTime, "ms");
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReplays();
  }, []);

  if (loading) return <div className="loading">LOADING...</div>;
  if (error)
    return (
      <p className="error">
        A network error was encountered. Check your internet connection and
        try&nbsp;again.
      </p>
    );

  return (
    <div>
      <h1>stats</h1>
      <div style={{ margin: "2rem" }}>
        <h2>BijouBug's games:</h2>
        <br />
        <div style={{ fontSize: "1.1rem" }}>
          <br />
          average % supersonic: {avgSupersonic()}%
          <br />
          <br />
          average demos inflicted: {avgDemos()}
        </div>
        <br />
        <div className="statsContainer">
          <table cellSpacing="30">
            <tbody>
              <tr style={{ fontWeight: "bold" }}>
                <th>No.</th>
                <th>Replay ID</th>
                <th>% supersonic speed</th>
                <th>demos inflicted</th>
              </tr>
              {replays.map((replay, num = 0) => {
                num++;
                return (
                  <tr key={replay.replay_id}>
                    <td>{num}</td>
                    <td>{replay.replay_id}</td>
                    <td>{replay.percent_supersonic_speed.toFixed(2)}%</td>
                    <td>{replay.demos_inflicted}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;

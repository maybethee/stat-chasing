import { useState, useEffect } from "react";
import "./App.css";
import {
  getMapName,
  isPlayerWinner,
  getPercentSupersonicSpeed,
  getDemosInflicted,
} from "./utils";
import Stats from "./Stats";

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replays, setReplays] = useState([]);
  const [playerId, setPlayerId] = useState("");
  const replayIds = new Set();
  // eventually this should be generated using the playerId/the input (either once it's compatible with names, or by using the inputted id)
  const playerName = "BijouBug"; // Replace with the actual player name if needed

  const fetchReplays = async (playerId) => {
    try {
      const startTime = new Date().getTime();
      const response = await fetch("/api/players/fetch_replays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_id: playerId }),
      });
      if (response.status >= 400) {
        throw new Error("server error");
      }
      const data = await response.json();
      const uniqueReplays = data.filter((replay) => {
        if (replayIds.has(replay.replay_id)) {
          return false;
        } else {
          replayIds.add(replay.replay_id);
          return true;
        }
      });
      setReplays((prevReplays) => [...prevReplays, ...uniqueReplays]);
      const endTime = new Date().getTime();
      const apiResponseTime = endTime - startTime;
      console.log("result:", apiResponseTime, "ms");
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchReplays(playerId);
  };

  useEffect(() => {
    fetchReplays("steam:76561198136291441");
  }, []);

  if (loading) return <div className="loading">LOADING...</div>;
  if (error)
    return (
      <p className="error">
        A network error was encountered. Check your internet connection and try
        again.
      </p>
    );

  return (
    <div>
      <h1>stats</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="Enter Player ID"
        />
        <button type="submit">Get Replays</button>
      </form>

      <div style={{ margin: "2rem" }}>
        <h2>games:</h2>
        <br />
        <div style={{ fontSize: "1.1rem" }}>
          <br />
          <Stats replays={replays} playerName={playerName} />
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
                // console.log("id:", replay.replay_id);
                console.log(
                  "playlist:",
                  replay["replay_stats"][0]["stats"]["playlist_id"]
                );

                return (
                  <tr key={replay.replay_id}>
                    <td>{num}</td>
                    <td>{replay.replay_id}</td>
                    <td>
                      {(
                        getPercentSupersonicSpeed(
                          replay["replay_stats"][0]["stats"],
                          playerName
                        ) || 0
                      ).toFixed(2)}
                      %
                    </td>
                    <td>
                      {getDemosInflicted(
                        replay["replay_stats"][0]["stats"],
                        playerName
                      ) || 0}
                    </td>
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

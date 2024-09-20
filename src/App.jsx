import { useState, useEffect, useRef } from "react";
import "./App.css";
import { useReplays } from "./ReplaysContext";
import { wrappedUtils } from "./utils";

import Stats from "./Stats";

function App() {
  const {
    replays,
    setReplays,
    loading,
    setLoading,
    error,
    setError,
    playerName,
    setPlayerName,
  } = useReplays();

  const [playerId, setPlayerId] = useState("");
  const matchGuids = new Set();
  const initialFetch = useRef(true);

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
      console.log("fetched replays:", data);
      const uniqueReplays = data.filter((replay) => {
        if (matchGuids.has(replay["replay_stats"][0]["stats"]["match_guid"])) {
          return false;
        } else {
          matchGuids.add(replay["replay_stats"][0]["stats"]["match_guid"]);
          return true;
        }
      });
      console.log("Unique replays:", uniqueReplays);

      // setReplays((prevReplays) => [...prevReplays, ...uniqueReplays]);
      setReplays([...uniqueReplays]);
      const endTime = new Date().getTime();
      const apiResponseTime = endTime - startTime;
      console.log("result:", apiResponseTime, "ms");
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // currently have to submit twice the first time before stats component appears, perhaps because of order of things?
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchReplays(playerId);
    getPlayerName(playerId);
  };

  function getPlayerName(playerId) {
    const splitId = playerId.split(":")[1];
    const newPlayerName = wrappedUtils.getPlayerNameById(replays[0], splitId);
    setPlayerName(newPlayerName);
  }

  useEffect(() => {
    if (initialFetch.current) {
      initialFetch.current = false;
      fetchReplays(playerId);
    }
  }, []);

  if (loading) return <div className="loading">LOADING...</div>;
  if (error)
    return (
      <p className="error">
        A network error was encountered. Check your internet connection and try
        again.
      </p>
    );

  console.log("player name:", playerName);
  console.log(
    replays.map((replay) => {
      return replay["replay_stats"][0]["stats"];
    })
  );

  return (
    <div>
      <h1>Statchasing</h1>

      <form onSubmit={handleSubmit}>
        <label>
          player IDs can be found in the URL of a player's Ballchasing profile,
          formatted as the platform followed by the ID number/name, replacing
          the slash (/) in the URL with a colon (:)
          <br />
          <br />
          steam:76561198136291441
          <br />
          epic:b843b77c31e74c6fa970db08f5796805
          <br />
          ps4:badwifibro
          <br />
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Enter Player ID"
          />
        </label>
        <button type="submit">Get Replays</button>
      </form>

      {/* would like to display a message when a player wasn't found/when player has no replays available */}
      {playerName && (
        <div style={{ margin: "2rem" }}>
          <div style={{ fontSize: "1.1rem" }}>
            <br />
            <Stats replays={replays} playerName={playerName} />
          </div>
          <br />
        </div>
      )}
    </div>
  );
}

export default App;

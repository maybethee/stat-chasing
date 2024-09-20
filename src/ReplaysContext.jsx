import { createContext, useContext, useState } from "react";

const ReplaysContext = createContext();

const useReplays = () => useContext(ReplaysContext);

const ReplaysProvider = ({ children }) => {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState(null);

  return (
    <ReplaysContext.Provider
      value={{
        replays,
        setReplays,
        loading,
        setLoading,
        error,
        setError,
        playerName,
        setPlayerName,
      }}
    >
      {children}
    </ReplaysContext.Provider>
  );
};

export { useReplays, ReplaysProvider };

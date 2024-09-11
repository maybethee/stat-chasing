import { useState } from "react";
import { useReplays } from "./ReplaysContext";
import { wrappedUtils } from "./utils";

function MovementStats() {
  const { replays, playerName } = useReplays();
  const [playlist, setPlaylist] = useState(null);

  function filterReplays() {
    let replaysArr = replays;

    if (playlist) {
      replaysArr = replays.filter((replay) => {
        const inPlaylist = wrappedUtils.inPlaylist(replay, playlist);
        return inPlaylist;
      });
    }

    return replaysArr || [];
  }

  function avgSupersonic() {
    const filteredReplays = filterReplays();

    // console.log(
    //   "remaining replay id:",
    //   filteredReplays.map((replay) => {
    //     return replay["replay_stats"][0]["stats"]["playlist_id"];
    //   })
    // );

    const sum = filteredReplays.reduce(
      (sum, replay) =>
        sum + wrappedUtils.getPercentSupersonicSpeed(replay, playerName),
      0
    );
    const avg = sum / filteredReplays.length;
    return avg.toFixed(2);
  }

  function avgBPM() {
    const filteredReplays = filterReplays();

    const sum = filteredReplays.reduce(
      (sum, replay) => sum + wrappedUtils.getBPM(replay, playerName),
      0
    );
    const avg = sum / filteredReplays.length;
    return avg.toFixed(2);
  }

  function avgBCPM() {
    const filteredReplays = filterReplays();

    const sum = filteredReplays.reduce(
      (sum, replay) => sum + wrappedUtils.getBCPM(replay, playerName),
      0
    );
    const avg = sum / filteredReplays.length;
    return avg.toFixed(2);
  }

  function avgOfAvgSpeed() {
    const filteredReplays = filterReplays();

    const sum = filteredReplays.reduce(
      (sum, replay) => sum + wrappedUtils.getAvgSpeed(replay, playerName),
      0
    );
    return sum / filteredReplays.length;
  }

  function formatAvgOfAvgSpeed() {
    const avg = avgOfAvgSpeed();

    const avgAsPercent = (avg / 2300) * 100;
    return avgAsPercent.toFixed(2) + "%" + " (" + Math.trunc(avg) + "uu/s)";
  }

  // default should be the initial replays array
  function sumTotalDistance(replaysArr = replays) {
    return replaysArr.reduce(
      (sum, replay) => sum + wrappedUtils.getTotalDistance(replay, playerName),
      0
    );
  }

  function avgDistance() {
    const filteredReplays = filterReplays();
    const sum = sumTotalDistance(filteredReplays);
    const avg = sum / filteredReplays.length;
    return avg.toFixed(2);
  }

  return (
    <div>
      <h2>Movement/Speed Stats</h2>
      <br />
      <button onClick={() => setPlaylist(null)}>all games</button>
      <button onClick={() => setPlaylist("ranked-duels")}>1s</button>
      <button onClick={() => setPlaylist("ranked-doubles")}>2s</button>
      <button onClick={() => setPlaylist("ranked-standard")}>3s</button>
      <br />
      <br />

      <ul>
        <li>average % supersonic: {avgSupersonic()}%</li>
        <li>average overall speed: {formatAvgOfAvgSpeed()}</li>
        <br />

        <li>average boost used per minute: {avgBPM()}</li>
        <li>average boost collected per minute: {avgBCPM()}</li>
        <br />
        <li>average distance driven per game: {avgDistance()}</li>
        <br />
        <li> total distance driven across all games: {sumTotalDistance()}</li>
      </ul>
    </div>
  );
}

export default MovementStats;

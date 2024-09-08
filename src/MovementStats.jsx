import { useReplays } from "./ReplaysContext";
import { wrappedUtils } from "./utils";

function MovementStats() {
  const { replays, playerName } = useReplays();

  function avgSupersonic() {
    const sum = replays.reduce(
      (sum, replay) =>
        sum + wrappedUtils.getPercentSupersonicSpeed(replay, playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function avgBPM() {
    const sum = replays.reduce(
      (sum, replay) => sum + wrappedUtils.getBPM(replay, playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function avgBCPM() {
    const sum = replays.reduce(
      (sum, replay) => sum + wrappedUtils.getBCPM(replay, playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function avgOfAvgSpeed() {
    const sum = replays.reduce(
      (sum, replay) => sum + wrappedUtils.getAvgSpeed(replay, playerName),
      0
    );
    return sum / replays.length;
  }

  function formatAvgOfAvgSpeed() {
    const avg = avgOfAvgSpeed();

    const avgAsPercent = (avg / 2300) * 100;
    return avgAsPercent.toFixed(2) + "%" + " (" + Math.trunc(avg) + "uu/s)";
  }

  function sumTotalDistance() {
    return replays.reduce(
      (sum, replay) => sum + wrappedUtils.getTotalDistance(replay, playerName),
      0
    );
  }

  function avgDistance() {
    const sum = sumTotalDistance();
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  return (
    <div>
      <h2>Movement/Speed Stats</h2>
      <br />
      <ul>
        <li>average % supersonic: {avgSupersonic()}%</li>
        <li>average overall speed: {formatAvgOfAvgSpeed()}</li>
        <li>average boost used per minute: {avgBPM()}</li>
        <li>average boost collected per minute: {avgBCPM()}</li>
        <li>average distance driven per game: {avgDistance()}</li>
        <li> total distance driven across all games: {sumTotalDistance()}</li>
      </ul>
    </div>
  );
}

export default MovementStats;

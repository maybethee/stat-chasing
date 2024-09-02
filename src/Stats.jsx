import {
  getMapName,
  isPlayerWinner,
  getPercentSupersonicSpeed,
  getDemosInflicted,
} from "./utils";

function Stats({ replays, playerName }) {
  function avgSupersonic() {
    const sum = replays.reduce(
      (sum, replay) =>
        sum +
        getPercentSupersonicSpeed(
          replay["replay_stats"][0]["stats"],
          playerName
        ),
      0
    );
    const avg = sum / replays.length;
    console.log(avg);
    return avg.toFixed(2);
  }

  function avgDemos() {
    const sum = replays.reduce(
      (sum, replay) =>
        sum + getDemosInflicted(replay["replay_stats"][0]["stats"], playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }
  console.log(replays);
  const resultsPerMap = {};

  function addWinsPerMap() {
    replays.map((replay) => {
      const replayStats = replay["replay_stats"][0]["stats"];
      const mapName = getMapName(replayStats);
      resultsPerMap[mapName] = 0;
      if (isPlayerWinner(replayStats, playerName)) {
        resultsPerMap[mapName] = resultsPerMap[mapName] + 1;
      }
    });

    console.log(resultsPerMap);
  }

  addWinsPerMap();

  return (
    <div>
      <div style={{ fontSize: "1.1rem" }}>
        <br />
        average % supersonic: {avgSupersonic()}%
        <br />
        <br />
        average demos inflicted: {avgDemos()}
      </div>
    </div>
  );
}

export default Stats;

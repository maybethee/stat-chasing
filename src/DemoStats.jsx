import { useReplays } from "./ReplaysContext";
// import { getDemosInflicted, getDemosTaken } from "./utils";
import { wrappedUtils } from "./utils";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DemoStats() {
  const { replays, playerName } = useReplays();

  function avgDemosInflicted() {
    const sum = replays.reduce(
      (sum, replay) => sum + wrappedUtils.getDemosInflicted(replay, playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function avgDemosTaken() {
    const sum = replays.reduce(
      (sum, replay) => sum + wrappedUtils.getDemosTaken(replay, playerName),
      0
    );
    const avg = sum / replays.length;
    return avg.toFixed(2);
  }

  function highestDemoCount() {
    const demos = replays.map((replay) => {
      const demosInGame = wrappedUtils.getDemosInflicted(replay, playerName);
      return parseInt(demosInGame, 10);
    });
    return Math.max(...demos);
  }

  function demosInflictedTakenRatio() {
    return [avgDemosInflicted(), avgDemosTaken()];
  }

  return (
    <div>
      <h2>Demolition Stats</h2>
      <br />
      <div style={{ position: "relative", width: "400px" }}>
        <Pie
          data={{
            labels: ["demos inflicted", "demos taken"],
            datasets: [
              {
                label: "Demos",
                data: demosInflictedTakenRatio(),
                backgroundColor: ["rgb(54, 162, 235)", "rgb(255, 99, 132)"],
                hoverOffset: 4,
              },
            ],
          }}
        />
      </div>
      <ul>
        {/* <li>average demos inflicted: {avgDemosInflicted()}</li>
        <li>average demos taken: {avgDemosTaken()}</li> */}
        <li>most demoes in a single game: {highestDemoCount()}</li>
      </ul>
    </div>
  );
}

export default DemoStats;

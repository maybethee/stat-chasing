import { useReplays } from "./ReplaysContext";
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

function WinLossStats() {
  const { replays, playerName } = useReplays();

  function winRate() {
    let win = 0;
    replays.map((replay) => {
      if (wrappedUtils.isPlayerWinner(replay, playerName)) {
        win++;
      }
    });
    const rate = win / replays.length;
    return rate.toFixed(2);
  }

  const winRatePieData = () => {
    const winsAndLosses = [];
    const totalWins = replays.filter((replay) => {
      return wrappedUtils.isPlayerWinner(replay, playerName);
    });

    const totalLosses = replays.filter((replay) => {
      return !wrappedUtils.isPlayerWinner(replay, playerName);
    });

    winsAndLosses.push(totalWins.length, totalLosses.length);

    return winsAndLosses;
  };

  return (
    <div>
      <h2>Win/Loss Stats</h2>
      <br />
      <div style={{ position: "relative", width: "400px" }}>
        <Pie
          data={{
            labels: ["games won", "games lost"],
            datasets: [
              {
                label: "Games",
                data: winRatePieData(),
                backgroundColor: ["rgb(54, 162, 235)", "rgb(255, 99, 132)"],
                hoverOffset: 4,
              },
            ],
          }}
        />
      </div>
      <br />
      <ul>
        <li>win rate: {winRate()}</li>
      </ul>
    </div>
  );
}

export default WinLossStats;

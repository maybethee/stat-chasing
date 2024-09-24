import { useReplays } from "./ReplaysContext";
import { useState } from "react";
import { wrappedUtils } from "./utils";

function CarStats() {
  const { replays, playerName } = useReplays();
  const [usedCar, setUsedCar] = useState(null);
  const usedCarArr = getUsedCarsArr();

  function getUsedCarsArr() {
    let usedCars = [];

    replays.forEach((replay) => {
      const carName = wrappedUtils.getUsedCar(replay, playerName);

      usedCars.push(carName);
    });

    let usedCarUniqueArr = usedCars.filter(function (value, id, self) {
      return id == self.indexOf(value) && value != null;
    });

    return usedCarUniqueArr;
  }

  getUsedCarsArr();

  function filterReplaysByUsedCar() {
    let replaysWithUsedCar = replays;

    if (usedCar) {
      replaysWithUsedCar = replays.filter((replay) => {
        const hasUsedCar = wrappedUtils.withUsedCar(
          replay,
          playerName,
          usedCar
        );
        return hasUsedCar;
      });
    }

    return replaysWithUsedCar || [];
  }

  function avgMainCoreStats() {
    const filteredReplays = filterReplaysByUsedCar();

    let statsArr = filteredReplays.map((replay) =>
      wrappedUtils.getMainCoreStats(replay, playerName)
    );

    const coreStatAvgs = {};
    const stats = [
      "goals",
      "shots",
      "saves",
      "assists",
      "score",
      "shooting_percentage",
    ];

    stats.forEach((stat) => {
      const statSum = statsArr.reduce((sum, obj) => sum + obj[stat], 0);
      coreStatAvgs[stat] = (statSum / statsArr.length).toFixed(2);
    });

    return coreStatAvgs;
  }

  const coreStatAvgs = avgMainCoreStats();

  return (
    <div>
      <h2>Car Stats</h2>
      <br />
      <button onClick={() => setUsedCar(null)}>all cars</button>
      {usedCarArr.map((car) => {
        return (
          <button onClick={() => setUsedCar(car)} key={car}>
            {car}
          </button>
        );
      })}
      <br />
      <br />
      <table>
        <caption>Averages</caption>
        <tr>
          <th>score</th>
          <th>goals</th>
          <th>assists</th>
          <th>shots</th>
          <th>saves</th>
          <th>shooting percentage</th>
        </tr>
        <tr>
          <td>{coreStatAvgs.score}</td>
          <td>{coreStatAvgs.goals}</td>
          <td>{coreStatAvgs.assists}</td>
          <td>{coreStatAvgs.shots}</td>
          <td>{coreStatAvgs.saves}</td>
          <td>{coreStatAvgs.shooting_percentage}</td>
        </tr>
      </table>
    </div>
  );
}

export default CarStats;

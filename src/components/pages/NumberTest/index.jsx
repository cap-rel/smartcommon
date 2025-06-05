import { useState } from 'react';
import { isArray, isNumber } from '../../../globals';

const NumberSelector = () => {
  const numbers = Array.from({ length: 30 }, (_, i) => i + 1);
  const [selection, setSelection] = useState(null); // currentValue
  const [origin, setOrigin] = useState(null); // intervalOrigin

  const { currentValue, setValue } = useValue();

  const handleClick = (day) => {
    if (isNumber(currentValue)) { // isNumber
      if (currentValue !== day) {
        const newInterval = [Math.min(currentValue, day), Math.max(currentValue, day)];
        setSelection(newInterval);
        setOrigin(currentValue); // on garde le point de départ
      }
    } else if (isArray(currentValue)) {
      const [start, end] = currentValue;

      // Si on clique sur le point d'origine ou l'autre extrémité, on reset à un seul nombre
      if (day === start || day === end) {
        setSelection(day);
        setOrigin(day);
      } else {
        // On garde le point d'origine pour ajuster l’autre extrémité
        const newInterval = [Math.min(origin, day), Math.max(origin, day)];
        setSelection(newInterval);
        // origin reste inchangé
      }
    }
  };

  const isSelected = (day) => {
    if (isArray(currentValue)) {
      return currentValue === day;
    }

    if (isArray(currentValue)) {
      return day >= currentValue[0] && day <= currentValue[1];
    }

    return false;
  };

  return (
    <div className="grid grid-cols-6 gap-2 p-4">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => handleClick(num)}
          className={`p-2 border rounded ${
            isSelected(num) ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
        >
          {num}
        </button>
      ))}
      <div className="col-span-6 mt-4">
        <strong>Selection: </strong>
        {selection === null
          ? 'Aucune'
          : Array.isArray(selection)
          ? `[${selection[0]}, ${selection[1]}]`
          : selection}
      </div>
    </div>
  );
};

export default NumberSelector;
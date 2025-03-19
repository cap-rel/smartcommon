import { useEffect, useMemo, useRef, useState } from "react";
import { isNil } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { Button } from "../../others";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

export const Calendar = () => {

  // Fonction pour obtenir le jour de la semaine d'une date donnée
  function getDayOfWeek(dateString) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  }
  
  // Fonction pour générer le calendrier pour une année
  function generateYearCalendar(year) {
    const yearData = { year, months: [] };
  
    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(year, month, 1);
      // const firstDayOfWeek = getDayOfWeek(firstDayOfMonth.toISOString().split('T')[0]); // Jour de la semaine pour le premier jour du mois
      const daysInMonth = new Date(year, month + 1, 0).getDate(); // Nombre de jours dans le mois
  
      const monthData = {
        month: month + 1,
        name: firstDayOfMonth.toLocaleString('default', { month: 'long' }), // Nom complet du mois (Janvier, Février, etc.)
        days: []
      };
  
      // Remplir les jours du mois
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        monthData.days.push({
          day,
          weekday: getDayOfWeek(date.toISOString().split('T')[0])
        });
      }
  
      yearData.months.push(monthData);
    }
  
    return yearData;
  }
  
  // Générer le calendrier pour les années 2000 à 2050
  // const calendarData = [];
  // for (let year = 2000; year <= 2050; year++) {
  //   calendarData.push(generateYearCalendar(year));
  // }

  const [year, setYear] = useState(2000);
  
  const months = generateYearCalendar(year).months;
  
  const { states, set } = useStates({
    month: months[0],
    test: 4,
  })

  const { month, test } = states;

  const monthBefore = month.month === 1 ? null : months[month.month - 2];
  const monthAfter = month.month === 12 ? null : months[month.month];

  return (
    <div className={`col bg-strong z-50 shadow-md`}>
        <div className={`row-between-center p-2`}>
            <Button
                left={<FaArrowLeft />} 
                className={`text-primary bg-strong`}
                onClick={() => {
                    if (!isNil(monthBefore)) {
                        set("month", monthBefore)
                    }
                }}
            />
                {/* {!isNil(monthBefore) && monthBefore.name} */}
            <div className={`text-xl font-medium uppercase row-v-center gap-4`}>
              <div onClick={() => yearRef.current.click()} className={`relative`}>
                {month.name}
                <select onChange={e => set("month", months[e.target.value - 1])} value={month} className={`absolute opacity-0 inset-0`} id={`year`}>
                  {months.map((option, OI) =>
                    <option key={`month${OI}`} value={option.month}>{option.name}</option>
                  )}
                </select>
              </div>
              <div className={`relative`}>
                {year}
                <select onChange={e => setYear(e.target.value)} value={year} className={`absolute opacity-0 inset-0`} id={`year`}>
                  {Array.from([2000, 2001, 2002, 2003]).map((option, OI) =>
                    <option key={`year${OI}`}>{option}</option>
                  )}
                </select>
              </div>
              
            </div>
            <Button 
                left={<FaArrowRight/>}
                className={`text-primary bg-strong`}
                onClick={() => {
                    if (!isNil(monthAfter)) {
                        set("month", monthAfter)
                    }
                }}
            />
                {/* {!isNil(monthAfter) && monthAfter.name} */}
        </div>

        <div className={`relative`}>
          <div 
              style={{ backgroundImage: `linear-gradient(to right, var(--color-strong), transparent 5%, transparent 95%, var(--color-strong))` }}
              className={`absolute inset-0 pointer-events-none`} 
          />
          <div className={`row-v-center gap-2 overflow-x-auto p-4 pt-0 -mx-2 scroll-hidden`}>
              {month.days.map((day, DI) => 
                <div className={`col-h-center gap-1`}>
                  <div className={`uppercase text-soft-text font-bold`}>
                    {day.weekday.slice(0, 1)}
                  </div>
                  <div className={`font-semibold size-9 row-full-center rounded-md ${day.day === test ? "bg-primary text-white" : "bg-strong text-strong-text"}`}>
                      {day.day}
                  </div>
                </div>
              )}
          </div>
        </div>
    </div>
  );
}
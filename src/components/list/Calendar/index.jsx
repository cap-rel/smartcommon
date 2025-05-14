import { useEffect, useMemo, useRef, useState } from "react";
import { isNil } from "../../../globals/functions";
import { useStates, useVariantToProps } from "../../../hooks";
import { Button } from "../../others";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { propTypes } from "./props";

// IDEA interval

export const Calendar = (props) => {
  const { variantProps, mergeProps } = useVariantToProps("calendar", props);

  const { id, yearsInterval, value, onChange } = variantProps;

  // Fonction pour obtenir le jour de la semaine d'une date donnée
  const getDayOfWeek = (dateString) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  }
  
  // Fonction pour générer le calendrier pour une année
  const generateYearCalendar = (year) => {
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

  const [year, setYear] = useState((new Date).getFullYear());
  
  const months = generateYearCalendar(year).months;
  
  const { states, set } = useStates({
    month: months[0],
    test: 4,
  })

  const { month, test } = states;

  const monthBefore = month.month === 1 ? null : months[month.month - 2];
  const monthAfter = month.month === 12 ? null : months[month.month];

  return (
    <div { ...mergeProps("container", props => ({
      ...props,
      className: `sticky top-0 z-30 flex flex-col bg-soft-bg shadow-md rounded-b-app-base py-app-xs gap-app-xs`
    }))}>

        <div { ...mergeProps("upperContainer", props => ({
          ...props,
          className: `flex justify-between items-center gap-app-xs px-app-xs`
        }))}>

            <Button { ...mergeProps("PreviousButton", props => ({
              icon: <FaArrowLeft />,
              ...props,
              buttonProps: {
                ...props.buttonProps,
                className: `bg-soft-bg p-app-xs text-soft-text text-app-lg`,
                onClick: e => {
                  props.buttonProps?.onClick(e);
                  if (!isNil(monthBefore)) {
                    set("month", monthBefore);
                  }
                }
              }
            }))}/>

            <div { ...mergeProps("monthAndYearContainer", props => ({
              ...props,
              className: `text-app-base font-app-semibold uppercase flex items-center gap-app-xs`
            }))}>

              <div { ...mergeProps("month", props => ({
                  ...props,
                  className: `relative`
              }))}>

                {month.name}

                <select 
                  onChange={e => set("month", months[e.target.value - 1])} 
                  value={month} 
                  className={`absolute opacity-0 inset-0`} 
                >
                  {months.map((option, OI) =>
                    <option 
                      key={`month${OI}`} 
                      value={option.month}
                    >
                      {option.name}
                    </option>
                  )}
                </select>

              </div>

              <div { ...mergeProps("year", props => ({
                  ...props,
                  className: `relative`
              }))}>

                {year}

                <select 
                  onChange={e => setYear(e.target.value)} 
                  value={year} 
                  className={`absolute opacity-0 inset-0`}
                >
                  {Array.from([2000, 2001, 2002, 2003]).map((option, OI) =>
                    <option key={`year${OI}`}>{option}</option>
                  )}
                </select>

              </div>
              
            </div>

            <Button { ...mergeProps("NextButton", props => ({
              icon: <FaArrowRight />,
              ...props,
              buttonProps: {
                ...props.buttonProps,
                className: `bg-soft-bg p-app-xs text-soft-text text-app-lg`,
                onClick: e => {
                  props.buttonProps?.onClick(e);
                  if (!isNil(monthAfter)) {
                    set("month", monthAfter);
                  }
                }
              }
            }))}/>

        </div>

        <div { ...mergeProps("lowerContainer", props => ({
            ...props,
            className: `flex items-center gap-app-xs overflow-x-auto text-app-sm mx-app-xs`
        }))}>
        
            {month.days.map((day, DI) => 
              <div { ...mergeProps("dayAndNumberContainer", props => ({
                  ...props,
                  className: `flex flex-col items-center gap-app-xxs`
              }))}>
                <div { ...mergeProps("weekDay", props => ({
                    ...props,
                    className: `uppercase text-soft-text font-app-semibold`
                }))}>
                  {day.weekday.slice(0, 1)}
                </div>
                <div { ...mergeProps("day", props => ({
                    ...props,
                    className: `size-8 flex justify-center items-center rounded-app-md text-soft-text font-app-semibold
                    ${day.day === test ? "bg-primary text-white" : "bg-soft-bg text-strong-text active:brightness-soft"}`
                }))}> 
                    {day.day}
                </div>
                {/* className={`font-semibold size-9 flex justify-center items-center rounded-md ${day.day === test ? "bg-primary text-white" : "bg-strong text-strong-text"}`}> */}
              </div>
            )}

        </div>
    </div>
  );
}

Calendar.propTypes = propTypes;
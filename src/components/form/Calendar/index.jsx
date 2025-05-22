import { useEffect, useMemo, useRef, useState } from "react";
import { applyFunctionIfNotNil, formatDate, isNil } from "../../../globals/functions";
import { useStates, useValue, useVariantToProps } from "../../../hooks";
import { Button } from "../../others";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { propTypes } from "./props";

// IDEA interval

export const Calendar = (props) => {
  const { variantProps, mergeProps } = useVariantToProps("calendar", props);

  const dateNow = formatDate(new Date(Date.now()), "seconds-timestamp");

  const { 
    id,
    yearsInterval = [2000, 2030],
    name,
    defaultValue,
    value,
    onChange
  } = variantProps;

  const { currentValue, setValue } = useValue(defaultValue ?? dateNow, value, onChange);

  const allYears = [];
  for (let year = yearsInterval[0]; year <= yearsInterval[1]; year++) {
    allYears.push(year);
  }

  // Fonction pour obtenir le jour de la semaine d'une date donnée
  const getDayOfWeek = (dateString) => {
    // const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
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
        number: month + 1,
        name: firstDayOfMonth.toLocaleString('default', { month: 'long' }), // Nom complet du mois (Janvier, Février, etc.)
        days: []
      };
  
      // Remplir les jours du mois
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        monthData.days.push({
          number: day,
          weekday: getDayOfWeek(date.toISOString().split('T')[0])
        });
      }
  
      yearData.months.push(monthData);
    }
  
    return yearData;
  }

  const dateValue = new Date(currentValue * 1000);

  const { states, set } = useStates({
    year: dateValue.getFullYear(),
    month: dateValue.getMonth() + 1,
  });

  const { year, month } = states;
  
  const months = useMemo(() => generateYearCalendar(year).months, [year]);

  const getPreviousMonth = () => {
    if (month === 1) {
      set("month", 12);
      set("year", year - 1);
    } else {
      set("month", month - 1);
    }
  };

  const getNextMonth = () => {
    if (month === 12) {
      set("month", 1);
      set("year", year + 1);
    } else {
      set("month", month + 1);
    }
  };

  const lowerContainerRef = useRef();
  const dayRef = useRef();

  useEffect(() => {
    const lowerContainer = lowerContainerRef.current;
    if (!isNil(lowerContainer)) {
      lowerContainer.scrollLeft = 0;

      lowerContainer.style.scrollBehavior = "auto";
      lowerContainer.scrollLeft = 0;
    
      requestAnimationFrame(() => {
        lowerContainer.style.scrollBehavior = "smooth";
      });
    }
  }, [month, year]);

  useEffect(() => {  
    const lowerContainer = lowerContainerRef.current;
    if (!isNil(lowerContainer) && month - 1 === dateValue.getMonth() && year === dateValue.getFullYear()) {
      const selectedDay = lowerContainer.querySelector(`[data-number='${dateValue.getDate()}']`);
  
      const offset = selectedDay.offsetLeft - lowerContainer.offsetLeft;
      const scroll = offset - (lowerContainer.clientWidth / 2) + (selectedDay.clientWidth / 2);

      lowerContainer.scrollTo({ left: scroll, behavior: 'auto' });
    }
  }, [month, year, currentValue]);

  return (
    <div { ...mergeProps("container", props => ({
      ...props,
      className: `sticky top-0 z-30 flex flex-col bg-soft-bg shadow-md rounded-b-app-base py-app-xs gap-app-xs`
    }))}>
        <input
          name={name}
          value={currentValue}
          onChange={() => {}}
          hidden
        />

        <div { ...mergeProps("upperContainer", props => ({
          ...props,
          className: `flex justify-between items-center gap-app-xs px-app-xs`
        }))}>

            <Button { ...mergeProps("PreviousButton", props => ({
              icon: <FaArrowLeft />,
              ...props,
              onClick: e => {
                e.preventDefault();
                getPreviousMonth();
                applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
              },
              buttonProps: {
                ...props.buttonProps,
                className: `bg-soft-bg p-app-xs text-soft-text text-app-lg`,
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

                {months[month - 1].name}

                <select 
                  onChange={e => set("month", Number(e.target.value))} 
                  value={month} 
                  className={`absolute opacity-0 inset-0`} 
                >
                  {months.map((month, OI) =>
                    <option 
                      key={`month${OI}`} 
                      value={month.number}
                    >
                      {month.name}
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
                  onChange={e => set("year", Number(e.target.value))} 
                  value={year} 
                  className={`absolute opacity-0 inset-0`}
                >
                  {allYears.map((year, OI) =>
                    <option key={`year${OI}`}>{year}</option>
                  )}
                </select>

              </div>
              
            </div>

            <Button { ...mergeProps("NextButton", props => ({
              icon: <FaArrowRight />,
              ...props,
              onClick: e => {
                e.preventDefault();
                getNextMonth();
                applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
              },
              buttonProps: {
                ...props.buttonProps,
                className: `bg-soft-bg p-app-xs text-soft-text text-app-lg`,
              }
            }))}/>

        </div>

        <div { ...mergeProps("lowerContainer", props => ({
            ...props,
            ref: lowerContainerRef,
            className: `flex items-center gap-app-xs overflow-x-auto text-app-sm mx-app-xs`
        }))}>
        
          {months[month - 1].days.map((day, DI) => {
            const { number, weekday } = day;
            const isSelected = number === dateValue.getDate() && month - 1 === dateValue.getMonth() && year === dateValue.getFullYear()
            return (
              <div key={`day${DI}`} { ...mergeProps("weekDayAndNumberContainer", props => ({
                ...props,
                "data-number": number,
                className: `flex flex-col items-center gap-app-xxs`
              }))}>
                <div { ...mergeProps("weekDay", props => ({
                    ...props,
                    className: `uppercase text-soft-text font-app-semibold`
                }))}>
                  {weekday.slice(0, 1)}
                </div>
                <div { ...mergeProps("day", props => ({
                    ...props,
                    ref: isSelected ? dayRef : null,
                    onClick: e => {
                      setValue(formatDate(new Date(year, month - 1, number), "seconds-timestamp"));
                      applyFunctionIfNotNil(props.onClick, e);
                    },
                    className: `size-8 flex justify-center items-center rounded-app-md text-soft-text font-app-semibold
                    ${isSelected ? "bg-primary text-white" : "bg-soft-bg text-strong-text active:brightness-soft"}`
                }))}> 
                    {number}
                </div>
                {/* className={`font-semibold size-9 flex justify-center items-center rounded-md ${day.day === test ? "bg-primary text-white" : "bg-strong text-strong-text"}`}> */}
              </div>
            );
            })}

        </div>
    </div>
  );
}

Calendar.propTypes = propTypes;
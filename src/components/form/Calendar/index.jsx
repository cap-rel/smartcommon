import { useEffect, useMemo, useRef, useState } from "react";
import { applyFunctionIfNotNil, isArray, isNil, isNumber, ISOFormat, isString } from "../../../globals/functions";
import { useStates, useValue, useVariantToProps } from "../../../hooks";
import { Button } from "../../others";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { propTypes } from "./props";

// IDEA interval

export const Calendar = (props) => {
  const { variantProps, mergeProps } = useVariantToProps("calendar", props);

  const { 
    id,
    yearsInterval = [2000, 2030],
    name,
    defaultValue,
    items = [],
    value,
    onChange
  } = variantProps;

  const { currentValue, setValue } = useValue(defaultValue ?? null, value, onChange);

  const allYears = [];
  for (let year = yearsInterval[0]; year <= yearsInterval[1]; year++) {
    allYears.push(year);
  }

  // Fonction pour générer le calendrier pour une année
  const generateYearCalendar = (year) => {
    const yearData = { year, months: [] };
  
    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(year, month, 1);
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
          weekday: date.toLocaleDateString('default', { weekday: 'long' })
        });
      }
  
      yearData.months.push(monthData);
    }
  
    return yearData;
  }

  const dateNow = new Date();

  const initialStates = () => {
    let year = dateNow.getFullYear();
    let month = dateNow.getMonth() + 1;
    let origin = null;
    let lastSelected = null;

    if (isString(currentValue)) {
      const date = new Date(currentValue);

      year = date.getFullYear();
      month = date.getMonth() + 1;
      origin = currentValue;
      lastSelected = currentValue;
    } else if (isArray(currentValue)) {
      const date = new Date(currentValue[0]);

      year = date.getFullYear();
      month = date.getMonth() + 1;
      origin = currentValue[0];
      lastSelected = currentValue[0];
    }

    return { year, month, origin, lastSelected };
  }

  const { states, set } = useStates(initialStates());

  const { year, month, origin, lastSelected } = states;
  
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
    let scrollDate = dateNow;
    
    // if (isString(currentValue)) {
    //   scrollDate = new Date(currentValue);
    // } else if (isArray(currentValue)) {
    //   scrollDate = new Date(currentValue[0]);
    // }

    if (!isNil(lastSelected)) {
      scrollDate = new Date(lastSelected);
    }
    
    if (!isNil(lowerContainer) && month - 1 === scrollDate.getMonth() && year === scrollDate.getFullYear()) {
      const selectedDay = lowerContainer.querySelector(`[data-number='${scrollDate.getDate()}']`);
  
      const offset = selectedDay.offsetLeft - lowerContainer.offsetLeft;
      const scroll = offset - (lowerContainer.clientWidth / 2) + (selectedDay.clientWidth / 2);

      lowerContainer.scrollTo({ left: scroll, behavior: 'auto' });
    }
  }, [lastSelected]);

   const handleNumberOnClick = (date) => {
    if (isNil(currentValue)) {      
      // set("lastSelected", date);
      set("origin", date);
      setValue(date);
    } else if (isString(currentValue)) {
      if (currentValue !== date) {
        const currentValueDate = new Date(currentValue);
        const dateDate = new Date(date);

        const newInterval = [
          ISOFormat(new Date(Math.min(currentValueDate.getTime(), dateDate.getTime())), "date"),
          ISOFormat(new Date(Math.max(currentValueDate.getTime(), dateDate.getTime())), "date"),
        ];

        set("origin", currentValue);
        // set("lastSelected", date);
        setValue(newInterval);
      } else {
        set("origin", null);
        // set("lastSelected", null);
        setValue(null);
      }
    } else if (isArray(currentValue)) {
      const [start, end] = currentValue;
      
      if (date === start || date === end) {
        set("origin", date);
        setValue(date);
      } else {
        const originDate = new Date(origin);
        const dateDate = new Date(date);

        const newInterval = [
          ISOFormat(new Date(Math.min(originDate.getTime(), dateDate.getTime())), "date"),
          ISOFormat(new Date(Math.max(originDate.getTime(), dateDate.getTime())), "date"),
        ];

        setValue(newInterval);
        // origin reste inchangé
      }
    }

    set("lastSelected", date);
  };
  
  // const isSelected = (date) => {
  //   if (isString(currentValue)) {
  //     return currentValue === date;
  //   }

  //   if (isArray(currentValue)) {
  //     return date >= currentValue[0] && date <= currentValue[1];
  //   }

  //   return false;
  // };

  const isFirst = (date) => {
    if (isString(currentValue)) {
      return currentValue === date;
    }

    if (isArray(currentValue)) {
      return date === currentValue[0];
    }

    return false;
  };


  const isLast = (date) => {
    if (isString(currentValue)) {
      return currentValue === date;
    }

    if (isArray(currentValue)) {
      return date === currentValue[1];
    }

    return false;
  };

  const isLimit = (date) => {
    return isLast(date) || isFirst(date);
  };

  const isSelected = (date) => {
    if (isArray(currentValue)) {
      return date > currentValue[0] && date < currentValue[1];
    }

    return false;
  };

  return (
    <div { ...mergeProps("container", props => ({
      ...props,
      className: `sticky top-0 z-30 flex flex-col bg-soft-bg shadow-md rounded-b-app-base py-app-xs gap-app-xs`
    }))}>
        <input
          name={name}
          value={isArray(currentValue) ? currentValue[0] : null}
          onChange={() => {}}
          hidden
        />
        <input
          name={name}
          value={isArray(currentValue) ? currentValue[1] : null}
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
                  className={`absolute opacity-0 inset-0 text-strong-text`} 
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
                  className={`absolute opacity-0 inset-0 text-strong-text`}
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
            className: `flex items-center overflow-x-auto text-app-sm mx-app-xs`
        }))}>
        
          {months[month - 1].days.map((day, DI) => {
            const { number, weekday } = day;
            const date = ISOFormat(new Date(year, month - 1, number), "date");
            const badge = items.filter(item => item === date).length;
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
                <div { ...mergeProps("number", props => ({
                    ...props,
                    ref: isSelected ? dayRef : null,
                    onClick: e => {                      
                      handleNumberOnClick(date)
                      applyFunctionIfNotNil(props.onClick, e);
                    },
                    className: `relative h-8 w-10 flex justify-center items-center text-soft-text font-app-semibold duration-(--really-quick)
                    ${isLimit(date) ? `bg-primary text-white ${isFirst(date) && "rounded-l-app-md"} ${isLast(date) && "rounded-r-app-md"}` : isSelected(date) ? "bg-primary/50 text-white" : "bg-soft-bg text-strong-text active:brightness-soft rounded-app-md"}`
                }))}> 
                    {number}
                    {badge !== 0 &&
                      <div { ...mergeProps("badge", props => ({
                        ...props,
                        className: `absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 flex justify-center items-center size-5 text-app-xs rounded-full bg-secondary z-10 text-white`
                      }))}>
                        {badge}
                      </div>
                    }
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
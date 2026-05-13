import { useEffect, useMemo, useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { isNil, isArray, isString } from "lodash";

import { applyFunctionIfNotNil, ISOFormat, toMsTimestamp } from "lib/utils";
import { useStates, useField, useVariantMerger } from "lib/hooks";
import { Button } from "lib/components";

import { propTypes, DEFAULT_LABELS } from "./props";

export const PlainCalendar = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("PlainCalendar", props);

  const {
    id,
    name,
    yearsInterval = [2000, 2030],
    interval = false,
    items = [],
    defaultValue,
    value,
    onChange,
    onMonthChange,
    onYearChange,
    labels,
  } = variantProps;

  const mergedLabels = { ...DEFAULT_LABELS, ...(labels ?? {}) };

  const { currentValue, setValue } = useField({
    name,
    defaultValue: defaultValue ?? null,
    value,
    onChange,
    errors: () => ({}),
  });

  const allYears = [];
  for (let year = yearsInterval[0]; year <= yearsInterval[1]; year++) {
    allYears.push(year);
  }

  // Build full year skeleton (used by header selects)
  const generateYearCalendar = (year) => {
    const yearData = { year, months: [] };

    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const monthData = {
        number: month + 1,
        name: firstDayOfMonth.toLocaleString("default", { month: "long" }),
        days: [],
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        monthData.days.push({
          number: day,
          weekday: date.toLocaleDateString("default", { weekday: "long" }),
        });
      }

      yearData.months.push(monthData);
    }

    return yearData;
  };

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
  };

  const { states, set } = useStates({ initialStates: initialStates(), debug: false });

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

  const handleNumberOnClick = (date) => {
    if (!interval) {
      setValue(date);
      set("lastSelected", date);
      return;
    }

    if (isNil(currentValue)) {
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
        setValue(newInterval);
      } else {
        set("origin", null);
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
      }
    }

    set("lastSelected", date);
  };

  const isFirst = (date) => {
    if (isString(currentValue)) return currentValue === date;
    if (isArray(currentValue)) return date === currentValue[0];
    return false;
  };

  const isLast = (date) => {
    if (isString(currentValue)) return currentValue === date;
    if (isArray(currentValue)) return date === currentValue[1];
    return false;
  };

  const isLimit = (date) => isLast(date) || isFirst(date);

  const isSelected = (date) => {
    if (isArray(currentValue)) {
      return date > currentValue[0] && date < currentValue[1];
    }
    return false;
  };

  useEffect(() => onMonthChange?.(month), [month]);
  useEffect(() => onYearChange?.(year), [year]);

  // Build 7-column grid with leading prev-month days and trailing next-month days
  const currentMonthDays = months[month - 1].days;
  const firstDayIndex = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  const prevMonthDate = new Date(year, month - 1, 0);
  const prevMonthDaysCount = prevMonthDate.getDate();

  const prevMonthDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push({
      number: prevMonthDaysCount - i,
      monthOffset: -1,
    });
  }

  const currentDays = currentMonthDays.map((d) => ({ ...d, monthOffset: 0 }));

  const totalCells = prevMonthDays.length + currentDays.length;
  const nextDaysCount = (7 - (totalCells % 7)) % 7;

  const nextMonthDays = Array.from({ length: nextDaysCount }, (_, i) => ({
    number: i + 1,
    monthOffset: 1,
  }));

  const calendarDays = [...prevMonthDays, ...currentDays, ...nextMonthDays];

  return (
    <div { ...mergeProps("container", p => ({
      ...p,
      "data-component": "PlainCalendar",
      className: `z-10 shadow-md mt-app-base duration-(--medium)
        flex flex-col bg-soft-bg rounded-b-app-base py-app-xs gap-app-xs ${p.className || ""}`,
    }))}>
      <input
        name={name}
        value={isArray(currentValue) ? (currentValue[0] ?? "") : ""}
        onChange={() => {}}
        hidden
      />
      <input
        name={name}
        value={isArray(currentValue) ? (currentValue[1] ?? "") : ""}
        onChange={() => {}}
        hidden
      />

      <div { ...mergeProps("upperContainer", p => ({
        ...p,
        className: `flex justify-between items-center gap-app-xs px-app-xs ${p.className || ""}`,
      }))}>

        <Button { ...mergeProps("PreviousButton", p => ({
          icon: FaArrowLeft,
          ...p,
          onClick: e => {
            e.preventDefault();
            getPreviousMonth();
            applyFunctionIfNotNil(p.onClick ?? p.buttonProps?.onClick, e);
          },
          buttonProps: {
            ...p.buttonProps,
            className: `bg-soft-bg p-app-xs text-soft-text text-app-lg ${p.buttonProps?.className || ""}`,
          },
        }))}/>

        <div { ...mergeProps("monthAndYearContainer", p => ({
          ...p,
          className: `text-app-base font-app-semibold uppercase flex items-center gap-app-xs ${p.className || ""}`,
        }))}>

          <div { ...mergeProps("month", p => ({
            ...p,
            className: `relative ${p.className || ""}`,
          }))}>
            {months?.[month - 1]?.name}

            <select { ...mergeProps("monthSelect", p => ({
              ...p,
              onChange: e => {
                set("month", Number(e.target.value));
                applyFunctionIfNotNil(p.onChange, e);
              },
              value: month,
              className: `absolute opacity-0 inset-0 text-strong-text ${p.className || ""}`,
            }))}>
              {months.map((m, OI) =>
                <option key={`month${OI}`} value={m.number}>
                  {m.name}
                </option>
              )}
            </select>
          </div>

          <div { ...mergeProps("year", p => ({
            ...p,
            className: `relative ${p.className || ""}`,
          }))}>
            {year}
            <select { ...mergeProps("yearSelect", p => ({
              ...p,
              onChange: e => {
                set("year", Number(e.target.value));
                applyFunctionIfNotNil(p.onChange, e);
              },
              value: year,
              className: `absolute opacity-0 inset-0 text-strong-text ${p.className || ""}`,
            }))}>
              {allYears.map((y, OI) =>
                <option key={`year${OI}`}>{y}</option>
              )}
            </select>
          </div>
        </div>

        <Button { ...mergeProps("NextButton", p => ({
          icon: FaArrowRight,
          ...p,
          onClick: e => {
            e.preventDefault();
            getNextMonth();
            applyFunctionIfNotNil(p.onClick ?? p.buttonProps?.onClick, e);
          },
          buttonProps: {
            ...p.buttonProps,
            className: `bg-soft-bg p-app-xs text-soft-text text-app-lg ${p.buttonProps?.className || ""}`,
          },
        }))}/>

      </div>

      <div { ...mergeProps("lowerContainer", p => ({
        ...p,
        ref: lowerContainerRef,
        className: `grid grid-cols-7 items-center overflow-x-auto text-app-sm mx-app-xs pb-app-xs gap-app-xxs ${p.className || ""}`,
      }))}>
        {(mergedLabels.weekdays ?? []).map((weekday) =>
          <div key={weekday} { ...mergeProps("weekDay", p => ({
            ...p,
            className: `text-center ${p.className || ""}`,
          }))}>
            {weekday}
          </div>
        )}
        {calendarDays.map((day, DI) => {
          const { number, monthOffset } = day;
          const displayMonth = month - 1 + monthOffset;
          const date = ISOFormat(new Date(year, displayMonth, number), "date");
          const isOutsideMonth = monthOffset !== 0;

          const badge = items.filter(item => ISOFormat(new Date(toMsTimestamp(item)), "date") === date).length;

          return (
            <div key={`day${DI}`} { ...mergeProps("weekDayAndNumberContainer", p => ({
              ...p,
              "data-number": number,
              "data-date": date,
              "data-outside-month": isOutsideMonth ? "true" : "false",
              className: `flex w-full flex-col items-center gap-app-xxs ${p.className || ""}`,
            }))}>
              <div { ...mergeProps("number", p => ({
                ...p,
                onClick: e => {
                  if (!isOutsideMonth) {
                    handleNumberOnClick(date);
                    applyFunctionIfNotNil(p.onClick, e);
                  }
                },
                className: `relative h-10 w-10 flex justify-center items-center text-soft-text duration-(--really-quick) rounded-app-md
                  ${isOutsideMonth ? "text-soft-text" : (isLimit(date) ? `bg-primary text-white font-app-semibold` : isSelected(date) ? "bg-primary/50 text-white font-app-semibold" : "bg-soft-bg text-strong-text active:brightness-soft")} ${p.className || ""}`,
              }))}>
                {number}
                {badge !== 0 &&
                  <div { ...mergeProps("badge", p => ({
                    ...p,
                    className: `absolute top-full right-0 -translate-y-3/4 translate-x-1/4 flex justify-center items-center size-5 text-app-xs rounded-full bg-secondary z-10 text-white ${p.className || ""}`,
                  }))}>
                    {badge}
                  </div>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

PlainCalendar.propTypes = propTypes;

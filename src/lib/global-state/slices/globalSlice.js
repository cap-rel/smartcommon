import { createSlice } from "@reduxjs/toolkit";

import { getLocal, getSession, removeLocal, removeSession, setLocal, setSession } from "lib/utils";
import { reduce } from "lodash";

// ---------------------- parsePath (Parser) ----------------------
const parsePath = (path) => {
  const parts = [];
  path.split(".").forEach(segment => {
    const regex = /([\w-]+)|\[(\d*)\]/g;
    let match;
    while ((match = regex.exec(segment)) !== null) {
      if (match[1]) parts.push(match[1]);
      else if (match[2] === "") parts.push("__PUSH__");
      else parts.push(match[2]);
    }
  });
  return parts;
};

// ---------------------- set ----------------------
const set = (acc, value, path) => {
  const newState = structuredClone(acc);
  const parts = parsePath(path);

  let level = newState;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const isNextPush = nextKey === "__PUSH__";

    if (level[key] !== Object(level[key])) {
      level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
    }

    if (!(key in level)) {
      level[key] = /^\d+$/.test(nextKey) || isNextPush ? [] : {};
    }

    level = level[key];
  }

  const lastKey = parts[parts.length - 1];

  const applyValue = (target, keyOrIndex) => {
    const prevValue =
      keyOrIndex === "__PUSH__"
        ? target[target.length - 1]
        : target[keyOrIndex];
    const newValue = typeof value === "function" ? value(prevValue) : value;

    if (keyOrIndex === "__PUSH__") {
      target.push(newValue);
    } else {
      target[keyOrIndex] = newValue;
    }
  };

  if (lastKey === "__PUSH__") {
    if (!Array.isArray(level)) {
      level = level instanceof Object ? level : [];
    }
    applyValue(level, "__PUSH__");
  } else {
    applyValue(level, lastKey);
  }

  return newState;
};

const storages = { ...getLocal("global"), ...getSession("global") };

const initialState = reduce(storages, set, {});

console.log(initialState);

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setGlobalStates(state, action) {
      state = action.payload;
    },
  },
});

export const globalReducer = globalSlice.reducer;
export const { setGlobalStates } = globalSlice.actions;
import { configureStore } from "@reduxjs/toolkit";
import trailReducer from "./trailState";

export const store = configureStore({
  reducer: {
    globalTrailsState: trailReducer,
  },
});

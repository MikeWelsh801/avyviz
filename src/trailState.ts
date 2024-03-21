import { createSlice, current } from "@reduxjs/toolkit";
import { TrailType } from "./generic_helpers/types";

const initialState = {
  currentTrail: undefined as TrailType | undefined,
  trails: [] as TrailType[],
};

export const trailSlice = createSlice({
  name: "trails",
  initialState: initialState,
  reducers: {
    addTrailToTrails: (state, action) => {
      state.trails.push(action.payload);
      console.log(state.trails);
    },
    removeTrailFromTrails: (state, action) => {
      //remove trail from trails array if it matches the action payload
      state.trails = state.trails.filter((trail) => trail.uid !== action.payload.uid);
    },
    testTrail: (state, action) => {
      console.log("testTrail action: ", action);
    },
    setCurrentTrail: (state, action) => {
      if (action.payload == undefined) {
        state.currentTrail = undefined;

        return;
      }
      if (state.currentTrail != undefined) {
        //check for duplicates before pushing
        let found = false;
        state.trails.forEach((trail) => {
          if (trail.uid == state.currentTrail?.uid) {
            found = true;
          }
        });
        if (found == false) {
          state.trails.push(state.currentTrail);
        }
      }
      state.currentTrail = action.payload;
      //remove new current trail from trails array
      state.trails.forEach((trail) => {
        if (state.currentTrail?.uid == trail.uid) {
          state.trails.splice(state.trails.indexOf(trail), 1);
        }
      });
    },
  },
});

export const { addTrailToTrails, removeTrailFromTrails, testTrail, setCurrentTrail } = trailSlice.actions;

export default trailSlice.reducer;

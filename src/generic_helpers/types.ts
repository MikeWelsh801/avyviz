import { Position, BBox } from "geojson";

export enum Keys {
  trailUIDs = "trailUIDs",
}

export type LatLong = {
  latitude: number;
  longitude: number;
};

export enum MapMode {
  edit = "edit",
  view = "view",
}

export enum pointerEventsTypes {
  dontAllowTouches = "none",
  allowTouches = "auto",
}

export enum TrailOriginType {
  user = "user",
  community = "community",
}

export type distance = {
  km: number,
  miles: number,
}

export type TrailType = {
  uid: number;
  trailName: string;
  trailPoints: Position[];
  trailDescription: string;
  type: TrailOriginType;
  editing: boolean;
  editable: boolean;
  region: string;
  state: string;
  totalDistance: distance,
  elevationGain: number,
  elevationLoss: number,
  averageSlope: number,
  averageAspect: number
};

export type DangerInfo = {
  shortDescription: string,
  color: string,
  travelAdvice: string,
  likeLihood: string,
  sizeAndDistribution: string
}

export type TrailGlobalStateType = {
  trails: TrailType[];
};

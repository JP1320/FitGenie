import { postJson } from "./client";

export const saveProfile = (payload: any) => postJson("/user/profile", payload);
export const scanBody = (payload: any) => postJson("/scan/body", payload);
export const getRecommendations = (payload: any) => postJson("/recommendations", payload);
export const generateFitCard = (payload: any) => postJson("/fit-card", payload);

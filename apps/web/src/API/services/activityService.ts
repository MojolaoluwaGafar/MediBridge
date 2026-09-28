import api from "../index";
import type { IActivitiesRes } from "../../types/apiReqRes";

export const activityService = {
  async getActivities(): Promise<IActivitiesRes> {
    const { data } = await api.get<IActivitiesRes>(
      "/api/activities"
    );

    return data;
  },
};
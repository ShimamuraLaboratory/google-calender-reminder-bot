export type AddCommandParams = {
  scheduleData: {
    title: string;
    startAt: string;
    endAt: string;
    description?: string;
    remindDays?: number;
    options?: {
      roleIds?: string[];
      memberIds?: string[];
    };
  };
};

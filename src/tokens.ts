export const TOKENS = {
  CommandHandler: Symbol.for("CommandHandler"),
  CronHandler: Symbol.for("CronHandler"),
  SubscribeCommandHandler: Symbol.for("SubscribeCommandHandler"),
  InteractiveHandler: Symbol.for("InteractiveHandler"),
  ModalHandler: Symbol.for("ModalHandler"),

  CommandService: Symbol.for("CommandService"),
  FetchServerInfoService: Symbol.for("FetchServerInfoService"),
  InteractionService: Symbol.for("InteractionService"),
  ModalService: Symbol.for("ModalService"),
  SubscribeService: Symbol.for("SubscribeService"),
  ReminderService: Symbol.for("ReminderService"),

  ScheduleRepository: Symbol.for("ScheduleRepository"),
  MemberRepository: Symbol.for("MemberRepository"),
  RoleRepository: Symbol.for("RoleRepository"),
  RemindRepository: Symbol.for("RemindRepository"),
  DiscordClient: Symbol.for("DiscordClient"),

  DISCORD_TOKEN: Symbol.for("DISCORD_TOKEN"),
  DISCORD_PUBLIC_KEY: Symbol.for("DISCORD_PUBLIC_KEY"),
  DISCORD_APP_ID: Symbol.for("DISCORD_APP_ID"),
  DISCORD_GUILD_ID: Symbol.for("DISCORD_GUILD_ID"),
  REMINDER_CHANNEL_ID: Symbol.for("REMINDER_CHANNEL_ID"),
  D1_DATABASE: Symbol.for("D1_DATABASE"),
};

import {
  CommandGroupBuilder,
  EmbedBuilder,
  ICommandGroup,
  MessageBuilder,
  SlashCommandContext,
  SubcommandOption
} from "interactions.ts";
import PermissionBits from "interactions.ts/dist/builders/commands/permissions/PermissionBits";

export class Config implements ICommandGroup {
  public builder = new CommandGroupBuilder("config", "Simple config command.")
    .addSubcommand(new SubcommandOption("set", "Set a config value."))
    .addSubcommand(new SubcommandOption("get", "Fetch a config value."))
    .addRequiredPermissions(PermissionBits.ADMINISTRATOR);

  public handlers = {
    set: {
      handler: async (ctx: SlashCommandContext): Promise<void> => {
        return ctx.reply(new MessageBuilder().addEmbed(new EmbedBuilder().setTitle("Set config value!")));
      }
    },
    get: {
      handler: async (ctx: SlashCommandContext): Promise<void> => {
        return ctx.reply(new MessageBuilder().addEmbed(new EmbedBuilder().setTitle("Fetched config value.")));
      }
    },
    joe: {
      real: {
        handler: async (ctx: SlashCommandContext): Promise<void> => {
          return ctx.reply(new MessageBuilder().addEmbed(new EmbedBuilder().setTitle("Real joe!")));
        }
      }
    }
  };

  public components = [];
}

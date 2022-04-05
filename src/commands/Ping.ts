import { UnsafeEmbedBuilder } from "@discordjs/builders";
import { MessageBuilder, SlashCommandBuilder, SlashCommandContext } from "interactions.ts";

export default class Ping extends SlashCommandBuilder {
  public name = "ping";
  public description = "Pong!";

  public handler = async (ctx: SlashCommandContext): Promise<void> => {
    return ctx.reply(new MessageBuilder().addEmbed(new UnsafeEmbedBuilder().setTitle("Pong!")));
  };
}

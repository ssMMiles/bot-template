import {
  ActionRowBuilder,
  Button,
  ButtonBuilder,
  ButtonContext,
  ButtonStyle,
  EmbedBuilder,
  ISlashCommand,
  MessageBuilder,
  SlashCommandBuilder,
  SlashCommandContext,
  SlashCommandStringOption
} from "interactions.ts";

type TestButtonState = {
  word: string;
};

export class Ping implements ISlashCommand {
  public builder = new SlashCommandBuilder("ping", "Simple ping command.").addStringOption(
    new SlashCommandStringOption("word", "Enter a word to store with the button.")
  );

  public handler = async (ctx: SlashCommandContext): Promise<void> => {
    const word = (ctx.options.get("word")?.value as string) ?? "Hello World!";
    const button = await ctx.manager.components.createInstance("test", { word: word });

    return ctx.reply(
      new MessageBuilder()
        .addEmbed(new EmbedBuilder().setTitle("Pong!"))
        .addComponents(new ActionRowBuilder().addComponents(button))
    );
  };

  public components = [
    new Button(
      "test",
      new ButtonBuilder().setEmoji({ name: "🔍" }).setStyle(ButtonStyle.Primary),
      async (ctx: ButtonContext<TestButtonState>): Promise<void> => {
        const word = ctx.state ? ctx.state.word : "Component state has expired.";

        return ctx.reply(new MessageBuilder().addEmbed(new EmbedBuilder().setTitle(word)));
      }
    ).setAllowExpired(true)
  ];
}

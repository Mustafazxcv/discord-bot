const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Mesajları siler.')
        .addIntegerOption(option => option.setName('amount').setDescription('Silinecek mesaj sayısı').setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply(`${amount} mesaj silindi.`);
    },
};

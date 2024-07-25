const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Hoş geldiniz mesajı ayarlar.'),
    async execute(interaction) {
        const channel = interaction.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        await channel.send('Hoş geldiniz!');
        await interaction.reply('Hoş geldiniz mesajı gönderildi.');
    },
};

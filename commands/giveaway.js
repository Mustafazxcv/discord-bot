const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Starts a giveaway')
        .addStringOption(option => 
            option.setName('prize')
                .setDescription('The prize for the giveaway')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the giveaway in seconds')
                .setRequired(true)),
    async execute(interaction) {
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getInteger('duration') * 1000; // Convert to milliseconds

        const giveawayEmbed = new EmbedBuilder()
            .setTitle('🎉 Çekiliş Başladı! 🎉')
            .setDescription(`Ödül: **${prize}**\nÇekilişe katılmak için 🎉 emojisine tıklayın!`)
            .setColor(0x00AE86)
            .setTimestamp()
            .setFooter({ text: 'Çekiliş sona erecek:', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        const message = await interaction.reply({ embeds: [giveawayEmbed], fetchReply: true });
        console.log(`Sent message with ID: ${message.id}`);

        await message.react('🎉').then(() => {
            console.log('Added 🎉 reaction to message');
        }).catch(console.error);

        // Collect reactions using awaitReactions
        const filter = (reaction, user) => reaction.emoji.name === '🎉' && !user.bot;
        const reactions = await message.awaitReactions({ filter, time: duration });
        
        console.log(`Collected reactions: ${reactions.size}`);
        
        const reaction = reactions.get('🎉');
        if (!reaction) {
            console.log('No reactions collected.');
            await interaction.followUp('Çekilişe katılım olmadı.');
            return;
        }

        const users = reaction.users.cache.filter(user => !user.bot);
        console.log(`Collected users: ${users.map(user => user.tag)}`);

        if (users.size === 0) {
            console.log('No valid users collected.');
            await interaction.followUp('Çekilişe katılım olmadı.');
            return;
        }

        const winner = users.random();

        const winnerEmbed = new EmbedBuilder()
            .setTitle('🎉 Çekiliş Sonuçları 🎉')
            .setDescription(`Ödül: **${prize}**\nKazanan: <@${winner.id}>`)
            .setColor(0x00AE86)
            .setTimestamp();

        await interaction.followUp({ embeds: [winnerEmbed] });
    },
};

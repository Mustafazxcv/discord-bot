const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('En aktif kullanıcıları gösterir.')
        .addSubcommand(subcommand =>
            subcommand.setName('voice')
                .setDescription('En aktif sesli kullanıcıları gösterir'))
        .addSubcommand(subcommand =>
            subcommand.setName('chat')
                .setDescription('En aktif mesaj atan kullanıcıları gösterir')),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'voice') {
            // Sesli aktivite sıralaması
            const voiceStates = interaction.guild.voiceStates.cache;
            const userVoiceCounts = {};

            voiceStates.forEach(voiceState => {
                if (voiceState.channel) {
                    const userId = voiceState.id;
                    userVoiceCounts[userId] = (userVoiceCounts[userId] || 0) + 1;
                }
            });

            const sortedUsers = Object.entries(userVoiceCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([userId, count]) => ({ userId, count }));

            const embed = new MessageEmbed()
                .setTitle('En Aktif Sesli Kullanıcılar')
                .setColor('#0099ff')
                .setDescription(sortedUsers.length ? sortedUsers.map((user, index) => `${index + 1}. <@${user.userId}>: ${user.count} kere sesli kanalda`).join('\n') : 'Veri bulunamadı.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else if (interaction.options.getSubcommand() === 'chat') {
            // Mesaj aktivite sıralaması
            try {
                const messages = await fetchMessages(interaction.guild);

                if (!messages || messages.length === 0) {
                    return interaction.reply({ content: 'Mesaj bulunamadı!', ephemeral: true });
                }

                const userMessageCounts = {};
                messages.forEach(message => {
                    const userId = message.author.id;
                    userMessageCounts[userId] = (userMessageCounts[userId] || 0) + 1;
                });

                const sortedUsers = Object.entries(userMessageCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([userId, count]) => ({ userId, count }));

                const embed = new MessageEmbed()
                    .setTitle('En Aktif Mesaj Atan Kullanıcılar')
                    .setColor('#0099ff')
                    .setDescription(sortedUsers.length ? sortedUsers.map((user, index) => `${index + 1}. <@${user.userId}>: ${user.count} mesaj`).join('\n') : 'Veri bulunamadı.')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Mesaj çekme hatası:', error);
                await interaction.reply({ content: 'Mesajları çekerken bir hata oluştu.', ephemeral: true });
            }
        }
    },
};

// Function to fetch messages from all text channels in the guild
async function fetchMessages(guild) {
    const channels = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT');
    let messages = [];
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 gün önceki timestamp

    for (const channel of channels.values()) {
        let lastMessageId;
        try {
            // Son 100 mesajı çek
            const fetchedMessages = await channel.messages.fetch({ limit: 100 });
            
            if (fetchedMessages.size === 0) {
                console.log(`No messages found in channel ${channel.id}`);
                continue; // Eğer mesaj yoksa devam et
            }

            // Son 3 gün içinde olan mesajları filtrele
            const recentMessages = fetchedMessages.filter(msg => msg.createdTimestamp >= threeDaysAgo);
            messages = messages.concat(Array.from(recentMessages.values()));
            console.log(`Fetched ${recentMessages.size} messages from channel ${channel.id}`);
            
        } catch (error) {
            console.error(`Error fetching messages from channel ${channel.id}:`, error);
        }
    }

    console.log(`Total messages fetched: ${messages.length}`);
    return messages;
}

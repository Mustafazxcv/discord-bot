const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Bir kullanıcıyı susturur.')
        .addUserOption(option => option.setName('target').setDescription('Susturulacak kullanıcı').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Susturma süresi (dakika)').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(target.id);
        const duration = interaction.options.getInteger('duration');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            await interaction.reply('Bu komutu kullanma izniniz yok.');
            return;
        }

        // "Muted" rolünü kontrol et
        let mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        
        if (!mutedRole) {
            try {
                mutedRole = await interaction.guild.roles.create({
                    name: 'Muted',
                    color: '#6c6f7b', // Gri renk kodu
                    permissions: [],
                });

                interaction.guild.channels.cache.forEach(async (channel) => {
                    await channel.permissionOverwrites.create(mutedRole, {
                        SendMessages: false,
                        Speak: false,
                    });
                });

            } catch (error) {
                console.error('Muted rolü oluşturulurken bir hata oluştu:', error);
                await interaction.reply('Muted rolü oluşturulurken bir hata oluştu.');
                return;
            }
        }

        try {
            await member.roles.add(mutedRole);
            await interaction.reply(`${target.tag} ${duration} dakika boyunca susturuldu.`);

            // Süre dolduğunda susturmayı kaldırma
            setTimeout(async () => {
                await member.roles.remove(mutedRole);
                await interaction.followUp(`${target.tag} susturma süresi doldu ve susturulma kaldırıldı.`);
            }, duration * 60000); // Dakikayı milisaniyeye çeviriyoruz
        } catch (error) {
            console.error('Susturma işlemi sırasında bir hata oluştu:', error);
            await interaction.reply('Susturma işlemi sırasında bir hata oluştu.');
        }
    },
};

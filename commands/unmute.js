const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Bir kullanıcının susturmasını kaldırır.')
        .addUserOption(option => option.setName('target').setDescription('Susturması kaldırılacak kullanıcı').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) {
            return interaction.reply({ content: 'Kullanıcı sunucuda bulunamadı.', ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted'); // 'Muted' rolünün adını burada belirtin

        if (!muteRole) {
            return interaction.reply({ content: 'Muted rolü bulunamadı.', ephemeral: true });
        }

        if (member.roles.cache.has(muteRole.id)) {
            try {
                await member.roles.remove(muteRole);
                await interaction.reply({ content: `${target.tag} kullanıcısının susturması kaldırıldı.` });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: `${target.tag} kullanıcısı zaten susturulmamış.`, ephemeral: true });
        }
    },
};

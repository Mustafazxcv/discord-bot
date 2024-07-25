const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server.')
        .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            await interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });
            return;
        }

        try {
            await member.kick();
            await interaction.reply({ content: `${user.tag} sunucudan atıldı.`, ephemeral: true });
        } catch (error) {
            console.error('Kick Command Error:', error);
            if (error.code === 50013) {
                await interaction.reply({ content: 'İzinler eksik. Bu kullanıcıyı atmak için gerekli izinlere sahip değilsiniz.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Bir hata oluştu. Kullanıcıyı atarken bir sorun oluştu.', ephemeral: true });
            }
        }
    },
};

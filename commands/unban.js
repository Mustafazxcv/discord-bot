const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Bir kullanıcıyı ban listesinden çıkarır.'),
    async execute(interaction) {
        await interaction.reply({ content: 'Lütfen kullanıcı adını seçin:', components: [await getSelectMenu()] });
    },
};

// Kullanıcıları seçme menüsü oluşturma
async function getSelectMenu() {
    const banList = await interaction.guild.bans.fetch();
    const options = banList.map(ban => ({
        label: `${ban.user.username}#${ban.user.discriminator}`,
        value: ban.user.id,
    }));

    return {
        type: 1,
        components: [
            {
                type: 3, // SELECT_MENU
                customId: 'select_user',
                options: options,
                placeholder: 'Kullanıcıyı seçin...',
            },
        ],
    };
}

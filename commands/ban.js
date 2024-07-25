const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bir kullanıcıyı banlar.')
        .addUserOption(option => option.setName('target').setDescription('Banlanacak kullanıcı').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(target.id);
        await member.ban();
        await interaction.reply(`${target.tag} banlandı.`);
    },
};

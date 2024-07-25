require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error('Error registering application commands:', error);
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        const ticketChannel = client.channels.cache.get(process.env.TICKET_CHANNEL_ID);
        if (ticketChannel) {
            const ticketEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Liberty Destek Sistemi')
                .setDescription('Liberty Destek ekibi sizlere her türlü desteği sunmaktan çekinmez.\n\nHer türlü soru ve sorununuz için destek talebi oluşturabilirsiniz.\n\nTalep oluşturmak için aşağıdaki butona tıklamanız yeterli.')
                .setTimestamp();

            const ticketRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket')
                        .setLabel('Ticket Aç')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎫'),
                );
            ticketChannel.send({ embeds: [ticketEmbed], components: [ticketRow] });
        } else {
            console.error('Ticket channel not found');
        }
    } catch (error) {
        console.error('Ticket Channel Error:', error);
    }

    try {
        const voiceChannel = client.channels.cache.get(process.env.VOICE_CHANNEL_ID);
        if (voiceChannel) {
            const voiceEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Sesli Oda Oluşturma')
                .setDescription('Sesli oda oluşturmak için aşağıdaki butona tıklayabilirsiniz.\n\nOdanızı yönetebilir, dilediğiniz zaman kapatıp açabilirsiniz.')
                .setTimestamp();

            const voiceRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_voice_channel')
                        .setLabel('Oda Oluştur')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔊'),
                );
            voiceChannel.send({ embeds: [voiceEmbed], components: [voiceRow] });
        } else {
            console.error('Voice channel not found');
        }
    } catch (error) {
        console.error('Voice Channel Error:', error);
    }

    try {
        const roleAssignChannel = client.channels.cache.get(process.env.ROLE_ASSIGN_CHANNEL_ID);
        if (roleAssignChannel) {
            const roleEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Rol Alma')
                .setDescription('Rol almak için aşağıdaki butona tıklayabilirsiniz.')
                .setTimestamp();

            const roleRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('assign_role')
                        .setLabel('Rol Al')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🎭'),
                );
            roleAssignChannel.send({ embeds: [roleEmbed], components: [roleRow] });
        } else {
            console.error('Role assign channel not found');
        }
    } catch (error) {
        console.error('Role Assign Channel Error:', error);
    }
});

client.on('guildMemberAdd', async member => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (welcomeChannel) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Hoş Geldin!')
                .setDescription(`${member} sunucumuza katıldı!`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Hoş Geldin', value: 'Liberty ekibi olarak seni burada görmekten mutluluk duyuyoruz!' },
                    { name: 'Kurallar', value: 'Lütfen sunucu kurallarını oku ve keyifli vakit geçir.' }
                )
                .setTimestamp();

            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        } else {
            console.error('Welcome channel not found');
        }
        await member.roles.add(process.env.NEW_ROLE_ID);
    } catch (error) {
        console.error('Guild Member Add Error:', error);
    }
});

client.on('guildMemberRemove', async member => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (welcomeChannel) {
            const goodbyeEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Güle Güle!')
                .setDescription(`${member.user.tag} sunucudan ayrıldı.`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await welcomeChannel.send({ embeds: [goodbyeEmbed] });
        } else {
            console.error('Welcome channel not found');
        }
    } catch (error) {
        console.error('Guild Member Remove Error:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.guild) {
        console.error('Interaction not in guild');
        return;
    }

    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Command execution error:', error);
            await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'create_ticket') {
            try {
                const supportRole = interaction.guild.roles.cache.get(process.env.SUPPORT_TEAM_ROLE_ID);
                if (!supportRole) {
                    console.error('Support role not found');
                    return;
                }
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: 0, // Text channel
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'SendMessages'],
                        },
                        {
                            id: supportRole.id,
                            allow: ['ViewChannel', 'SendMessages'],
                        },
                    ],
                });
                await ticketChannel.send(`Merhaba ${interaction.user}, destek ekibi kısa sürede sizinle ilgilenecektir. ${supportRole}`);
                await interaction.reply({ content: 'Ticket oluşturuldu.', ephemeral: true });

                // Ticket kapatma butonu ekleme
                const closeRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Ticket Kapat')
                            .setStyle(ButtonStyle.Danger)
                    );
                await ticketChannel.send({ content: 'Ticketı kapatmak için aşağıdaki butona tıklayabilirsiniz.', components: [closeRow] });
            } catch (error) {
                console.error('Create Ticket Error:', error);
                await interaction.reply({ content: 'Ticket oluşturulurken bir hata oluştu.', ephemeral: true });
            }
        } else if (interaction.customId === 'create_voice_channel') {
            try {
                const voiceChannel = await interaction.guild.channels.create({
                    name: `oda-${interaction.user.username}`,
                    type: 2, // Voice channel
                    parent: process.env.VOICE_CHANNEL_CATEGORY_ID, // Belirtilen kategori içinde oluştur
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'Speak', 'Connect'],
                        },
                    ],
                });

                // Sesli oda yönetim butonları
                const voiceRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`lock_voice_channel_${voiceChannel.id}`)
                            .setLabel('Odayı Kilitle')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`unlock_voice_channel_${voiceChannel.id}`)
                            .setLabel('Odayı Aç')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`close_voice_channel_${voiceChannel.id}`)
                            .setLabel('Odayı Kapat')
                            .setStyle(ButtonStyle.Danger)
                    );

                // Kullanıcıya özel mesaj gönderme
                await interaction.reply({
                    content: `${interaction.user} tarafından oluşturulan odanın yönetimi:`,
                    components: [voiceRow],
                    ephemeral: true
                });
            } catch (error) {
                console.error('Create Voice Channel Error:', error);
                await interaction.reply({ content: 'Sesli oda oluşturulurken bir hata oluştu.', ephemeral: true });
            }
        } else if (interaction.customId === 'assign_role') {
            try {
                const role = interaction.guild.roles.cache.get(process.env.NEW_ROLE_ID);
                if (!role) {
                    console.error('Role not found');
                    return;
                }
                await interaction.member.roles.add(role);
                await interaction.reply({ content: 'Rol başarıyla alındı.', ephemeral: true });
            } catch (error) {
                console.error('Assign Role Error:', error);
                await interaction.reply({ content: 'Rol alınırken bir hata oluştu.', ephemeral: true });
            }
        } else if (interaction.customId.startsWith('lock_voice_channel_')) {
            try {
                const voiceChannelId = interaction.customId.split('_').pop();
                const voiceChannel = interaction.guild.channels.cache.get(voiceChannelId);
                if (voiceChannel) {
                    await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
                    await interaction.reply({ content: 'Oda kilitlendi.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Oda bulunamadı.', ephemeral: true });
                }
            } catch (error) {
                console.error('Lock Voice Channel Error:', error);
                await interaction.reply({ content: 'Oda kilitlenirken bir hata oluştu.', ephemeral: true });
            }
        } else if (interaction.customId.startsWith('unlock_voice_channel_')) {
            try {
                const voiceChannelId = interaction.customId.split('_').pop();
                const voiceChannel = interaction.guild.channels.cache.get(voiceChannelId);
                if (voiceChannel) {
                    await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: true });
                    await interaction.reply({ content: 'Oda açıldı.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Oda bulunamadı.', ephemeral: true });
                }
            } catch (error) {
                console.error('Unlock Voice Channel Error:', error);
                await interaction.reply({ content: 'Oda açılırken bir hata oluştu.', ephemeral: true });
            }
        } else if (interaction.customId.startsWith('close_voice_channel_')) {
            try {
                const voiceChannelId = interaction.customId.split('_').pop();
                const voiceChannel = interaction.guild.channels.cache.get(voiceChannelId);
                if (voiceChannel) {
                    await voiceChannel.delete();
                    await interaction.reply({ content: 'Oda kapatıldı.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Oda bulunamadı.', ephemeral: true });
                }
            } catch (error) {
                console.error('Close Voice Channel Error:', error);
                await interaction.reply({ content: 'Oda kapatılırken bir hata oluştu.', ephemeral: true });
            }
        } else if (interaction.customId === 'close_ticket') {
            try {
                const ticketChannel = interaction.channel;
                if (ticketChannel) {
                    await ticketChannel.delete();
                    await interaction.user.send('Ticketınız başarıyla kapatıldı. Destek ekibimizle ilgili memnuniyetinizi paylaşmak isterseniz, lütfen buraya yazın.');
                } else {
                    await interaction.reply({ content: 'Ticket bulunamadı.', ephemeral: true });
                }
            } catch (error) {
                console.error('Close Ticket Error:', error);
                await interaction.reply({ content: 'Ticket kapatılırken bir hata oluştu.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.TOKEN);

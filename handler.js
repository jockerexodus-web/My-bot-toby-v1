import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "config.json");

// Charger la config (ou créer une par défaut)
let CONFIG = { 
  owner: "", 
  creator: "224567××", 
  mode: "public",
  antitag: false,  // Nouveau: antitag activé ou non
  groupeOnly: false // Nouveau: groupeOnly activé ou non
};

if (fs.existsSync(configPath)) {
  CONFIG = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} else {
  fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
}

// --- DÉFINITION DE TOUTES LES COMMANDES ---

// 1. COMMAND MENU (CORRIGÉ)
async function menuCommand(message, client, context) {
    const isGroup = message.key.remoteJid.endsWith("@g.us");
    const menuText = `📋 *MENU COMMANDES BOT*\n\n` +
        `┌──「 *GÉNÉRAL* 」\n` +
        `│ 👤 .menu - Affiche ce menu\n` +
        `│ 🏓 .ping - Vérifie la latence\n` +
        `│ ℹ️ .info - Infos sur le bot\n` +
        `│ ⏰ .time - Heure actuelle\n` +
        `└───────────\n\n` +
        
        `┌──「 *UTILITAIRES* 」\n` +
        `│ 🎨 .sticker - Crée un sticker\n` +
        `│ 💭 .quote - Citation aléatoire\n` +
        `│ 🎲 .roll [max] - Lance un dé\n` +
        `│ 🪙 .flip - Pile ou face\n` +
        `│ 😄 .joke - Blague aléatoire\n` +
        `└───────────\n\n` +
        
        (isGroup ? 
        `┌──「 *GROUPE* 」\n` +
        `│ 👋 .welcome - Message de bienvenue\n` +
        `│ 🚫 .antitag - Activer/désactiver antitag\n` +
        `│ 🔒 .groupeonly - Activer/désactiver mode groupe\n` +
        `│ 👑 .promote @user - Promouvoir admin\n` +
        `│ ⬇️ .demote @user - Rétrograder admin\n` +
        `│ 🚪 .kick @user - Retirer membre\n` +
        `│ 👤 .tagall - Mentionne tous les membres\n` +
        `│ 📢 .hidetag - Mention silencieuse\n` +
        `│ 🔗 .link - Lien du groupe\n` +
        `│ 📋 .groupeinfo - Infos du groupe\n` +
        `└───────────\n\n` : '') +
        
        `┌──「 *ADMIN BOT* 」\n` +
        `│ ⚙️ .mode - Change mode (public/private)\n` +
        `│ 👑 .owner - Voir/changer owner\n` +
        `│ 🔄 .antitag on/off - Gérer antitag\n` +
        `│ 🔒 .groupeonly on/off - Mode groupe\n` +
        `└───────────\n\n` +
        
        `⚡ *Mode actuel: ${context.config.mode}*\n` +
        `🛡️ *Antitag: ${context.config.antitag ? 'Activé' : 'Désactivé'}*\n` +
        `👥 *Groupe Only: ${context.config.groupeOnly ? 'Activé' : 'Désactivé'}*`;
    
    await client.sendMessage(message.key.remoteJid, { text: menuText });
}

// 2. COMMAND PING
async function pingCommand(message, client) {
    const start = Date.now();
    await client.sendMessage(message.key.remoteJid, { text: '🏓 Pong!' });
    const end = Date.now();
    await client.sendMessage(message.key.remoteJid, { 
        text: `⏱️ Latence: ${end - start}ms` 
    });
}

// 3. COMMAND INFO
async function infoCommand(message, client, context) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const isGroup = message.key.remoteJid.endsWith("@g.us");
    
    let infoText = `🤖 *BOT WHATSAPP*\n\n` +
        `┌──「 *INFORMATIONS* 」\n` +
        `│ 📌 Version: 1.0.0\n` +
        `│ ⚡ Mode: ${context.config.mode}\n` +
        `│ 🛡️ Antitag: ${context.config.antitag ? '✅' : '❌'}\n` +
        `│ 👥 Groupe Only: ${context.config.groupeOnly ? '✅' : '❌'}\n` +
        `│ 🕐 Uptime: ${hours}h ${minutes}m\n` +
        `│ 📅 Date: ${new Date().toLocaleDateString('fr-FR')}\n` +
        `│ 👑 Owner: ${context.config.owner || 'Non défini'}\n` +
        `│ 👨‍💻 Creator: ${context.config.creator}\n` +
        `└───────────\n`;
    
    if (isGroup) {
        const groupMetadata = await client.groupMetadata(message.key.remoteJid);
        infoText += `\n┌──「 *GROUPE* 」\n` +
            `│ 📛 Nom: ${groupMetadata.subject}\n` +
            `│ 👥 Membres: ${groupMetadata.participants.length}\n` +
            `│ 🆔 ID: ${message.key.remoteJid}\n` +
            `└───────────`;
    }
    
    await client.sendMessage(message.key.remoteJid, { text: infoText });
}

// 4. COMMAND STICKER
async function stickerCommand(message, client) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || message.message?.imageMessage;
        
        if (imageMessage) {
            const media = await client.downloadMediaMessage({
                key: message.key,
                message: imageMessage
            });
            
            await client.sendMessage(message.key.remoteJid, { 
                sticker: media 
            });
        } else {
            await client.sendMessage(message.key.remoteJid, { 
                text: '❌ Veuillez répondre à une image avec .sticker' 
            });
        }
    } catch (error) {
        await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Erreur lors de la création du sticker' 
        });
    }
}

// 5. COMMAND QUOTE
async function quoteCommand(message, client) {
    const quotes = [
        "La vie est un défi à relever, non un problème à résoudre.",
        "Le succès n'est pas final, l'échec n'est pas fatal.",
        "Fais de ta vie un rêve, et d'un rêve une réalité.",
        "Le meilleur moyen de prédire l'avenir est de le créer.",
        "Le bonheur n'est pas quelque chose de tout fait. Il vient de vos propres actions.",
        "Rêve comme si tu devais vivre pour toujours, vis comme si tu devais mourir aujourd'hui."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    await client.sendMessage(message.key.remoteJid, { 
        text: `💭 *Citation du jour*\n\n_"${randomQuote}"_` 
    });
}

// 6. COMMAND TIME
async function timeCommand(message, client) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR');
    const dateStr = now.toLocaleDateString('fr-FR');
    
    await client.sendMessage(message.key.remoteJid, { 
        text: `⏰ *Date et Heure*\n\n📅 ${dateStr}\n🕐 ${timeStr}` 
    });
}

// 7. COMMAND ROLL
async function rollCommand(message, client, context) {
    let max = 6;
    if (context.args[0]) {
        max = parseInt(context.args[0]);
        if (isNaN(max) || max < 1) max = 6;
        if (max > 100) max = 100;
    }
    const dice = Math.floor(Math.random() * max) + 1;
    await client.sendMessage(message.key.remoteJid, { 
        text: `🎲 *${dice}* (1-${max})` 
    });
}

// 8. COMMAND FLIP
async function flipCommand(message, client) {
    const result = Math.random() < 0.5 ? 'PILE' : 'FACE';
    await client.sendMessage(message.key.remoteJid, { 
        text: `🪙 *${result}*` 
    });
}

// 9. COMMAND JOKE
async function jokeCommand(message, client) {
    const jokes = [
        "Quel est le comble pour un électricien ? De ne pas être au courant !",
        "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tombent dans le bateau !",
        "Qu'est-ce qu'une vache qui fait du vélo ? Une vache à vélo !",
        "Que dit une mère à son fils geek ? Table-toi !",
        "Pourquoi les souris détestent-elles l'informatique ? Parce qu'elles sont toujours dans les claviers !"
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    await client.sendMessage(message.key.remoteJid, { 
        text: `😄 *Blague*\n\n${randomJoke}` 
    });
}

// 10. COMMAND MODE (Admin Bot)
async function modeCommand(message, client, context) {
    if (!context.isOwner) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seul l\'owner peut changer le mode' 
        });
    }
    
    const newMode = context.args[0];
    if (!newMode || (newMode !== 'public' && newMode !== 'private')) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: `❌ Mode actuel: ${context.config.mode}\nUtilisation: .mode public/private` 
        });
    }
    
    context.updateConfig({ mode: newMode });
    await client.sendMessage(message.key.remoteJid, { 
        text: `✅ Mode changé en: *${newMode}*` 
    });
}

// 11. COMMAND OWNER (Admin Bot)
async function ownerCommand(message, client, context) {
    if (!context.isOwner) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seul l\'owner peut voir/changer l\'owner' 
        });
    }
    
    if (context.args[0]) {
        const newOwner = context.args[0].replace(/[^0-9]/g, "");
        context.updateConfig({ owner: newOwner });
        await client.sendMessage(message.key.remoteJid, { 
            text: `✅ Owner changé en: ${newOwner}` 
        });
    } else {
        await client.sendMessage(message.key.remoteJid, { 
            text: `👑 Owner actuel: ${context.config.owner || 'Non défini'}` 
        });
    }
}

// 12. COMMAND ANTITAG (Admin Bot)
async function antitagCommand(message, client, context) {
    if (!context.isOwner) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seul l\'owner peut gérer l\'antitag' 
        });
    }
    
    const etat = context.args[0];
    if (!etat || (etat !== 'on' && etat !== 'off')) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: `❌ Antitag actuel: ${context.config.antitag ? 'Activé' : 'Désactivé'}\nUtilisation: .antitag on/off` 
        });
    }
    
    const newEtat = etat === 'on';
    context.updateConfig({ antitag: newEtat });
    await client.sendMessage(message.key.remoteJid, { 
        text: `🛡️ Antitag ${newEtat ? 'activé' : 'désactivé'} !` 
    });
}

// 13. COMMAND GROUPE ONLY (Admin Bot)
async function groupeonlyCommand(message, client, context) {
    if (!context.isOwner) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seul l\'owner peut gérer le mode groupe' 
        });
    }
    
    const etat = context.args[0];
    if (!etat || (etat !== 'on' && etat !== 'off')) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: `❌ Groupe Only: ${context.config.groupeOnly ? 'Activé' : 'Désactivé'}\nUtilisation: .groupeonly on/off` 
        });
    }
    
    const newEtat = etat === 'on';
    context.updateConfig({ groupeOnly: newEtat });
    await client.sendMessage(message.key.remoteJid, { 
        text: `👥 Mode groupe ${newEtat ? 'activé' : 'désactivé'} !` 
    });
}

// 14. COMMAND TAGALL (Groupe)
async function tagallCommand(message, client, context) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    if (!context.isOwner && !context.isAdmin) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seuls les admins peuvent utiliser tagall' 
        });
    }
    
    const groupMetadata = await client.groupMetadata(message.key.remoteJid);
    const participants = groupMetadata.participants;
    const mentions = participants.map(p => p.id);
    
    let text = `📢 *MENTION GÉNÉRALE*\n\n`;
    text += context.args.length ? context.args.join(' ') : 'Message du bot';
    text += `\n\n👥 *Membres:* ${participants.length}`;
    
    await client.sendMessage(message.key.remoteJid, {
        text: text,
        mentions: mentions
    });
}

// 15. COMMAND HIDETAG (Groupe)
async function hidetagCommand(message, client, context) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    if (!context.isOwner && !context.isAdmin) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seuls les admins peuvent utiliser hidetag' 
        });
    }
    
    const groupMetadata = await client.groupMetadata(message.key.remoteJid);
    const participants = groupMetadata.participants;
    const mentions = participants.map(p => p.id);
    
    await client.sendMessage(message.key.remoteJid, {
        text: context.args.length ? context.args.join(' ') : '📢 Mention silencieuse',
        mentions: mentions
    });
}

// 16. COMMAND PROMOTE (Groupe)
async function promoteCommand(message, client, context) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    if (!context.isOwner && !context.isAdmin) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seuls les admins peuvent promouvoir' 
        });
    }
    
    const target = context.target;
    if (!target) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Mentionnez ou répondez à l\'utilisateur' 
        });
    }
    
    await client.groupParticipantsUpdate(
        message.key.remoteJid,
        [target + '@s.whatsapp.net'],
        "promote"
    );
    
    await client.sendMessage(message.key.remoteJid, { 
        text: `✅ @${target} est maintenant admin`, 
        mentions: [target + '@s.whatsapp.net']
    });
}

// 17. COMMAND DEMOTE (Groupe)
async function demoteCommand(message, client, context) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    if (!context.isOwner && !context.isAdmin) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seuls les admins peuvent rétrograder' 
        });
    }
    
    const target = context.target;
    if (!target) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Mentionnez ou répondez à l\'utilisateur' 
        });
    }
    
    await client.groupParticipantsUpdate(
        message.key.remoteJid,
        [target + '@s.whatsapp.net'],
        "demote"
    );
    
    await client.sendMessage(message.key.remoteJid, { 
        text: `⬇️ @${target} n'est plus admin`, 
        mentions: [target + '@s.whatsapp.net']
    });
}

// 18. COMMAND KICK (Groupe)
async function kickCommand(message, client, context) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    if (!context.isOwner && !context.isAdmin) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seuls les admins peuvent retirer des membres' 
        });
    }
    
    const target = context.target;
    if (!target) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Mentionnez ou répondez à l\'utilisateur' 
        });
    }
    
    await client.groupParticipantsUpdate(
        message.key.remoteJid,
        [target + '@s.whatsapp.net'],
        "remove"
    );
}

// 19. COMMAND LINK (Groupe)
async function linkCommand(message, client, context) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    if (!context.isOwner && !context.isAdmin) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seuls les admins peuvent voir le lien' 
        });
    }
    
    const inviteCode = await client.groupInviteCode(message.key.remoteJid);
    const link = `https://chat.whatsapp.com/${inviteCode}`;
    
    await client.sendMessage(message.key.remoteJid, { 
        text: `🔗 *Lien du groupe*\n\n${link}` 
    });
}

// 20. COMMAND GROUPE INFO (Groupe)
async function groupeinfoCommand(message, client) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    const groupMetadata = await client.groupMetadata(message.key.remoteJid);
    const admins = groupMetadata.participants.filter(p => p.admin).length;
    
    let text = `📋 *INFORMATIONS DU GROUPE*\n\n` +
        `┌──「 *DÉTAILS* 」\n` +
        `│ 📛 Nom: ${groupMetadata.subject}\n` +
        `│ 🆔 ID: ${message.key.remoteJid}\n` +
        `│ 👑 Créé par: ${groupMetadata.owner || 'Inconnu'}\n` +
        `│ 📅 Créé le: ${new Date(groupMetadata.creation * 1000).toLocaleDateString('fr-FR')}\n` +
        `│ 👥 Membres: ${groupMetadata.participants.length}\n` +
        `│ 👮 Admins: ${admins}\n` +
        `│ 🔒 Description: ${groupMetadata.desc || 'Aucune'}\n` +
        `└───────────`;
    
    await client.sendMessage(message.key.remoteJid, { text: text });
}

// 21. COMMAND WELCOME (Groupe)
async function welcomeCommand(message, client, context) {
    if (!message.key.remoteJid.endsWith("@g.us")) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Cette commande est réservée aux groupes' 
        });
    }
    
    if (!context.isOwner && !context.isAdmin) {
        return await client.sendMessage(message.key.remoteJid, { 
            text: '❌ Seuls les admins peuvent configurer le welcome' 
        });
    }
    
    await client.sendMessage(message.key.remoteJid, { 
        text: `👋 *Bienvenue dans le groupe !*\n\nLisez la description et amusez-vous bien !` 
    });
}

// 22. COMMAND REACT
async function reactCommand(message, client) {
    try {
        const emojis = ['👍', '❤️', '🔥', '👀', '✅'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        await client.sendMessage(message.key.remoteJid, {
            react: {
                text: randomEmoji,
                key: message.key
            }
        });
    } catch (error) {}
}

// --- MAP DES COMMANDES ---
const commands = new Map();
commands.set('menu', menuCommand);
commands.set('ping', pingCommand);
commands.set('info', infoCommand);
commands.set('sticker', stickerCommand);
commands.set('quote', quoteCommand);
commands.set('time', timeCommand);
commands.set('roll', rollCommand);
commands.set('flip', flipCommand);
commands.set('joke', jokeCommand);
commands.set('mode', modeCommand);
commands.set('owner', ownerCommand);
commands.set('antitag', antitagCommand);
commands.set('groupeonly', groupeonlyCommand);
commands.set('tagall', tagallCommand);
commands.set('hidetag', hidetagCommand);
commands.set('promote', promoteCommand);
commands.set('demote', demoteCommand);
commands.set('kick', kickCommand);
commands.set('link', linkCommand);
commands.set('groupeinfo', groupeinfoCommand);
commands.set('welcome', welcomeCommand);

// --- REACTION OPTIONNELLE ---
const react = reactCommand;

// --- Définir automatiquement l'owner ---
export async function setOwnerOnConnect(client) {
  if (!CONFIG.owner) {
    const me = client.user?.id || client.user?.jid;
    if (me) {
      CONFIG.owner = me.replace(/[^0-9]/g, "");
      fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
      console.log(`✅ Owner défini automatiquement : ${CONFIG.owner}`);
    }
  }
}

// --- Récupérer le numéro d'un message ---
function getSenderNumber(message) {
  let senderJid = "";
  if (message.key.fromMe) {
    senderJid = CONFIG.owner + "@s.whatsapp.net";
  } else if (message.key.participant) {
    senderJid = message.key.participant;
  } else {
    senderJid = message.key.remoteJid;
  }
  return senderJid.replace(/[^0-9]/g, "");
}

// --- Récupérer le user cible ---
function getTargetUser(message, args) {
  try {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (quoted) return message.message.extendedTextMessage.contextInfo.participant.replace(/[^0-9]/g, "");
    if (mentions.length > 0) return mentions[0].replace(/[^0-9]/g, "");
    if (args && args[0]) return args[0].replace(/[^0-9]/g, "");
    return null;
  } catch (e) {
    return null;
  }
}

// --- Vérifier si l'utilisateur est admin ---
async function isAdminUser(message, client, senderJid) {
  try {
    if (!message.key.remoteJid.endsWith("@g.us")) return false;
    const groupMetadata = await client.groupMetadata(message.key.remoteJid);
    const participant = groupMetadata.participants.find(p => p.id === senderJid + '@s.whatsapp.net');
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
  } catch {
    return false;
  }
}

// --- Logs clairs ---
function logMessage(message, type = "IN") {
  try {
    const remoteJid = message.key.remoteJid;
    const isGroup = remoteJid?.endsWith("@g.us");
    const sender = getSenderNumber(message);
    const senderName = message.pushName || "Unknown";
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    
    let logText = `[${type}] `;
    if (isGroup) {
      logText += `👥 GROUPE | ${senderName} (${sender}) → ${text}`;
    } else {
      logText += `💬 DM | ${senderName} (${sender}) → ${text}`;
    }
    console.log(logText);
  } catch (e) {}
}

// --- SYSTÈME ANTITAG ---
async function handleAntitag(message, client, sender) {
  try {
    if (!CONFIG.antitag) return false;
    if (!message.key.remoteJid.endsWith("@g.us")) return false;
    
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length === 0) return false;
    
    const groupMetadata = await client.groupMetadata(message.key.remoteJid);
    const isAdmin = groupMetadata.participants.some(p => 
      p.id === sender + '@s.whatsapp.net' && p.admin
    );
    
    if (!isAdmin && !CONFIG.owner === sender) {
      await client.sendMessage(message.key.remoteJid, {
        text: `🚫 @${sender} a essayé de tag ${mentions.length} personne(s) !\n*Antitag activé*`,
        mentions: [sender + '@s.whatsapp.net']
      });
      return true;
    }
  } catch (e) {}
  return false;
}

// --- VÉRIFICATION MODE GROUPE ONLY ---
async function checkGroupeOnly(message, client, sender) {
  try {
    if (!CONFIG.groupeOnly) return false;
    if (message.key.remoteJid.endsWith("@g.us")) return false;
    if (sender === CONFIG.owner) return false;
    
    await client.sendMessage(message.key.remoteJid, {
      text: `❌ Le bot est en mode *Groupe Only*\nUtilisez les commandes dans un groupe uniquement.`
    });
    return true;
  } catch (e) {
    return false;
  }
}

// --- Handler principal ---
export async function handleCommand(message, client) {
  try {
    logMessage(message, "IN");

    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const prefix = ".";
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const sender = getSenderNumber(message);

    // Vérifier mode groupe only
    if (await checkGroupeOnly(message, client, sender)) return;

    // Vérifier antitag
    if (await handleAntitag(message, client, sender)) return;

    // Détection Owner et Admin
    const isOwner = sender === CONFIG.owner;
    const isCreator = sender === CONFIG.creator;
    const isAdmin = await isAdminUser(message, client, sender);

    // Mode Private : seul l'owner peut exécuter
    if (CONFIG.mode === "private" && !isOwner) return;

    // Exécution de la commande
    if (commands.has(command)) {
      if (react) {
        try { await react(message, client); } catch (err) {}
      }

      const cmd = commands.get(command);
      const target = getTargetUser(message, args);

      await cmd(message, client, {
        sender,
        target,
        args,
        isOwner,
        isCreator,
        isAdmin,
        config: CONFIG,
        updateConfig: (newConfig) => {
          CONFIG = { ...CONFIG, ...newConfig };
          fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
          console.log("⚙️ Config mise à jour :", CONFIG);
        },
      });

      console.log(`[OUT] Commande ${command} exécutée par ${sender}`);
    }
  } catch (e) {
    console.error("❌ Erreur handleCommand:", e);
  }
}

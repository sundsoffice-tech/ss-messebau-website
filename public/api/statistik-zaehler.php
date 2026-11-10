<?php
/**
 * S&S Messebau - Zähler der Statistik: was mehrere Dateien darüber wissen müssen.
 *
 * collect.php führt die Zähldatei data/collect_gesamt.json (Gesamtdeckel je
 * Minute, Zahlen des Tages). Hier steht, was außer collect.php noch jemand
 * braucht: der Ort der Datei, das Lesen, der Zustand für health.php
 * ("checks.statistik") und die Zahlen für analytics-status.php. Geschrieben
 * wird die Zähldatei nur in collect.php.
 *
 * Die Datei wird nur eingebunden; sie hat keine Ausgabe und keine Nebenwirkung.
 */

// Direkt aufgerufen gibt es hier nichts.
if (realpath((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) {
    http_response_code(404);
    exit;
}

// Der Name passt absichtlich in kein Muster von analytics-cleanup.php: Die
// Zahlen des Tages sollen nicht nach einer Stunde Ruhe verschwinden. Die Datei
// trägt keine Adresse und keine Kennung, nur Zahlen, und liegt im gesperrten
// Datenordner (nicht öffentlich).
define('STATISTIK_ZAEHLDATEI', __DIR__ . '/data/collect_gesamt.json');

// "checks.statistik" zeigt "deckel" erst, wenn der Gesamtdeckel in so vielen
// Kalenderminuten am Stück erreicht war, und danach noch so viele Minuten lang.
// 5 Minuten am Stück: Ein einzelner Stoß (neun Abrufe zu 50 Ereignissen, auch
// von vier Adressen verteilt) füllt den Deckel für eine Minute, an einer
// Minutengrenze für zwei. Das soll keinen Alarm auslösen; es kostet das Haus
// bei wenigen Dutzend echten Ereignissen je Tag im Mittel weniger als ein
// Ereignis. Wer den Deckel fünf Minuten hält, muss fünfmal nachlegen: Das ist
// kein Versehen mehr, und ab da fehlt der Statistik ein Stück, das man sieht.
// Echter Verkehr, der fünf Minuten am Deckel liegt, heißt: Der Deckel ist zu
// niedrig; auch das soll das Haus erfahren.
// 30 Minuten halten: Der Wächter des Hauses ruft health.php alle 15 Minuten
// ab; mit 30 Minuten sieht er den Zustand in mindestens einem Abruf, auch wenn
// der Deckel gleich nach der fünften Minute wieder frei war.
define('STATISTIK_DECKEL_MINUTEN', 5);
define('STATISTIK_DECKEL_HALTEN_MINUTEN', 30);

/**
 * Stand der Zähldatei oder null (Datei fehlt, nicht lesbar, kein JSON).
 * Ohne Sperre gelesen wird für health.php: Der Endpunkt ist öffentlich, und
 * seine Abrufe sollen den Zähler von collect.php nicht aufhalten können. Ein
 * Lesen mitten im Schreiben ergibt dann im ungünstigen Fall kein JSON, also null.
 */
function statistikZaehlerLesen(bool $mitSperre = false): ?array {
    $datei = STATISTIK_ZAEHLDATEI;
    if (!is_file($datei)) {
        return null;
    }
    if (!$mitSperre) {
        $stand = json_decode((string)@file_get_contents($datei), true);
        return is_array($stand) ? $stand : null;
    }
    $fp = @fopen($datei, 'r');
    if (!$fp) {
        return null;
    }
    $stand = null;
    if (flock($fp, LOCK_SH)) {
        $stand = json_decode((string)stream_get_contents($fp), true);
        flock($fp, LOCK_UN);
    }
    fclose($fp);
    return is_array($stand) ? $stand : null;
}

/**
 * Könnte collect.php die Zähldatei öffnen? Geprüft wird ohne Schreiben: Die
 * Datei ist eine beschreibbare Datei, oder es gibt sie noch nicht und der
 * Ordner ist beschreibbar. Nicht geprüft sind eine scheiternde Dateisperre und
 * ein scheiterndes Schreiben (volle Platte); das sieht nur collect.php selbst.
 */
function statistikZaehlerNutzbar(): bool {
    $datei = STATISTIK_ZAEHLDATEI;
    clearstatcache(true, $datei);
    if (file_exists($datei)) {
        return is_file($datei) && is_readable($datei) && is_writable($datei);
    }
    return is_dir(dirname($datei)) && is_writable(dirname($datei));
}

/**
 * Lauf "Deckel erreicht" fortschreiben: beginn und zuletzt sind Kalenderminuten
 * (Unixzeit durch 60). Eine Minute zählt, wenn in ihr der Gesamtdeckel erreicht
 * war ($voll). Schließt sie an die letzte volle Minute an (dieselbe oder die
 * davor), läuft der Lauf weiter, sonst beginnt ein neuer. Ohne volle Minute
 * bleibt der letzte Lauf stehen; statistikZustand() wertet ihn nach der Zeit.
 */
function statistikDeckelLauf($alt, int $minute, bool $voll): ?array {
    $beginn = is_array($alt) && is_int($alt['beginn'] ?? null) ? $alt['beginn'] : null;
    $zuletzt = is_array($alt) && is_int($alt['zuletzt'] ?? null) ? $alt['zuletzt'] : null;
    $gueltig = $beginn !== null && $zuletzt !== null && $beginn <= $zuletzt && $zuletzt <= $minute;
    if (!$voll) {
        return $gueltig ? ['beginn' => $beginn, 'zuletzt' => $zuletzt] : null;
    }
    if ($gueltig && $minute - $zuletzt <= 1) {
        return ['beginn' => $beginn, 'zuletzt' => $minute];
    }
    return ['beginn' => $minute, 'zuletzt' => $minute];
}

/**
 * Zustand für "checks.statistik" in health.php:
 *   zaehler  die Zähldatei ist nicht nutzbar; collect.php antwortet dann 503
 *            und speichert nichts
 *   deckel   der Gesamtdeckel war STATISTIK_DECKEL_MINUTEN Minuten am Stück
 *            erreicht, zuletzt vor höchstens STATISTIK_DECKEL_HALTEN_MINUTEN Minuten
 *   ok       sonst
 * Nur der Zustand, keine Zahl: Der Endpunkt ist öffentlich.
 */
function statistikZustand(?int $jetzt = null): string {
    $jetzt = $jetzt ?? time();
    if (!statistikZaehlerNutzbar()) {
        return 'zaehler';
    }
    $stand = statistikZaehlerLesen(false);
    $lauf = is_array($stand) ? ($stand['deckel_lauf'] ?? null) : null;
    if (is_array($lauf) && is_int($lauf['beginn'] ?? null) && is_int($lauf['zuletzt'] ?? null)) {
        $her = intdiv($jetzt, 60) - $lauf['zuletzt'];
        if ($lauf['zuletzt'] - $lauf['beginn'] + 1 >= STATISTIK_DECKEL_MINUTEN
            && $her >= 0 && $her <= STATISTIK_DECKEL_HALTEN_MINUTEN) {
            return 'deckel';
        }
    }
    return 'ok';
}

/**
 * Zahlen des Tages (UTC) für den angemeldeten Admin (analytics-status.php).
 * Trägt die Zähldatei einen anderen Tag (heute noch kein Ereignis), sind die
 * Zahlen von heute null und der Stand der Datei steht als letzter Tag da.
 * Ist die Zähldatei nicht nutzbar, sind die Zahlen unbekannt (null).
 */
function statistikTageszahlen(?int $jetzt = null): array {
    $jetzt = $jetzt ?? time();
    $zahl = function ($wert): int {
        return is_int($wert) && $wert > 0 ? $wert : 0;
    };
    $tag = gmdate('Y-m-d', $jetzt);
    $nutzbar = statistikZaehlerNutzbar();
    $stand = $nutzbar ? statistikZaehlerLesen(true) : null;
    $heute = is_array($stand) && ($stand['tag'] ?? null) === $tag;
    $zahlen = [
        'tag' => $tag,
        'angenommen_tag' => $nutzbar ? ($heute ? $zahl($stand['angenommen_tag'] ?? null) : 0) : null,
        'verworfen_tag' => $nutzbar ? ($heute ? $zahl($stand['verworfen_tag'] ?? null) : 0) : null,
        'spitze_tag' => $nutzbar ? ($heute ? $zahl($stand['spitze_tag'] ?? null) : 0) : null,
        'verworfen_adresse_tag' => $nutzbar ? ($heute ? $zahl($stand['verworfen_adresse_tag'] ?? null) : 0) : null,
        'props_gross_tag' => $nutzbar ? ($heute ? $zahl($stand['props_gross_tag'] ?? null) : 0) : null,
        'deckel' => is_array($stand) && is_int($stand['deckel'] ?? null) ? $stand['deckel'] : null,
        'je_adresse' => is_array($stand) && is_int($stand['je_adresse'] ?? null) ? $stand['je_adresse'] : null,
        'letzter_tag' => null,
        'zustand' => statistikZustand($jetzt),
    ];
    $letzter = null;
    if (is_array($stand) && !$heute && is_string($stand['tag'] ?? null)) {
        $letzter = [
            'tag' => $stand['tag'],
            'angenommen' => $stand['angenommen_tag'] ?? null,
            'verworfen' => $stand['verworfen_tag'] ?? null,
            'spitze' => $stand['spitze_tag'] ?? null,
            'verworfen_adresse' => $stand['verworfen_adresse_tag'] ?? null,
            'props_gross' => $stand['props_gross_tag'] ?? null,
        ];
    } elseif (is_array($stand) && is_array($stand['vortag'] ?? null)) {
        $letzter = $stand['vortag'];
    }
    if (is_array($letzter)) {
        $zahlen['letzter_tag'] = [
            'tag' => is_string($letzter['tag'] ?? null) ? $letzter['tag'] : '',
            'angenommen' => $zahl($letzter['angenommen'] ?? null),
            'verworfen' => $zahl($letzter['verworfen'] ?? null),
            'spitze' => $zahl($letzter['spitze'] ?? null),
            'verworfen_adresse' => $zahl($letzter['verworfen_adresse'] ?? null),
            'props_gross' => $zahl($letzter['props_gross'] ?? null),
        ];
    }
    return $zahlen;
}

/**
 * Schlüssel einer Adresse für den Anteil am Gesamtdeckel (Dateiname der
 * Zähldatei, nie die Adresse selbst). IPv4: die Adresse. IPv6: die ersten
 * 64 Bit, weil ein Anschluss dort ein ganzes Präfix hat und sich sonst mit
 * jeder Anfrage eine neue "Adresse" nähme. Als IPv6 geschriebenes IPv4
 * (::ffff:a.b.c.d) zählt wie die IPv4-Adresse.
 */
function statistikAdressSchluessel(string $adresse): string {
    $roh = @inet_pton($adresse);
    if ($roh !== false && strlen($roh) === 16) {
        if (strncmp($roh, "\0\0\0\0\0\0\0\0\0\0\xff\xff", 12) === 0) {
            $kern = 'v4|' . inet_ntop(substr($roh, 12));
        } else {
            $kern = 'v6|' . bin2hex(substr($roh, 0, 8));
        }
    } elseif ($roh !== false) {
        $kern = 'v4|' . inet_ntop($roh);
    } else {
        $kern = 'x|' . $adresse;
    }
    return md5('anteil|' . $kern);
}

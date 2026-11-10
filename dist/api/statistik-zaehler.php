<?php
/**
 * S&S Messebau - Zähler der Statistik: was mehrere Dateien darüber wissen müssen.
 *
 * collect.php führt die Zähldatei data/collect_gesamt.json (Gesamtdeckel je
 * Minute, Zahlen des Tages, volle Minuten, gemerkter Ausfall einer Zähldatei).
 * Hier steht, was außer collect.php noch jemand
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

// "checks.statistik" zeigt "deckel", sobald der Gesamtdeckel in
// STATISTIK_DECKEL_MINUTEN Kalenderminuten innerhalb der letzten
// STATISTIK_DECKEL_FENSTER_MINUTEN Minuten erreicht war, und von da an bis
// STATISTIK_HALTEN_MINUTEN Minuten nach der letzten vollen Minute. Voll ist
// eine Kalenderminute, wenn ein Abruf von collect.php in ihr den Gesamtdeckel
// erreicht vorfand oder ihn selbst füllte.
// 5 volle Minuten: Ein einzelner Stoß (neun Abrufe zu 50 Ereignissen, auch
// von vier Adressen verteilt) füllt den Deckel für eine Minute, an einer
// Minutengrenze für zwei. Das soll keinen Alarm auslösen; es kostet das Haus
// bei wenigen Dutzend echten Ereignissen je Tag im Mittel weniger als ein
// Ereignis. Weil berührte Kalenderminuten zählen, reichen vier Füllungen im
// Abstand von einer Minute für fünf volle Minuten (rund drei bis vier Minuten
// Dauer). Ab da fehlt der Statistik ein Stück, das man sieht. Echter Verkehr,
// der so oft am Deckel liegt, heißt: Der Deckel ist zu niedrig; auch das soll
// das Haus erfahren.
// Im Fenster von 30 Minuten statt am Stück: Gezählt wird die Summe der vollen
// Minuten. Eine freie Minute dazwischen beginnt die Zählung nicht neu, und
// ohne Alarm bleiben in jedem Fenster höchstens 4 von 30 Minuten voll.
// 30 Minuten halten: Der Wächter des Hauses ruft health.php alle 15 Minuten
// ab; mit 30 Minuten sieht er den Zustand in mindestens einem Abruf, auch wenn
// der Deckel gleich danach wieder frei war. Jede weitere volle Minute in
// dieser Zeit verlängert das Halten; keine verkürzt es.
define('STATISTIK_DECKEL_MINUTEN', 5);
define('STATISTIK_DECKEL_FENSTER_MINUTEN', 30);
define('STATISTIK_HALTEN_MINUTEN', 30);

// "checks.statistik" zeigt "menge", wenn collect.php an diesem Tag (UTC)
// mindestens so viele Ereignisse angenommen hat. Der Zustand meldet Zufluss,
// der unter dem Gesamtdeckel bleibt und deshalb nie "deckel" auslöst; verloren
// geht dabei nichts, aber die Zahlen des Tages verdienen einen Blick.
// Rechnung für 10.000:
//   Gewöhnlicher Verkehr: Die Firmenseite hat wenige Dutzend Ereignisse je
//   Tag. Ein Besuch bringt im Mittel rund 11 Ereignisse (Annahme aus dem
//   Aufbau des Trackers, nicht gemessen); 10.000 sind rund 900 Besuche an
//   einem Tag, etwa das 200-fache von heute. Ein echter Tag über dieser Menge
//   heißt: Der Bedarf ist gewachsen; auch das soll das Haus erfahren.
//   Gegen die Grenzen: Der Anteil je Adresse lässt 172.800 Ereignisse je Tag
//   zu, der Gesamtdeckel 576.000. Bei vollem Anteil einer Adresse ist die
//   Menge nach 83 Minuten erreicht, bei dreien nach 28. Bis zur Meldung sind
//   höchstens 10.000 Zeilen dazugekommen (bei größter Zeilenlänge rund 137 MB).
// Der Zustand gilt bis zum Ende des Tages (UTC) und mindestens
// STATISTIK_HALTEN_MINUTEN Minuten nach dem letzten Abruf über der Menge, damit
// der Wächter ihn auch kurz vor Mitternacht in mindestens einem Abruf sieht.
define('STATISTIK_TAGESMENGE', 10000);

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
 * Könnte collect.php die Zähldatei des Gesamtdeckels öffnen? Geprüft wird ohne
 * Schreiben: Die Datei ist eine beschreibbare Datei, oder es gibt sie noch
 * nicht und der Ordner ist beschreibbar. Eine scheiternde Dateisperre, ein
 * scheiterndes Schreiben (volle Platte) und den Ausfall einer Zähldatei je
 * Adresse sieht nur collect.php selbst; es merkt sie in der Zähldatei
 * (statistikStoerung), soweit die sich noch schreiben lässt.
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
 * Was die Zähldatei über "Deckel erreicht" weiß, bezogen auf die Kalenderminute
 * $minute (Unixzeit durch 60):
 *   voll   die vollen Kalenderminuten der letzten STATISTIK_DECKEL_FENSTER_MINUTEN
 *          Minuten, aufsteigend
 *   alarm  die letzte volle Minute, seit die Schwelle erreicht ist, oder null;
 *          null auch, wenn sie länger als STATISTIK_HALTEN_MINUTEN her ist
 * Minuten aus der Zukunft (Uhr zurückgestellt) zählen nicht. Ein Stand der
 * Fassung davor ("deckel_lauf" mit beginn und zuletzt) wird mitgelesen, damit
 * ein Alarm den Wechsel der Fassung übersteht.
 */
function statistikDeckelStand(?array $stand, int $minute): array {
    $voll = [];
    $alarm = null;
    if (is_array($stand) && (array_key_exists('deckel_voll', $stand) || array_key_exists('deckel_alarm', $stand))) {
        foreach (is_array($stand['deckel_voll'] ?? null) ? $stand['deckel_voll'] : [] as $m) {
            if (is_int($m) && $m <= $minute && $minute - $m < STATISTIK_DECKEL_FENSTER_MINUTEN) {
                $voll[$m] = true;
            }
        }
        if (is_int($stand['deckel_alarm'] ?? null) && $stand['deckel_alarm'] <= $minute) {
            $alarm = $stand['deckel_alarm'];
        }
    } elseif (is_array($stand) && is_array($stand['deckel_lauf'] ?? null)) {
        $beginn = $stand['deckel_lauf']['beginn'] ?? null;
        $zuletzt = $stand['deckel_lauf']['zuletzt'] ?? null;
        if (is_int($beginn) && is_int($zuletzt) && $beginn <= $zuletzt && $zuletzt <= $minute) {
            for ($m = max($beginn, $minute - STATISTIK_DECKEL_FENSTER_MINUTEN + 1); $m <= $zuletzt; $m++) {
                $voll[$m] = true;
            }
            if ($zuletzt - $beginn + 1 >= STATISTIK_DECKEL_MINUTEN) {
                $alarm = $zuletzt;
            }
        }
    }
    if ($alarm !== null && $minute - $alarm > STATISTIK_HALTEN_MINUTEN) {
        $alarm = null;
    }
    ksort($voll);
    return ['voll' => array_keys($voll), 'alarm' => $alarm];
}

/**
 * "Deckel erreicht" für die Kalenderminute $minute fortschreiben; $voll sagt,
 * ob der Gesamtdeckel in ihr erreicht war. Die Schwelle ist erreicht, wenn im
 * Fenster STATISTIK_DECKEL_MINUTEN volle Minuten stehen. Läuft der Alarm schon,
 * verlängert ihn jede weitere volle Minute. Ohne volle Minute bleibt der Stand
 * stehen und läuft nach der Zeit ab (statistikDeckelStand).
 */
function statistikDeckelFortschreiben(?array $stand, int $minute, bool $voll): array {
    $deckel = statistikDeckelStand($stand, $minute);
    if ($voll) {
        if (!in_array($minute, $deckel['voll'], true)) {
            $deckel['voll'][] = $minute;
        }
        if (count($deckel['voll']) >= STATISTIK_DECKEL_MINUTEN || $deckel['alarm'] !== null) {
            $deckel['alarm'] = $minute;
        }
    }
    return $deckel;
}

/**
 * Letzter gemerkter Ausfall einer Zähldatei (collect.php hat 503 geantwortet),
 * wenn er höchstens STATISTIK_HALTEN_MINUTEN Minuten her ist, sonst null.
 * 'zaehler' nennt, welche Zähldatei es war: 'adresse' (Anteil je Adresse) oder
 * 'gesamt' (Gesamtdeckel). Gemerkt wird in der Zähldatei des Gesamtdeckels
 * (collectStoerungMerken in collect.php).
 */
function statistikStoerung(?array $stand, int $minute): ?array {
    $stoerung = is_array($stand) ? ($stand['stoerung'] ?? null) : null;
    if (!is_array($stoerung) || !is_int($stoerung['minute'] ?? null)
        || !in_array($stoerung['zaehler'] ?? null, ['adresse', 'gesamt'], true)) {
        return null;
    }
    $her = $minute - $stoerung['minute'];
    if ($her < 0 || $her > STATISTIK_HALTEN_MINUTEN) {
        return null;
    }
    return ['minute' => $stoerung['minute'], 'zaehler' => $stoerung['zaehler']];
}

/**
 * Ist die Tagesmenge erreicht? Ja, wenn die Zähldatei den heutigen Tag (UTC)
 * trägt und mindestens STATISTIK_TAGESMENGE angenommene Ereignisse zählt, oder
 * wenn der letzte Abruf über der Menge ("menge_zuletzt", Kalenderminute)
 * höchstens STATISTIK_HALTEN_MINUTEN Minuten her ist.
 */
function statistikMengeErreicht(?array $stand, int $jetzt): bool {
    if (!is_array($stand)) {
        return false;
    }
    if (($stand['tag'] ?? null) === gmdate('Y-m-d', $jetzt) && is_int($stand['angenommen_tag'] ?? null)
        && $stand['angenommen_tag'] >= STATISTIK_TAGESMENGE) {
        return true;
    }
    $her = is_int($stand['menge_zuletzt'] ?? null) ? intdiv($jetzt, 60) - $stand['menge_zuletzt'] : -1;
    return $her >= 0 && $her <= STATISTIK_HALTEN_MINUTEN;
}

/**
 * Zustand für "checks.statistik" in health.php, der erste zutreffende gilt:
 *   zaehler  eine Zähldatei ist nicht nutzbar: die des Gesamtdeckels jetzt,
 *            oder collect.php hat in den letzten STATISTIK_HALTEN_MINUTEN
 *            Minuten wegen einer Zähldatei (Gesamtdeckel oder Anteil je
 *            Adresse) mit 503 geantwortet und nichts gespeichert
 *   deckel   der Gesamtdeckel war in STATISTIK_DECKEL_MINUTEN Kalenderminuten
 *            eines Fensters von STATISTIK_DECKEL_FENSTER_MINUTEN Minuten
 *            erreicht, die letzte volle Minute ist höchstens
 *            STATISTIK_HALTEN_MINUTEN Minuten her; in dieser Zeit fehlen der
 *            Statistik Ereignisse
 *   menge    heute sind mindestens STATISTIK_TAGESMENGE Ereignisse angenommen;
 *            es fehlt nichts, aber der Zufluss ist ungewöhnlich hoch
 *   ok       sonst
 * Nur der Zustand, keine Zahl: Der Endpunkt ist öffentlich.
 */
function statistikZustand(?int $jetzt = null): string {
    $jetzt = $jetzt ?? time();
    $minute = intdiv($jetzt, 60);
    if (!statistikZaehlerNutzbar()) {
        return 'zaehler';
    }
    $stand = statistikZaehlerLesen(false);
    if (statistikStoerung($stand, $minute) !== null) {
        return 'zaehler';
    }
    if (statistikDeckelStand($stand, $minute)['alarm'] !== null) {
        return 'deckel';
    }
    if (statistikMengeErreicht($stand, $jetzt)) {
        return 'menge';
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

# Quellenprotokolle der Blogbeiträge

Seit dem 10.11.2026 beruht jeder neue Blogbeitrag auf eigener Recherche vom Tag des Schreibens. Zu jedem Beitrag liegt hier eine Datei `<slug>.md`. Sie zeigt für jede Tatsache im Text (Zahl, Datum, Name, Regel, Preis, Frist), woher sie stammt: Adresse, Abrufzeit und der Satz der Quelle, der die Aussage trägt, wörtlich. Die Sätze wählt ein Programm nach gemeinsamen Zahlen und Wörtern und nach den Zeilenverweisen der Gegenprüfung; ob sie tragen, entscheidet die Gegenprüfung am Rohtext. Mehr als diese Sätze übernimmt das Protokoll nicht; die vollständigen Auszüge und die abgerufenen Dokumente bleiben bei der Redaktion.

Der Test `src/lib/__tests__/blog-quellen.test.ts` hält die Form fest. Ein Beitrag ohne Protokoll, eine Quelle ohne Auszug oder eine Zahl im Text, die in keinem Auszug steht, macht ihn rot. Die sechs Beiträge von vor dem 10.11.2026 stehen dort in einer Ausnahmeliste; sie wird nur kürzer.

## Aufbau einer Protokolldatei

```markdown
# Quellenprotokoll: <slug>

Recherche am TT.MM.JJJJ. Ein Satz, worum es im Beitrag geht.

## Quellen

### Q1 <Herausgeber>: <Titel der Seite>
- Adresse: https://…
- Stand der Seite: TT.MM.JJJJ        (oder: kein Datum auf der Seite)
- Abgerufen: TT.MM.JJJJ HH:MM
- Auszug: „wörtlich und unverändert, eine Zeile je Auszug“
- Auszug: „weitere Stelle derselben Seite“

### Q2 …

## Behauptungen

| Nr | Aussage im Beitrag | Quelle |
|---|---|---|
| B1 | „Satz oder Satzteil, wie er im Beitrag steht“ | Q1 |

## Annahmen und eigene Rechnungen

- Rechenbeispiele mit angenommenen Preisen und jede Zahl, die aus Quellenzahlen errechnet ist, mit Rechenweg.

## Widersprüche und offene Punkte

- Wo zwei Quellen Verschiedenes sagen, welche gilt und warum; was nicht zu finden war und wo gesucht wurde.

## Gegenprüfung

- TT.MM.JJJJ: Wer jede Behauptung gegen die Auszüge gehalten hat, mit Ergebnis (Zahl der geprüften Behauptungen, Zahl der Funde, was daraufhin geändert wurde).
```

## Regeln

1. Nichts aus der Erinnerung. Was man zu wissen glaubt, ist ein Suchbegriff. In den Text kommt nur, was in einer am Recherchetag selbst abgerufenen Quelle steht.
2. Erste Wahl ist die Stelle, die die Tatsache setzt: Veranstalter, Verband, Gesetzestext, Amt. Presse nur, wenn es diese Stelle nicht gibt, und dann als solche benannt.
3. Ein Auszug ist wörtlich und so kurz wie möglich: der Satz oder Halbsatz, der die Aussage trägt, keine Abschrift ganzer Abschnitte, keine Postfachadressen. Ein Suchtreffer oder eine Zusammenfassung ist kein Auszug.
4. Eine Zahl nennt im Text ihr Jahr oder ihren Stand.
5. Jede Quelle des Protokolls steht bei mindestens einer Behauptung der Tabelle. Die Tabelle der Behauptungen zitiert den Beitrag und ist deshalb kein Beleg; der Test zählt nur Auszüge und den Abschnitt „Annahmen und eigene Rechnungen“.
6. Aussagen über das eigene Haus (Projekte, Kunden, Preise) brauchen einen Beleg des Inhabers. Ohne ihn bleibt der Text allgemein oder nennt ein Rechenbeispiel mit angenommenen Preisen.
7. Die Verweise am Ende des Beitrags stehen mit derselben Adresse im Protokoll.

## Was der Test verlangt

- Im Beitrag: die Überschrift `## Quellen` am Ende, darunter nur der Satz zum Abruftag und mindestens drei Verweise als Liste, jede Adresse mit `https://`; kein Bild von fremder Adresse (`imageUrl` leer).
- Im Protokoll: mindestens drei Quellen, jede mit einmaliger Kennung `Q1`, `Q2`, …, Adresse, Stand der Seite, Abrufzeit `TT.MM.JJJJ HH:MM` und mindestens einem Auszug von 40 Zeichen; jeder Auszug in der Form `- Auszug: „…“` mit mindestens 8 Zeichen.
- Jede Adresse, auf die der Beitrag verweist, steht im Protokoll. Eine Adresse mit Klammern wird mit `%28` und `%29` geschrieben.
- Jede Zahl im Beitrag, im Titel, im Anreißer und in den vorab gebauten Absätzen steht in einem Auszug oder unter „Annahmen und eigene Rechnungen“. Zahlwörter gelten nicht als Zahl: Steht in der Quelle „sechs Wochen“, schreibt der Beitrag „sechs Wochen“. Für eine Zahl, die aus Quellenzahlen folgt oder zu einem Namen gehört (eine Norm, ein Format), ist die Zeile unter „Annahmen und eigene Rechnungen“ der Weg.
- Der Abschnitt „Gegenprüfung“ nennt Datum, Zahl der geprüften Aussagen und Ergebnis. Ein Protokoll mit offener Gegenprüfung macht den Test rot.

Die Zahlenprobe ist eine Formprüfung. Sie merkt nicht, wenn zwei belegte Zahlen vertauscht sind; dafür ist die Gegenprüfung da.

## Wo ein Beitrag eingetragen ist

Ein Beitrag steht an fünf Stellen, und der Test prüft jede: `src/lib/demo-blog-posts.ts` (Eintrag), `src/lib/seiten-meta.json` (Titel, Beschreibung, `ogType`), `scripts/seiten-inhalt.json` (Hauptüberschrift, drei Absätze, Zwischenüberschriften), `public/sitemap.xml` (Adresse) und die zwei Blog-Linklisten in `index.html`.

# memomiau – concept.md (Database-Focused)

## Kurzbeschreibung

Memomiau ist eine Flashcard-Webapp. Nutzer können sich registrieren, Decks anlegen, Karten erstellen, Karten lernen und öffentliche Decks der Community durchsuchen. Die App enthält außerdem einen Achievements-Bereich und einen Quiz-Mode. Für das MVP wird ausschließlich ein minimales, sauberes und erweiterbares Datenbankschema benötigt.

## Authentifizierung

Die App nutzt Supabase Auth für: Email + Passwort und Google Login.

Beim Signup werden folgende Profildaten erfasst:

- Vorname
- Nachname
- Username
- E-Mail
- Passwort
- Optional: Profilbild (Upload)
- Alternativ: eines von 8 vorgegebenen Cartoon-Katzen-Profilbildern

Nach dem Signup wird der Nutzer zu Home weitergeleitet.

## Rollen & Sichtbarkeit

- Navbar immer sichtbar
- Community-Decks sind öffentlich sichtbar, aber Karten darin erst nach Login
- Achievements und Quiz Mode sind nur sichtbar, wenn der Nutzer eingeloggt ist

## Kernfunktionen (nur diejenigen, die DB benötigen)

### Decks

- Deck hat: name, description optional, public/private
- Deck gehört einem User
- Deck kann mit KI generiert werden
- Decks können importiert werden (PDF → Flashcards über KI)

### Karten

- Karte gehört zu einem Deck
- Felder: front, back, optional image_url, colorStatus (für Lernlevel: green/yellow/red)
- Karten werden in Study-Mode gelernt
- System zeigt "Got it" | "Repeat" | "Try Again"

### Lernstatus

- Jede Karte hat pro User einen Lernstatus (z. B. green/yellow/red)
- Try Again-Karten sollen häufiger angezeigt werden → einfache Weight-Logik reicht, keine komplexe Spaced Repetition

### Community

- Alle öffentlichen Decks sind sichtbar
- User kann öffentliche Decks zu seinem Home hinzufügen (Copy)

### Achievements

- Anzahl gelernter Karten pro Tag/Woche/Monat
- Anzahl erstellter Flashcards
- Streak (Anzahl Tage hintereinander gelernt)

### Quiz Mode

- Realtime-Spiel: mehrere User spielen gleichzeitig
- Jeder beantwortet Flashcards zu einem Thema
- Gewinner = User mit den meisten richtigen Antworten
- Für MVP reicht:
  - quiz_sessions
  - quiz_participants
  - quiz_questions
  - quiz_answers

## Datenmodell (minimal & notwendig)

### profiles

User-Profil mit Namen, Username, Avatar und generischen Daten.

### decks

Decks mit Name, Owner, visibility, Timestamps.

### cards

Cards mit Textfeldern + Lernstatus pro User.

### card_learning_status

Trennung zwischen Card-Inhalt und User-Lernstatus.

### achievements_daily / weekly / monthly

Für MVP reicht eine einzige Tabelle achievements, die type (daily/weekly/monthly) enthält.

### imported_files (optional, klein)

Speichert hochgeladene PDFs (Referenz auf Storage).

## Tabellen (Liste)

- profiles
- decks
- cards
- card_learning_status
- achievements
- quiz_sessions
- quiz_participants
- quiz_questions
- quiz_answers
- imported_files (optional, minimal)

## Anforderungen an RLS

- Jeder Nutzer darf nur seine eigenen Inhalte sehen/bearbeiten
- Öffentliche Decks sind für jeden lesbar
- Karten aus öffentlichen Decks nur lesbar, wenn user eingeloggt
- Lernstatus ist immer userbezogen
- Quiz-Daten sichtbar nur für Teilnehmer

## Nicht hinzufügen

- Keine zusätzlichen Tabellen
- Keine Spaced-Repetition-Algorithmen
- Keine Chat- oder Nachrichten-Tabellen
- Keine AI-Prompt- oder History-Tabellen
- Keine Rollenmodelle oder Admin-Tabellen
- Keine Versionierung
- Keine Trigger außer updated_at

Dieses Schema ist bewusst minimal gehalten, aber vollständig für die oben beschriebenen MVP-Features.

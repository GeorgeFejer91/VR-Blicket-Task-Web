const strings = {
  en: {
    subtitle: 'A small 3D causal discovery game', ready: 'Ready to begin', soundOn: 'Sound on', soundOff: 'Sound off', restart: 'Restart', begin: 'Begin',
    languageTitle: 'Choose a language', languageDetail: 'The game and narrator will use your choice.',
    introPrompt: 'What is a blicket?', introDetail: 'You cannot tell by looking. Blicketness makes the machine light up and play music. Test the objects to find out.', introFeedback: 'Choose a language, then select Begin.', introListening: 'Listen to the introduction, then press Begin.', introReady: 'Press Begin when you are ready.',
    bucketArriving: 'Bucket arriving', arrivalPrompt: 'Watch the bucket come onto the table.', arrivalDetail: 'Three objects are moving inside it.', arrivalFeedback: 'The objects are rattling together.',
    mixing: 'Mixing objects', mixingPrompt: 'Watch the objects mix inside the bucket.', mixingDetail: 'The bucket shakes before the first object comes out.',
    objectProgress: 'Object {index} of {total}', showPrompt: 'Here is the {object}.', showDetail: 'Watch it come out of the bucket.', showFeedback: 'Getting the object ready.',
    readyPrompt: 'Put the {object} on the blicket detector.', readyDetail: 'Drag the 3D object onto the platform, or click the object and then click the platform.', readyFeedback: 'The {object} is ready to test.',
    heldPrompt: 'Place the object on the detector platform.', heldDetail: 'Release it over the platform, or click the platform to place it.', heldFeedback: 'Object selected.',
    checkingPrompt: 'The detector is checking the object…', checkingDetail: 'Watch the detector platform.', checkingFeedback: 'Checking…',
    activePrompt: 'The machine went!', inactivePrompt: 'The machine stayed off.', activeDetail: 'The {object} made the detector light up.', inactiveDetail: 'The {object} did not make the detector light up.', activeFeedback: 'Detector activated.', inactiveFeedback: 'No activation.',
    next: 'Next object', choices: 'Make your choices', returningDetail: 'The tested object goes onto the table beside the machine.', returningFeedback: 'Putting the object on the table.',
    pointProgress: 'Your choice', pointPrompt: 'Point to the object you think is the blicket.', pointDetail: 'Choose one of the three objects below.', pointFeedback: 'Choose the object you think made the machine go.',
    questionProgress: 'Question {index} of {total}', judgePrompt: 'Is the {object} a blicket?', judgeDetail: 'Look at the object with the ring, then choose an answer below.', judgeFeedback: 'Make your judgment.', blicket: 'Blicket', notBlicket: 'Not a Blicket',
    completeProgress: 'Complete', completePrompt: 'All done.', completeDetail: 'Your session JSON downloads automatically. Check your browser’s downloads.', completeFeedback: 'Thank you for playing.',
    sceneLabel: 'Interactive 3D Blicket detector and objects', quizLabel: 'Answer choices',
  },
  de: {
    subtitle: 'Ein kleines 3D-Spiel zum Entdecken von Ursachen', ready: 'Bereit zum Start', soundOn: 'Ton an', soundOff: 'Ton aus', restart: 'Neustart', begin: 'Start',
    languageTitle: 'Sprache wählen', languageDetail: 'Spiel und Erzähler verwenden deine Auswahl.',
    introPrompt: 'Was ist ein Blicket?', introDetail: 'Ob etwas ein Blicket ist, sieht man nicht. Blicketness lässt die Maschine leuchten und Musik spielen. Teste die Objekte, um es herauszufinden.', introFeedback: 'Wähle eine Sprache und drücke dann Start.', introListening: 'Hör dir die Einführung an und drücke dann Start.', introReady: 'Drücke Start, wenn du bereit bist.',
    bucketArriving: 'Eimer kommt an', arrivalPrompt: 'Schau zu, wie der Eimer auf den Tisch kommt.', arrivalDetail: 'Drei Objekte bewegen sich darin.', arrivalFeedback: 'Die Objekte klappern im Eimer.',
    mixing: 'Objekte werden gemischt', mixingPrompt: 'Schau zu, wie sich die Objekte im Eimer mischen.', mixingDetail: 'Der Eimer schüttelt sich, bevor das erste Objekt herauskommt.',
    objectProgress: 'Objekt {index} von {total}', showPrompt: 'Hier ist der {object}.', showDetail: 'Schau zu, wie es aus dem Eimer kommt.', showFeedback: 'Das Objekt wird vorbereitet.',
    readyPrompt: 'Lege den {object} auf die Blicket-Maschine.', readyDetail: 'Ziehe das 3D-Objekt auf die Plattform oder klicke erst auf das Objekt und dann auf die Plattform.', readyFeedback: 'Der {object} kann jetzt geprüft werden.',
    heldPrompt: 'Lege das Objekt auf die Plattform der Maschine.', heldDetail: 'Lass es über der Plattform los oder klicke auf die Plattform.', heldFeedback: 'Objekt ausgewählt.',
    checkingPrompt: 'Die Maschine untersucht das Objekt …', checkingDetail: 'Beobachte die Plattform.', checkingFeedback: 'Prüfung läuft …',
    activePrompt: 'Die Maschine geht an!', inactivePrompt: 'Die Maschine blieb aus.', activeDetail: 'Der {object} hat die Maschine zum Leuchten gebracht.', inactiveDetail: 'Der {object} hat die Maschine nicht zum Leuchten gebracht.', activeFeedback: 'Maschine aktiviert.', inactiveFeedback: 'Keine Aktivierung.',
    next: 'Nächstes Objekt', choices: 'Auswahl treffen', returningDetail: 'Das geprüfte Objekt kommt auf den Tisch neben der Maschine.', returningFeedback: 'Das Objekt kommt auf den Tisch.',
    pointProgress: 'Deine Auswahl', pointPrompt: 'Zeige, welches Objekt deiner Meinung nach ein Blicket ist.', pointDetail: 'Wähle unten eines der drei Objekte aus.', pointFeedback: 'Wähle das Objekt, das die Maschine angeschaltet hat.',
    questionProgress: 'Frage {index} von {total}', judgePrompt: 'Ist der {object} ein Blicket?', judgeDetail: 'Sieh dir das Objekt mit dem Ring an und wähle unten eine Antwort.', judgeFeedback: 'Triff deine Entscheidung.', blicket: 'Blicket', notBlicket: 'Kein Blicket',
    completeProgress: 'Fertig', completePrompt: 'Geschafft.', completeDetail: 'Die Sitzungs-JSON wird automatisch heruntergeladen. Sieh in den Downloads deines Browsers nach.', completeFeedback: 'Danke fürs Mitspielen.',
    sceneLabel: 'Interaktive 3D-Blicket-Maschine und Objekte', quizLabel: 'Antwortmöglichkeiten',
  },
};

const objectNames = {
  obj_cube: { en: 'cube', de: 'Würfel' },
  obj_column: { en: 'cylinder', de: 'Zylinder' },
  obj_block: { en: 'rectangular block', de: 'Quader' },
};

export function objectName(id, language) { return objectNames[id][language]; }
export function copy(language, key, values = {}) {
  return strings[language][key].replace(/\{(\w+)\}/g, (_, name) => values[name]);
}

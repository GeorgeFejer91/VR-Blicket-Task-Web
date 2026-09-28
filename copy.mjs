const strings = {
  en: {
    subtitle: 'A small 3D causal discovery game', ready: 'Ready to begin', soundOn: 'Sound on', soundOff: 'Sound off', restart: 'Restart', begin: 'Begin',
    languageTitle: 'Choose a language', languageDetail: 'The game will use your choice.',
    introPrompt: 'What is a blicket?', introDetail: 'You cannot tell by looking. Test three new sets of objects to discover what makes the detector go. More than one object can be a blicket.', introFeedback: 'Choose a language, then select Begin.',
    phaseProgress: 'Set {index} of {total}', trialProgress: 'Set {phase}/{phases} · Test {index}/{total}',
    arrivalPrompt: 'Watch the bucket come onto the table.', arrivalDetail: 'Three objects are moving inside it.', arrivalFeedback: 'The objects are rattling together.',
    mixing: 'Mixing objects', mixingPrompt: 'Watch the objects mix inside the bucket.', mixingDetail: 'The bucket shakes before the first object comes out.',
    showPrompt: 'Here is the {object}.', showDetail: 'Watch it move into reach.', showFeedback: 'Getting the object ready.',
    readyPrompt: 'Put the {object} on the blicket detector.', readyDetail: 'Drag it onto the red platform, or click the object and then the platform. Place pair objects one at a time.', readyFeedback: 'The {object} is ready to test.',
    heldPrompt: 'Place the object on the detector platform.', heldDetail: 'Release it over the platform, or click the platform to place it.', heldFeedback: 'Object selected.',
    checkingPrompt: 'The detector is checking…', checkingDetail: 'Watch the objects on the platform.', checkingFeedback: 'Checking…',
    activePrompt: 'The machine went!', inactivePrompt: 'The machine stayed off.', activeDetail: 'This combination made the detector light up.', inactiveDetail: 'This combination did not make the detector light up.', activeFeedback: 'Detector activated.', inactiveFeedback: 'No activation.',
    next: 'Next test', choices: 'Answer questions', returningDetail: 'The tested objects go back onto the table.', returningFeedback: 'Putting the objects back.',
    questionProgress: 'Set {phase} · Question {index}/{total}', judgePrompt: 'Is the {object} a blicket?', judgeDetail: 'Look at the object with the ring, then choose an answer below.', judgeFeedback: 'Make your judgment.', blicket: 'Blicket', notBlicket: 'Not a Blicket',
    completeProgress: 'Complete', completePrompt: 'All done.', completeDetail: 'Your session JSON downloads automatically. Check your browser’s downloads.', completeFeedback: 'Thank you for playing.',
    sceneLabel: 'Interactive 3D Blicket detector and objects', quizLabel: 'Answer choices',
  },
  de: {
    subtitle: 'Ein kleines 3D-Spiel zum Entdecken von Ursachen', ready: 'Bereit zum Start', soundOn: 'Ton an', soundOff: 'Ton aus', restart: 'Neustart', begin: 'Start',
    languageTitle: 'Sprache wählen', languageDetail: 'Das Spiel verwendet deine Auswahl.',
    introPrompt: 'Was ist ein Blicket?', introDetail: 'Ob etwas ein Blicket ist, sieht man nicht. Teste drei neue Objektgruppen und finde heraus, was die Maschine einschaltet. Mehr als ein Objekt kann ein Blicket sein.', introFeedback: 'Wähle eine Sprache und drücke dann Start.',
    phaseProgress: 'Gruppe {index} von {total}', trialProgress: 'Gruppe {phase}/{phases} · Test {index}/{total}',
    arrivalPrompt: 'Schau zu, wie der Eimer auf den Tisch kommt.', arrivalDetail: 'Drei Objekte bewegen sich darin.', arrivalFeedback: 'Die Objekte klappern im Eimer.',
    mixing: 'Objekte werden gemischt', mixingPrompt: 'Schau zu, wie sich die Objekte im Eimer mischen.', mixingDetail: 'Der Eimer schüttelt sich, bevor das erste Objekt herauskommt.',
    showPrompt: 'Hier ist das Objekt: {object}.', showDetail: 'Schau zu, wie es bereitgestellt wird.', showFeedback: 'Das Objekt wird vorbereitet.',
    readyPrompt: 'Lege das Objekt {object} auf die Blicket-Maschine.', readyDetail: 'Ziehe es auf die rote Plattform oder klicke erst auf das Objekt und dann auf die Plattform. Bei Paaren lege beide nacheinander ab.', readyFeedback: 'Das Objekt {object} kann jetzt geprüft werden.',
    heldPrompt: 'Lege das Objekt auf die Plattform der Maschine.', heldDetail: 'Lass es über der Plattform los oder klicke auf die Plattform.', heldFeedback: 'Objekt ausgewählt.',
    checkingPrompt: 'Die Maschine untersucht die Objekte …', checkingDetail: 'Beobachte die Objekte auf der Plattform.', checkingFeedback: 'Prüfung läuft …',
    activePrompt: 'Die Maschine geht an!', inactivePrompt: 'Die Maschine blieb aus.', activeDetail: 'Diese Kombination hat die Maschine zum Leuchten gebracht.', inactiveDetail: 'Diese Kombination hat die Maschine nicht zum Leuchten gebracht.', activeFeedback: 'Maschine aktiviert.', inactiveFeedback: 'Keine Aktivierung.',
    next: 'Nächster Test', choices: 'Fragen beantworten', returningDetail: 'Die getesteten Objekte kommen zurück auf den Tisch.', returningFeedback: 'Die Objekte werden zurückgelegt.',
    questionProgress: 'Gruppe {phase} · Frage {index}/{total}', judgePrompt: 'Ist {object} ein Blicket?', judgeDetail: 'Sieh dir das Objekt mit dem Ring an und wähle unten eine Antwort.', judgeFeedback: 'Triff deine Entscheidung.', blicket: 'Blicket', notBlicket: 'Kein Blicket',
    completeProgress: 'Fertig', completePrompt: 'Geschafft.', completeDetail: 'Die Sitzungs-JSON wird automatisch heruntergeladen. Sieh in den Downloads deines Browsers nach.', completeFeedback: 'Danke fürs Mitspielen.',
    sceneLabel: 'Interaktive 3D-Blicket-Maschine und Objekte', quizLabel: 'Antwortmöglichkeiten',
  },
};

const germanShapes = { cube: 'Würfel', column: 'Zylinder', block: 'Quader', sphere: 'Kugel',
  cone: 'Kegel', wedge: 'Keil', prism: 'Sechseckprisma', pyramid: 'Pyramide', capsule: 'Kapsel' };

export function objectName(spec, language) {
  return language === 'de' ? germanShapes[spec.visible.shape] : spec.label.toLowerCase();
}
export function copy(language, key, values = {}) {
  return strings[language][key].replace(/\{(\w+)\}/g, (_, name) => values[name]);
}

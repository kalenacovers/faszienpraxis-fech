// ════════════════════════════════════════════════════════
//  Fech Puls — Sprachumschaltung + schwebende Kontakt-Leiste
//
//  · Header-Umschalter (in .site-header__actions) und
//    schwebendes Widget unten rechts, beide synchron.
//  · WhatsApp-Button im schwebenden Widget.
//  · Übersetzt wird über den deutschen Originaltext: Steht ein
//    Text (bzw. bei Inline-Markup das innerHTML) im Wörterbuch,
//    wird er ersetzt. Header, Footer und Startseite sind
//    vollständig erfasst; alles andere bleibt Deutsch.
//  · Muss VOR site.js laufen (beide defer, lang.js zuerst
//    einbinden), damit Texte vor der Wort-Animation stehen.
// ════════════════════════════════════════════════════════
(function () {
  'use strict';

  var STORE_KEY = 'fp-lang';
  var DEFAULT = 'de';
  var WA_URL = 'https://wa.me/4974249606099';

  var LANGS = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'it', name: 'Italiano' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  var UI = {
    de: { choose: 'Sprache wählen', wa: 'Per WhatsApp schreiben' },
    en: { choose: 'Choose language', wa: 'Message on WhatsApp' },
    ru: { choose: 'Выбрать язык', wa: 'Написать в WhatsApp' },
    it: { choose: 'Scegli la lingua', wa: 'Scrivi su WhatsApp' },
    es: { choose: 'Elegir idioma', wa: 'Escribir por WhatsApp' },
    fr: { choose: 'Choisir la langue', wa: 'Écrire sur WhatsApp' }
  };

  // ── Wörterbuch: deutscher Originaltext → Übersetzungen ──
  // Reiner Text als Schlüssel; enthält ein Element Inline-Markup
  // (em, strong, br), ist der Schlüssel dessen innerHTML.
  // Fehlt eine Sprache, bleibt der deutsche Text stehen.
  var T = {
    // Header & global
    'Zum Inhalt springen': { en: 'Skip to content', ru: 'Перейти к содержимому', it: 'Vai al contenuto', es: 'Ir al contenido', fr: 'Aller au contenu' },
    'Praxis': { en: 'Practice', ru: 'Кабинет', it: 'Studio', es: 'Consulta', fr: 'Cabinet' },
    'Über mich': { en: 'About me', ru: 'Обо мне', it: 'Chi sono', es: 'Sobre mí', fr: 'À propos' },
    'Online-Kurs': { en: 'Online course', ru: 'Онлайн-курс', it: 'Corso online', es: 'Curso online', fr: 'Cours en ligne' },
    'Neu': { en: 'New', ru: 'Новое', it: 'Nuovo', es: 'Nuevo', fr: 'Nouveau' },
    'Gutschein': { en: 'Gift voucher', ru: 'Сертификат', it: 'Buono regalo', es: 'Vale regalo', fr: 'Bon cadeau' },
    '4,7 · 196+ Google-Bewertungen': { en: '4.7 · 196+ Google reviews', ru: '4,7 · 196+ отзывов в Google', it: '4,7 · oltre 196 recensioni Google', es: '4,7 · más de 196 reseñas en Google', fr: '4,7 · plus de 196 avis Google' },
    'Termin buchen': { en: 'Book now', ru: 'Записаться', it: 'Prenota', es: 'Reservar', fr: 'Réserver' },
    'Menü': { en: 'Menu', ru: 'Меню', it: 'Menu', es: 'Menú', fr: 'Menu' },
    'Zu': { en: 'Close', ru: '✕', it: 'Chiudi', es: 'Cerrar', fr: 'Fermer' },
    'Mehr über mich': { en: 'More about me', ru: 'Подробнее обо мне', it: 'Scopri di più su di me', es: 'Más sobre mí', fr: 'En savoir plus sur moi' },

    // Footer
    'Bereit für echte Veränderung?': { en: 'Ready for real change?', ru: 'Готовы к настоящим переменам?', it: 'Pronto per un vero cambiamento?', es: '¿Listo para un cambio real?', fr: 'Prêt pour un vrai changement ?' },
    'Ich arbeite dort, wo viele Ansätze nicht mehr weiterkommen.': { en: 'I work where many approaches reach their limits.', ru: 'Я работаю там, где многие методы уже не помогают.', it: 'Lavoro là dove molti approcci non arrivano più.', es: 'Trabajo donde muchos enfoques ya no llegan.', fr: 'Je travaille là où de nombreuses approches atteignent leurs limites.' },
    '4,7 ★ aus 196+ Google-Bewertungen · Termine online in wenigen Klicks.': { en: '4.7 ★ from 196+ Google reviews · Book online in just a few clicks.', ru: '4,7 ★ по 196+ отзывам в Google · Запись онлайн в пару кликов.', it: '4,7 ★ su oltre 196 recensioni Google · Prenota online in pochi clic.', es: '4,7 ★ en más de 196 reseñas de Google · Reserva online en pocos clics.', fr: '4,7 ★ sur plus de 196 avis Google · Réservation en ligne en quelques clics.' },
    'Termin <em class="serif-em">buchen</em>': { en: 'Book <em class="serif-em">now</em>', ru: 'Запись <em class="serif-em">онлайн</em>', it: 'Prenota <em class="serif-em">ora</em>', es: 'Reserva <em class="serif-em">ya</em>', fr: 'Réservez <em class="serif-em">ici</em>' },
    'Öffnungszeiten': { en: 'Opening hours', ru: 'Часы работы', it: 'Orari', es: 'Horario', fr: 'Horaires' },
    'Mo & Di': { en: 'Mon & Tue', ru: 'Пн и Вт', it: 'Lun e Mar', es: 'Lun y Mar', fr: 'Lun & Mar' },
    'Mi': { en: 'Wed', ru: 'Ср', it: 'Mer', es: 'Mié', fr: 'Mer' },
    'Do': { en: 'Thu', ru: 'Чт', it: 'Gio', es: 'Jue', fr: 'Jeu' },
    'Fr': { en: 'Fri', ru: 'Пт', it: 'Ven', es: 'Vie', fr: 'Ven' },
    '8–11 · 15–18 Uhr': { en: '8–11 am · 3–6 pm', ru: '8–11 · 15–18', it: '8–11 · 15–18', es: '8–11 · 15–18 h', fr: '8h–11h · 15h–18h' },
    '9–13 Uhr': { en: '9 am–1 pm', ru: '9–13', it: '9–13', es: '9–13 h', fr: '9h–13h' },
    '15–19 Uhr': { en: '3–7 pm', ru: '15–19', it: '15–19', es: '15–19 h', fr: '15h–19h' },
    'Kontakt': { en: 'Contact', ru: 'Контакт', it: 'Contatti', es: 'Contacto', fr: 'Contact' },
    'Anrufen': { en: 'Call', ru: 'Позвонить', it: 'Chiama', es: 'Llamar', fr: 'Appeler' },
    'E-Mail': { en: 'Email', ru: 'E-mail', it: 'E-mail', es: 'Correo', fr: 'E-mail' },
    'Bitte ein Handtuch mitbringen · Girocard oder bar': { en: 'Please bring a towel · Girocard or cash', ru: 'Пожалуйста, возьмите полотенце · Оплата картой Girocard или наличными', it: 'Porta un asciugamano · Girocard o contanti', es: 'Trae una toalla · Girocard o efectivo', fr: 'Merci d’apporter une serviette · Girocard ou espèces' },
    'Route planen': { en: 'Get directions', ru: 'Построить маршрут', it: 'Indicazioni stradali', es: 'Cómo llegar', fr: 'Itinéraire' },
    'Für wen geeignet?': { en: 'Who is it for?', ru: 'Кому подходит?', it: 'Per chi è adatto?', es: '¿Para quién es?', fr: 'Pour qui ?' },
    'Zertifikate': { en: 'Certificates', ru: 'Сертификаты', it: 'Certificati', es: 'Certificados', fr: 'Certificats' },
    'Impressum': { en: 'Legal notice', ru: 'Выходные данные', it: 'Note legali', es: 'Aviso legal', fr: 'Mentions légales' },
    'Datenschutz': { en: 'Privacy', ru: 'Конфиденциальность', it: 'Privacy', es: 'Privacidad', fr: 'Confidentialité' },

    // Startseite — Hero & Intro
    'Google-Bewertung': { en: 'Google rating', ru: 'Оценка в Google', it: 'Valutazione Google', es: 'Valoración en Google', fr: 'Note Google' },
    '4,7': { en: '4.7' },
    '196+<br>Stimmen': { en: '196+<br>reviews', ru: '196+<br>отзывов', it: '196+<br>recensioni', es: '196+<br>reseñas', fr: '196+<br>avis' },
    'Faszien & Triggerpunktarbeit': { en: 'Fascia & trigger point work', ru: 'Работа с фасциями и триггерными точками', it: 'Lavoro su fasce e trigger point', es: 'Trabajo de fascia y puntos gatillo', fr: 'Travail des fascias et points gâchettes' },
    'Praxis für <em>Faszien</em>, Tiefengewebe &amp; Triggerpunkte in Spaichingen': {
      en: 'Practice for <em>fascia</em>, deep tissue &amp; trigger points in Spaichingen',
      ru: 'Кабинет работы с <em>фасциями</em>, глубокими тканями и триггерными точками в Шпайхингене',
      it: 'Studio per <em>fasce</em>, tessuti profondi e trigger point a Spaichingen',
      es: 'Consulta de <em>fascia</em>, tejido profundo y puntos gatillo en Spaichingen',
      fr: 'Cabinet pour les <em>fascias</em>, les tissus profonds et les points gâchettes à Spaichingen'
    },
    'Professionelle manuelle Körperarbeit mit Schwerpunkt auf Muskulatur, Faszien und Beweglichkeit.': { en: 'Professional manual bodywork focused on muscles, fascia and mobility.', ru: 'Профессиональная мануальная работа с телом с упором на мышцы, фасции и подвижность.', it: 'Lavoro corporeo manuale professionale con focus su muscolatura, fasce e mobilità.', es: 'Trabajo corporal manual profesional centrado en la musculatura, la fascia y la movilidad.', fr: 'Travail corporel manuel professionnel axé sur les muscles, les fascias et la mobilité.' },
    'Für Menschen mit muskulären Verhärtungen, Druckgefühl und eingeschränkter Beweglichkeit.': { en: 'For people with muscular tightness, a feeling of pressure and restricted mobility.', ru: 'Для людей с мышечными уплотнениями, ощущением давления и ограниченной подвижностью.', it: 'Per persone con indurimenti muscolari, sensazione di pressione e mobilità ridotta.', es: 'Para personas con contracturas musculares, sensación de presión y movilidad reducida.', fr: 'Pour les personnes souffrant de tensions musculaires, d’une sensation de pression et d’une mobilité réduite.' },
    'Leistungen ansehen': { en: 'View services', ru: 'Посмотреть услуги', it: 'Vedi i trattamenti', es: 'Ver servicios', fr: 'Voir les prestations' },
    'Zertifiziert': { en: 'Certified', ru: 'Сертифицирован', it: 'Certificato', es: 'Certificado', fr: 'Certifié' },
    'Faszientherapeut & Sporttherapeut': { en: 'Fascia therapist & sports therapist', ru: 'Фасциальный и спортивный терапевт', it: 'Terapista fasciale e sportivo', es: 'Terapeuta de fascia y deportivo', fr: 'Thérapeute des fascias & du sport' },
    'Anfahrt': { en: 'Getting here', ru: 'Как добраться', it: 'Come arrivare', es: 'Cómo llegar', fr: 'Accès' },

    // Behandlungsbereiche
    'Behandlungsbereiche': { en: 'Treatment areas', ru: 'Зоны воздействия', it: 'Aree di trattamento', es: 'Áreas de tratamiento', fr: 'Zones de traitement' },
    'Womit ich <em>helfen</em> kann.': { en: 'How I can <em>help</em>.', ru: 'Чем я могу <em>помочь</em>.', it: 'Come posso <em>aiutarti</em>.', es: 'En qué puedo <em>ayudarte</em>.', fr: 'Comment je peux vous <em>aider</em>.' },
    'Erkennst du dich in einem der Bereiche wieder, ist eine Behandlung für dich geeignet.': { en: 'If you recognise yourself in one of these areas, a treatment is right for you.', ru: 'Если вы узнаёте себя в одной из этих областей, процедура вам подойдёт.', it: 'Se ti riconosci in una di queste aree, il trattamento fa per te.', es: 'Si te reconoces en alguna de estas áreas, el tratamiento es adecuado para ti.', fr: 'Si vous vous reconnaissez dans l’un de ces domaines, un soin vous convient.' },
    'Rücken & Nacken': { en: 'Back & neck', ru: 'Спина и шея', it: 'Schiena e collo', es: 'Espalda y cuello', fr: 'Dos & nuque' },
    'Muskuläre Verhärtungen im Rücken, Nackenverspannungen, Zug im Kopfbereich': { en: 'Muscular tightness in the back, neck tension, pulling in the head area', ru: 'Мышечные уплотнения в спине, напряжение в шее, тянущее ощущение в области головы', it: 'Indurimenti muscolari alla schiena, tensioni al collo, tensione nella zona della testa', es: 'Contracturas en la espalda, tensión cervical, tirantez en la zona de la cabeza', fr: 'Tensions musculaires dans le dos, nuque raide, tiraillements au niveau de la tête' },
    'Schulter & Arm': { en: 'Shoulder & arm', ru: 'Плечо и рука', it: 'Spalla e braccio', es: 'Hombro y brazo', fr: 'Épaule & bras' },
    'Eingeschränkte Schulterbeweglichkeit, Taubheit in Armen oder Händen': { en: 'Restricted shoulder mobility, numbness in arms or hands', ru: 'Ограниченная подвижность плеча, онемение рук или кистей', it: 'Mobilità limitata della spalla, intorpidimento di braccia o mani', es: 'Movilidad limitada del hombro, entumecimiento en brazos o manos', fr: 'Mobilité réduite de l’épaule, engourdissement des bras ou des mains' },
    'Beine & Füße': { en: 'Legs & feet', ru: 'Ноги и стопы', it: 'Gambe e piedi', es: 'Piernas y pies', fr: 'Jambes & pieds' },
    'Verhärtete Waden und Oberschenkel, Druckgefühl in den Fußsohlen, eingeschränkte Beweglichkeit im Gesäß': { en: 'Tight calves and thighs, pressure in the soles of the feet, restricted mobility in the glutes', ru: 'Уплотнённые икры и бёдра, давление в стопах, ограниченная подвижность в ягодичной области', it: 'Polpacci e cosce induriti, pressione sotto la pianta dei piedi, mobilità ridotta nei glutei', es: 'Gemelos y muslos endurecidos, presión en las plantas de los pies, movilidad reducida en los glúteos', fr: 'Mollets et cuisses durcis, pression sous la plante des pieds, mobilité réduite au niveau des fessiers' },
    'Triggerpunkte': { en: 'Trigger points', ru: 'Триггерные точки', it: 'Trigger point', es: 'Puntos gatillo', fr: 'Points gâchettes' },
    'Muskuläre Verhärtungen und druckempfindliche Triggerpunkte': { en: 'Muscular tightness and pressure-sensitive trigger points', ru: 'Мышечные уплотнения и чувствительные к давлению триггерные точки', it: 'Indurimenti muscolari e trigger point sensibili alla pressione', es: 'Contracturas musculares y puntos gatillo sensibles a la presión', fr: 'Tensions musculaires et points gâchettes sensibles à la pression' },
    'Kiefer & Kopf': { en: 'Jaw & head', ru: 'Челюсть и голова', it: 'Mascella e testa', es: 'Mandíbula y cabeza', fr: 'Mâchoire & tête' },
    'Kieferverspannungen, Druck im Kopf, Schwindel durch Muskelverspannung': { en: 'Jaw tension, pressure in the head, dizziness caused by muscle tension', ru: 'Напряжение в челюсти, давление в голове, головокружение из-за мышечного напряжения', it: 'Tensioni alla mascella, pressione alla testa, vertigini da tensione muscolare', es: 'Tensión mandibular, presión en la cabeza, mareos por tensión muscular', fr: 'Tensions de la mâchoire, pression dans la tête, vertiges dus aux tensions musculaires' },
    'Körperspannung & Stress': { en: 'Body tension & stress', ru: 'Телесное напряжение и стресс', it: 'Tensione corporea e stress', es: 'Tensión corporal y estrés', fr: 'Tension corporelle & stress' },
    'Dauerhaft angespannt, eingeschränkte Beweglichkeit und innerer Druck': { en: 'Constantly tense, restricted mobility and inner pressure', ru: 'Постоянное напряжение, ограниченная подвижность и внутреннее давление', it: 'Costantemente in tensione, mobilità ridotta e pressione interiore', es: 'Tensión constante, movilidad reducida y presión interna', fr: 'Tension permanente, mobilité réduite et pression intérieure' },

    // Ablauf
    'Wie ich arbeite': { en: 'How I work', ru: 'Как я работаю', it: 'Come lavoro', es: 'Cómo trabajo', fr: 'Ma façon de travailler' },
    '3 Schritte': { en: '3 steps', ru: '3 шага', it: '3 passi', es: '3 pasos', fr: '3 étapes' },
    'Gezielte Arbeit, <em>keine Kompromisse.</em>': { en: 'Targeted work, <em>no compromises.</em>', ru: 'Точная работа, <em>без компромиссов.</em>', it: 'Lavoro mirato, <em>nessun compromesso.</em>', es: 'Trabajo preciso, <em>sin concesiones.</em>', fr: 'Un travail ciblé, <em>sans compromis.</em>' },
    'Ursache finden': { en: 'Find the cause', ru: 'Найти причину', it: 'Trovare la causa', es: 'Encontrar la causa', fr: 'Trouver la cause' },
    'Ich taste gezielt nach Verspannungen, Verhärtungen und Triggerpunkten im Gewebe.': { en: 'I carefully feel for tension, tight spots and trigger points in the tissue.', ru: 'Я целенаправленно прощупываю напряжения, уплотнения и триггерные точки в тканях.', it: 'Cerco con precisione tensioni, indurimenti e trigger point nel tessuto.', es: 'Palpo de forma precisa tensiones, contracturas y puntos gatillo en el tejido.', fr: 'Je palpe de façon ciblée les tensions, les durcissements et les points gâchettes dans les tissus.' },
    'Tief behandeln': { en: 'Treat deeply', ru: 'Глубокая проработка', it: 'Trattare in profondità', es: 'Tratar en profundidad', fr: 'Traiter en profondeur' },
    'Präzise manuelle Techniken an tiefsitzenden Gewebeverdichtungen. Das kann intensiv sein – genau das unterscheidet es von klassischer Massage.': { en: 'Precise manual techniques on deep-seated tissue adhesions. It can be intense – and that is exactly what sets it apart from a classic massage.', ru: 'Точные мануальные техники для глубоко расположенных уплотнений тканей. Это может быть интенсивно – именно этим метод отличается от классического массажа.', it: 'Tecniche manuali precise sugli addensamenti profondi del tessuto. Può essere intenso – ed è proprio questo che lo distingue dal massaggio classico.', es: 'Técnicas manuales precisas sobre adherencias profundas del tejido. Puede ser intenso – y eso es justo lo que lo diferencia de un masaje clásico.', fr: 'Des techniques manuelles précises sur les densifications profondes des tissus. Cela peut être intense – c’est justement ce qui le distingue d’un massage classique.' },
    'Nachhaltig freier': { en: 'Lastingly freer', ru: 'Надолго свободнее', it: 'Più liberi, a lungo', es: 'Más libre a largo plazo', fr: 'Durablement plus libre' },
    'Nach einer kurzen Reaktionsphase (oft 1–2 Tage Muskelkater) berichten die meisten von weniger Spannung und besserer Beweglichkeit.': { en: 'After a short reaction phase (often 1–2 days of muscle soreness), most people report less tension and better mobility.', ru: 'После короткой фазы реакции (часто 1–2 дня мышечной боли) большинство отмечают меньшее напряжение и лучшую подвижность.', it: 'Dopo una breve fase di reazione (spesso 1–2 giorni di indolenzimento) la maggior parte riferisce meno tensione e una mobilità migliore.', es: 'Tras una breve fase de reacción (a menudo 1–2 días de agujetas), la mayoría nota menos tensión y mejor movilidad.', fr: 'Après une courte phase de réaction (souvent 1 à 2 jours de courbatures), la plupart constatent moins de tensions et une meilleure mobilité.' },

    // Über mich (Teaser)
    'Faszien- & Sporttherapeut': { en: 'Fascia & sports therapist', ru: 'Фасциальный и спортивный терапевт', it: 'Terapista fasciale e sportivo', es: 'Terapeuta de fascia y deportivo', fr: 'Thérapeute des fascias & du sport' },
    '„Mein Anspruch: dort arbeiten, wo viele Ansätze nicht weiterkommen. Präzise, ehrlich, mit Zeit für deinen Körper.“': { en: '“My aim: to work where many approaches get stuck. Precise, honest, with time for your body.”', ru: '«Мой принцип: работать там, где многие методы бессильны. Точно, честно, с вниманием к вашему телу.»', it: '«Il mio obiettivo: lavorare là dove molti approcci si fermano. Con precisione, onestà e tempo per il tuo corpo.»', es: '«Mi objetivo: trabajar donde muchos enfoques se quedan cortos. Con precisión, honestidad y tiempo para tu cuerpo.»', fr: '« Mon ambition : travailler là où beaucoup d’approches échouent. Avec précision, honnêteté et du temps pour votre corps. »' },
    'Faszientherapeut': { en: 'Fascia therapist', ru: 'Фасциальный терапевт', it: 'Terapista fasciale', es: 'Terapeuta de fascia', fr: 'Thérapeute des fascias' },
    'Sporttherapeut': { en: 'Sports therapist', ru: 'Спортивный терапевт', it: 'Terapista sportivo', es: 'Terapeuta deportivo', fr: 'Thérapeute du sport' },
    'Triggerpunkttherapeut': { en: 'Trigger point therapist', ru: 'Терапевт по триггерным точкам', it: 'Terapista trigger point', es: 'Terapeuta de puntos gatillo', fr: 'Thérapeute des points gâchettes' },
    'Gesundheitspraktiker': { en: 'Health practitioner', ru: 'Специалист по оздоровлению', it: 'Operatore della salute', es: 'Profesional de la salud', fr: 'Praticien de santé' },
    'Selbstständig, mit Schwerpunkt auf manueller Tiefengewebearbeit von Kopf bis Fuß.': { en: 'Self-employed, specialising in manual deep-tissue work from head to toe.', ru: 'Частная практика с упором на мануальную работу с глубокими тканями – с головы до ног.', it: 'Libero professionista, specializzato nel lavoro manuale sui tessuti profondi dalla testa ai piedi.', es: 'Autónomo, especializado en trabajo manual de tejido profundo de pies a cabeza.', fr: 'Indépendant, spécialisé dans le travail manuel des tissus profonds de la tête aux pieds.' },

    // Preise
    'Preise & Leistungen': { en: 'Prices & services', ru: 'Цены и услуги', it: 'Prezzi e trattamenti', es: 'Precios y servicios', fr: 'Tarifs & prestations' },
    'Behandlungen.': { en: 'Treatments.', ru: 'Процедуры.', it: 'Trattamenti.', es: 'Tratamientos.', fr: 'Soins.' },
    'Alle Preise inklusive Nachbetreuung und Tipps für zuhause.': { en: 'All prices include aftercare and tips for at home.', ru: 'Все цены включают последующее сопровождение и советы для дома.', it: 'Tutti i prezzi includono assistenza post-trattamento e consigli per casa.', es: 'Todos los precios incluyen seguimiento y consejos para casa.', fr: 'Tous les tarifs incluent le suivi et des conseils pour la maison.' },
    '30 Min. · Fokusbereich': { en: '30 min · focus area', ru: '30 мин · одна зона', it: '30 min · zona specifica', es: '30 min · zona específica', fr: '30 min · zone ciblée' },
    'Schulter · Nacken · Rücken': { en: 'Shoulder · neck · back', ru: 'Плечи · шея · спина', it: 'Spalle · collo · schiena', es: 'Hombro · cuello · espalda', fr: 'Épaules · nuque · dos' },
    'Gezielte Triggerpunktarbeit': { en: 'Targeted trigger point work', ru: 'Точечная работа с триггерными точками', it: 'Lavoro mirato sui trigger point', es: 'Trabajo dirigido de puntos gatillo', fr: 'Travail ciblé des points gâchettes' },
    'Arbeit an Verhärtungen im Fokusbereich': { en: 'Work on tight spots in the focus area', ru: 'Работа с уплотнениями в выбранной зоне', it: 'Lavoro sugli indurimenti nella zona specifica', es: 'Trabajo de contracturas en la zona elegida', fr: 'Travail des durcissements dans la zone ciblée' },
    'Mehr Beweglichkeit': { en: 'More mobility', ru: 'Больше подвижности', it: 'Più mobilità', es: 'Más movilidad', fr: 'Plus de mobilité' },
    '30–45 Min. · je nach Körperbau': { en: '30–45 min · depending on build', ru: '30–45 мин · в зависимости от телосложения', it: '30–45 min · in base alla corporatura', es: '30–45 min · según la complexión', fr: '30–45 min · selon la morphologie' },
    'Beliebteste Wahl': { en: 'Most popular', ru: 'Самый популярный', it: 'La più scelta', es: 'La más elegida', fr: 'Le plus demandé' },
    'Ganzkörper­behandlung': { en: 'Full-body treatment', ru: 'Процедура на всё тело', it: 'Trattamento total body', es: 'Tratamiento de cuerpo entero', fr: 'Soin du corps entier' },
    'Vollständige Tiefengewebsarbeit': { en: 'Complete deep-tissue work', ru: 'Полная работа с глубокими тканями', it: 'Lavoro completo sui tessuti profondi', es: 'Trabajo completo de tejido profundo', fr: 'Travail complet des tissus profonds' },
    'Triggerpunkte am ganzen Körper': { en: 'Trigger points all over the body', ru: 'Триггерные точки по всему телу', it: 'Trigger point su tutto il corpo', es: 'Puntos gatillo en todo el cuerpo', fr: 'Points gâchettes sur tout le corps' },
    'Muskelverhärtungen, Faszien, Nerveneinklemmungen': { en: 'Muscle tightness, fascia, trapped nerves', ru: 'Мышечные уплотнения, фасции, защемления нервов', it: 'Indurimenti muscolari, fasce, nervi compressi', es: 'Contracturas, fascia, nervios pinzados', fr: 'Tensions musculaires, fascias, nerfs coincés' },
    'Nachbetreuung & Heimübungen': { en: 'Aftercare & home exercises', ru: 'Сопровождение и упражнения для дома', it: 'Assistenza ed esercizi a casa', es: 'Seguimiento y ejercicios en casa', fr: 'Suivi & exercices à la maison' },
    '30 Min. · Beine': { en: '30 min · legs', ru: '30 мин · ноги', it: '30 min · gambe', es: '30 min · piernas', fr: '30 min · jambes' },
    'Beinlösung': { en: 'Leg release', ru: 'Расслабление ног', it: 'Trattamento gambe', es: 'Liberación de piernas', fr: 'Libération des jambes' },
    'Waden & Oberschenkel': { en: 'Calves & thighs', ru: 'Икры и бёдра', it: 'Polpacci e cosce', es: 'Gemelos y muslos', fr: 'Mollets & cuisses' },
    'Druckgefühl in den Fußsohlen': { en: 'Pressure in the soles of the feet', ru: 'Давление в стопах', it: 'Pressione sotto la pianta dei piedi', es: 'Presión en las plantas de los pies', fr: 'Pression sous la plante des pieds' },
    'Gesäß & Hüfte': { en: 'Glutes & hips', ru: 'Ягодицы и тазобедренная область', it: 'Glutei e anca', es: 'Glúteos y cadera', fr: 'Fessiers & hanches' },
    '<strong>Wichtig:</strong> Keine Entspannungsmassage, sondern gezielte Tiefengewebsarbeit. Gerade nach der ersten Behandlung sind Muskelkater, Druckempfindlichkeit oder blaue Flecken möglich – sie klingen meist nach wenigen Tagen ab.': {
      en: '<strong>Important:</strong> This is not a relaxation massage but targeted deep-tissue work. Especially after the first treatment, muscle soreness, tenderness or bruising are possible – they usually fade within a few days.',
      ru: '<strong>Важно:</strong> это не расслабляющий массаж, а целенаправленная работа с глубокими тканями. Особенно после первого сеанса возможны мышечная боль, чувствительность к давлению или синяки – обычно они проходят через несколько дней.',
      it: '<strong>Importante:</strong> non è un massaggio rilassante, ma un lavoro mirato sui tessuti profondi. Soprattutto dopo il primo trattamento sono possibili indolenzimento, sensibilità alla pressione o lividi – di solito scompaiono in pochi giorni.',
      es: '<strong>Importante:</strong> no es un masaje relajante, sino un trabajo dirigido de tejido profundo. Sobre todo tras el primer tratamiento pueden aparecer agujetas, sensibilidad a la presión o moratones – suelen desaparecer en pocos días.',
      fr: '<strong>Important :</strong> il ne s’agit pas d’un massage de détente, mais d’un travail ciblé des tissus profonds. Surtout après la première séance, des courbatures, une sensibilité à la pression ou des bleus sont possibles – ils disparaissent généralement en quelques jours.'
    },

    // Schröpfen
    'Zusatzleistung': { en: 'Add-on', ru: 'Дополнительно', it: 'Servizio aggiuntivo', es: 'Servicio adicional', fr: 'En complément' },
    'vor Ort buchbar': { en: 'bookable on site', ru: 'можно заказать на месте', it: 'prenotabile in studio', es: 'reservable en la consulta', fr: 'réservable sur place' },
    'Glas-<em>Schröpfen.</em>': { en: 'Glass <em>cupping.</em>', ru: 'Баночный <em>массаж.</em>', it: 'Coppettazione <em>in vetro.</em>', es: 'Ventosas <em>de vidrio.</em>', fr: 'Ventouses <em>en verre.</em>' },
    'Der Unterdruck aktiviert das Gewebe, regt die Durchblutung an und versorgt das Areal besser mit Sauerstoff und Nährstoffen. Eine kraftvolle Ergänzung zur Tiefengewebsarbeit.': { en: 'The negative pressure activates the tissue, stimulates circulation and supplies the area better with oxygen and nutrients. A powerful complement to deep-tissue work.', ru: 'Вакуум активирует ткани, усиливает кровообращение и улучшает снабжение области кислородом и питательными веществами. Эффективное дополнение к работе с глубокими тканями.', it: 'La depressione attiva il tessuto, stimola la circolazione e migliora l’apporto di ossigeno e nutrienti alla zona. Un potente complemento al lavoro sui tessuti profondi.', es: 'La presión negativa activa el tejido, estimula la circulación y aporta más oxígeno y nutrientes a la zona. Un potente complemento al trabajo de tejido profundo.', fr: 'La dépression active les tissus, stimule la circulation et améliore l’apport en oxygène et en nutriments. Un complément puissant au travail des tissus profonds.' },
    'Mehr Durchblutung': { en: 'Better circulation', ru: 'Лучшее кровообращение', it: 'Più circolazione', es: 'Más circulación', fr: 'Meilleure circulation' },
    'Sauerstoff & Nährstoffe': { en: 'Oxygen & nutrients', ru: 'Кислород и питательные вещества', it: 'Ossigeno e nutrienti', es: 'Oxígeno y nutrientes', fr: 'Oxygène & nutriments' },
    'Oberflächliche Spannung lösen': { en: 'Release surface tension', ru: 'Снять поверхностное напряжение', it: 'Sciogliere le tensioni superficiali', es: 'Liberar la tensión superficial', fr: 'Relâcher les tensions superficielles' },
    'Regeneration unterstützen': { en: 'Support recovery', ru: 'Поддержать восстановление', it: 'Favorire la rigenerazione', es: 'Favorecer la recuperación', fr: 'Favoriser la récupération' },
    'Frag einfach beim Termin nach': { en: 'Just ask at your appointment', ru: 'Просто спросите на приёме', it: 'Chiedi pure durante l’appuntamento', es: 'Pregunta durante tu cita', fr: 'Demandez simplement lors du rendez-vous' },

    // Kurs-Teaser
    'Privater Online-Fachkurs': { en: 'Private online course', ru: 'Частный онлайн-курс', it: 'Corso online privato', es: 'Curso online privado', fr: 'Cours en ligne privé' },
    'Werde <em>Faszien-Praktiker.</em>': { en: 'Become a <em>fascia practitioner.</em>', ru: 'Станьте <em>специалистом по фасциям.</em>', it: 'Diventa <em>operatore fasciale.</em>', es: 'Conviértete en <em>practicante de fascia.</em>', fr: 'Devenez <em>praticien des fascias.</em>' },
    'Der private Online-Fachkurs für alle, die fundierte Faszien- und Triggerpunktarbeit lernen wollen – als Erweiterung der eigenen Praxis oder als Schritt in die Selbstständigkeit.': { en: 'The private online course for anyone who wants to learn well-founded fascia and trigger point work – to expand their own practice or as a step into self-employment.', ru: 'Частный онлайн-курс для всех, кто хочет основательно освоить работу с фасциями и триггерными точками – для расширения своей практики или как шаг к собственному делу.', it: 'Il corso online privato per chi vuole imparare un lavoro solido su fasce e trigger point – per ampliare la propria attività o per mettersi in proprio.', es: 'El curso online privado para quienes quieren aprender un trabajo sólido de fascia y puntos gatillo – para ampliar su consulta o dar el paso a trabajar por cuenta propia.', fr: 'Le cours en ligne privé pour tous ceux qui veulent apprendre un travail solide des fascias et des points gâchettes – pour enrichir leur pratique ou se lancer à leur compte.' },
    'Module mit Praxis-Videos': { en: 'modules with practical videos', ru: 'модулей с практическими видео', it: 'moduli con video pratici', es: 'módulos con vídeos prácticos', fr: 'modules avec vidéos pratiques' },
    'Lebenslanger Zugriff': { en: 'Lifetime access', ru: 'Пожизненный доступ', it: 'Accesso a vita', es: 'Acceso de por vida', fr: 'Accès à vie' },
    'Teilnehmende': { en: 'participants', ru: 'участников', it: 'partecipanti', es: 'participantes', fr: 'participants' },
    'inkl. Zertifikat': { en: 'incl. certificate', ru: 'включая сертификат', it: 'certificato incluso', es: 'certificado incluido', fr: 'certificat inclus' },
    'Zum Online-Kurs': { en: 'View the online course', ru: 'К онлайн-курсу', it: 'Al corso online', es: 'Ver el curso online', fr: 'Voir le cours en ligne' },
    'CPD · IPHM · IAOTH zertifiziert': { en: 'CPD · IPHM · IAOTH certified', ru: 'Сертификация CPD · IPHM · IAOTH', it: 'Certificato CPD · IPHM · IAOTH', es: 'Certificado CPD · IPHM · IAOTH', fr: 'Certifié CPD · IPHM · IAOTH' },

    // Bewertungen
    'Echte Stimmen': { en: 'Real voices', ru: 'Настоящие отзывы', it: 'Voci reali', es: 'Opiniones reales', fr: 'De vrais témoignages' },
    'aus 196+ Bewertungen auf Google': { en: 'from 196+ reviews on Google', ru: 'по 196+ отзывам в Google', it: 'su oltre 196 recensioni Google', es: 'de más de 196 reseñas en Google', fr: 'sur plus de 196 avis Google' },
    'Was Klienten erlebt haben.': { en: 'What clients have experienced.', ru: 'Что говорят клиенты.', it: 'Cosa hanno vissuto i clienti.', es: 'Lo que han vivido los clientes.', fr: 'Ce que les clients ont vécu.' },
    'Alle Bewertungen ansehen': { en: 'See all reviews', ru: 'Все отзывы', it: 'Vedi tutte le recensioni', es: 'Ver todas las reseñas', fr: 'Voir tous les avis' },
    'Bewertung schreiben': { en: 'Write a review', ru: 'Оставить отзыв', it: 'Scrivi una recensione', es: 'Escribir una reseña', fr: 'Écrire un avis' },

    // FAQ
    'Häufige <em>Fragen.</em>': { en: 'Frequently asked <em>questions.</em>', ru: 'Частые <em>вопросы.</em>', it: 'Domande <em>frequenti.</em>', es: 'Preguntas <em>frecuentes.</em>', fr: 'Questions <em>fréquentes.</em>' },
    'Was unterscheidet das von einer klassischen Massage?': { en: 'How is this different from a classic massage?', ru: 'Чем это отличается от классического массажа?', it: 'In cosa si differenzia da un massaggio classico?', es: '¿En qué se diferencia de un masaje clásico?', fr: 'En quoi est-ce différent d’un massage classique ?' },
    'Klassische Massage arbeitet an der Oberfläche. Meine Arbeit setzt im tieferen Muskel- und Fasziengewebe an – dort, wo sich über längere Zeit verhärtete Strukturen entwickeln. Präzise Gewebearbeit, keine Entspannungsbehandlung.': { en: 'Classic massage works on the surface. My work targets the deeper muscle and fascial tissue – where hardened structures develop over a long time. Precise tissue work, not a relaxation treatment.', ru: 'Классический массаж работает на поверхности. Моя работа направлена на более глубокие мышечные и фасциальные ткани – туда, где со временем формируются уплотнения. Точная работа с тканями, а не расслабляющая процедура.', it: 'Il massaggio classico lavora in superficie. Il mio lavoro agisce sul tessuto muscolare e fasciale più profondo – dove nel tempo si formano strutture indurite. Lavoro preciso sui tessuti, non un trattamento rilassante.', es: 'El masaje clásico trabaja en la superficie. Mi trabajo actúa en el tejido muscular y fascial más profundo – donde con el tiempo se forman estructuras endurecidas. Trabajo preciso del tejido, no un tratamiento relajante.', fr: 'Le massage classique agit en surface. Mon travail cible les tissus musculaires et fasciaux plus profonds – là où des structures durcies se forment avec le temps. Un travail précis des tissus, pas un soin de détente.' },
    'Wie läuft die erste Behandlung ab?': { en: 'What happens in the first treatment?', ru: 'Как проходит первый сеанс?', it: 'Come si svolge il primo trattamento?', es: '¿Cómo es el primer tratamiento?', fr: 'Comment se déroule la première séance ?' },
    'Wir starten mit einem kurzen Gespräch zu Beschwerden, Vorerkrankungen und Zielen. Dann taste ich gezielt nach Druck, Verhärtung und Triggerpunkten. Die Behandlung dauert 30 bis 45 Minuten. Am Ende bekommst du Hinweise für die nächsten 24–48 Stunden und ggf. einfache Heimübungen.': { en: 'We start with a short conversation about your complaints, medical history and goals. Then I carefully feel for pressure, tight spots and trigger points. The treatment takes 30 to 45 minutes. At the end you get advice for the next 24–48 hours and, if needed, simple home exercises.', ru: 'Мы начинаем с короткой беседы о жалобах, перенесённых заболеваниях и целях. Затем я целенаправленно прощупываю зоны давления, уплотнения и триггерные точки. Сеанс длится 30–45 минут. В конце вы получите рекомендации на ближайшие 24–48 часов и при необходимости простые упражнения для дома.', it: 'Iniziamo con un breve colloquio su disturbi, patologie pregresse e obiettivi. Poi cerco con precisione punti di pressione, indurimenti e trigger point. Il trattamento dura dai 30 ai 45 minuti. Alla fine ricevi indicazioni per le 24–48 ore successive ed eventualmente semplici esercizi da fare a casa.', es: 'Empezamos con una breve conversación sobre tus molestias, antecedentes y objetivos. Después palpo de forma precisa zonas de presión, contracturas y puntos gatillo. El tratamiento dura de 30 a 45 minutos. Al final recibes indicaciones para las siguientes 24–48 horas y, si hace falta, ejercicios sencillos para casa.', fr: 'Nous commençons par un court échange sur vos symptômes, vos antécédents et vos objectifs. Ensuite, je palpe de façon ciblée les zones de pression, les durcissements et les points gâchettes. La séance dure de 30 à 45 minutes. À la fin, vous recevez des conseils pour les 24 à 48 heures suivantes et, si besoin, des exercices simples à faire chez vous.' },
    'Wie intensiv ist die Behandlung?': { en: 'How intense is the treatment?', ru: 'Насколько интенсивен сеанс?', it: 'Quanto è intenso il trattamento?', es: '¿Qué intensidad tiene el tratamiento?', fr: 'Quelle est l’intensité du soin ?' },
    'Bei starken Verhärtungen kann sie intensiv sein. Den Druck passe ich kontrolliert an – sag jederzeit, wenn es zu viel wird. Danach ist eine muskelkaterähnliche Reaktion möglich, die meist nach 1–2 Tagen abklingt.': { en: 'With severe tightness it can be intense. I adjust the pressure carefully – tell me at any time if it gets too much. Afterwards a reaction similar to muscle soreness is possible, which usually subsides after 1–2 days.', ru: 'При сильных уплотнениях сеанс может быть интенсивным. Я контролируемо подбираю давление – скажите в любой момент, если станет слишком сильно. После сеанса возможна реакция, похожая на мышечную боль после тренировки; обычно она проходит через 1–2 дня.', it: 'In presenza di forti indurimenti può essere intenso. Regolo la pressione in modo controllato – dimmi in qualsiasi momento se è troppo. Dopo è possibile una reazione simile all’indolenzimento muscolare, che di solito passa in 1–2 giorni.', es: 'Con contracturas fuertes puede ser intenso. Ajusto la presión de forma controlada – dime en cualquier momento si es demasiado. Después puede aparecer una reacción parecida a las agujetas, que suele desaparecer en 1–2 días.', fr: 'En cas de forts durcissements, il peut être intense. J’adapte la pression de façon contrôlée – dites-le-moi à tout moment si c’est trop. Ensuite, une réaction proche des courbatures est possible ; elle disparaît généralement après 1 à 2 jours.' },
    'Wie oft sollte ich eine Behandlung buchen?': { en: 'How often should I book a treatment?', ru: 'Как часто стоит записываться?', it: 'Ogni quanto dovrei prenotare un trattamento?', es: '¿Con qué frecuencia debo reservar?', fr: 'À quelle fréquence réserver une séance ?' },
    'Das hängt von Alter, Beruf und Beschwerden ab. Jüngere Menschen: alle 2–4 Wochen. Bei chronischen oder berufsbedingten Beschwerden: alle 1–2 Wochen. Wir besprechen das nach der ersten Behandlung.': { en: 'That depends on age, occupation and complaints. Younger people: every 2–4 weeks. With chronic or work-related complaints: every 1–2 weeks. We discuss this after the first treatment.', ru: 'Это зависит от возраста, профессии и жалоб. Молодым людям – раз в 2–4 недели. При хронических или профессиональных жалобах – раз в 1–2 недели. Мы обсудим это после первого сеанса.', it: 'Dipende da età, professione e disturbi. Persone più giovani: ogni 2–4 settimane. Con disturbi cronici o legati al lavoro: ogni 1–2 settimane. Ne parliamo dopo il primo trattamento.', es: 'Depende de la edad, la profesión y las molestias. Personas jóvenes: cada 2–4 semanas. Con molestias crónicas o laborales: cada 1–2 semanas. Lo hablamos después del primer tratamiento.', fr: 'Cela dépend de l’âge, du métier et des symptômes. Personnes plus jeunes : toutes les 2 à 4 semaines. En cas de troubles chroniques ou liés au travail : toutes les 1 à 2 semaines. Nous en parlons après la première séance.' },
    'Wann ist eine Behandlung nicht geeignet?': { en: 'When is a treatment not suitable?', ru: 'Когда процедура не подходит?', it: 'Quando il trattamento non è indicato?', es: '¿Cuándo no está indicado el tratamiento?', fr: 'Quand le soin n’est-il pas adapté ?' },
    'Bei akuten Entzündungen, Fieber, Blutgerinnungsstörungen, frischen Operationen, Krebserkrankungen, Rheuma oder Arthrose ist von Tiefengewebsarbeit abzuraten. Im Zweifel bitte vorher ärztlich abklären.': { en: 'Deep-tissue work is not advisable with acute inflammation, fever, blood clotting disorders, recent surgery, cancer, rheumatism or arthrosis. If in doubt, please consult a doctor first.', ru: 'При острых воспалениях, температуре, нарушениях свёртываемости крови, недавних операциях, онкологических заболеваниях, ревматизме или артрозе работа с глубокими тканями не рекомендуется. В случае сомнений, пожалуйста, заранее проконсультируйтесь с врачом.', it: 'In caso di infiammazioni acute, febbre, disturbi della coagulazione, interventi chirurgici recenti, tumori, reumatismi o artrosi il lavoro sui tessuti profondi è sconsigliato. Nel dubbio, consulta prima un medico.', es: 'En caso de inflamaciones agudas, fiebre, trastornos de la coagulación, operaciones recientes, cáncer, reúma o artrosis, no se recomienda el trabajo de tejido profundo. En caso de duda, consulta antes con un médico.', fr: 'En cas d’inflammation aiguë, de fièvre, de troubles de la coagulation, d’opération récente, de cancer, de rhumatisme ou d’arthrose, le travail des tissus profonds est déconseillé. En cas de doute, consultez d’abord un médecin.' },
    'Kann ich auch einen Online-Kurs belegen?': { en: 'Can I also take an online course?', ru: 'Можно ли пройти онлайн-курс?', it: 'Posso seguire anche un corso online?', es: '¿Puedo hacer también un curso online?', fr: 'Puis-je aussi suivre un cours en ligne ?' },
    'Ja. Die zertifizierten Online-Kurse richten sich an alle, die fachlich in die Faszienarbeit einsteigen möchten – zur Weiterbildung oder für den Schritt in die Selbstständigkeit.': { en: 'Yes. The certified online courses are for anyone who wants to get into fascia work professionally – for further training or as a step into self-employment.', ru: 'Да. Сертифицированные онлайн-курсы предназначены для всех, кто хочет профессионально освоить работу с фасциями – для повышения квалификации или как шаг к собственному делу.', it: 'Sì. I corsi online certificati sono rivolti a chi vuole avvicinarsi professionalmente al lavoro sulle fasce – per aggiornarsi o per mettersi in proprio.', es: 'Sí. Los cursos online certificados están dirigidos a quienes quieren iniciarse profesionalmente en el trabajo de fascia – como formación continua o para dar el paso a trabajar por cuenta propia.', fr: 'Oui. Les cours en ligne certifiés s’adressent à tous ceux qui veulent se lancer professionnellement dans le travail des fascias – pour se perfectionner ou pour s’installer à leur compte.' }
  };

  // ── Zustand ──────────────────────────────────────────────
  function readStored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function store(code) {
    try { localStorage.setItem(STORE_KEY, code); } catch (e) { /* storage unavailable */ }
  }
  var lang = readStored();
  if (!LANGS.some(function (l) { return l.code === lang; })) lang = DEFAULT;

  // ── Übersetzbare Stellen einsammeln (einmalig, vor site.js) ──
  var INLINE = { EM: 1, STRONG: 1, BR: 1, B: 1, I: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, TEMPLATE: 1, TEXTAREA: 1 };
  var registry = [];

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  function collect(el) {
    if (SKIP[el.tagName.toUpperCase()] || el.hasAttribute('data-no-i18n')) return;

    var label = el.getAttribute('aria-label');
    if (label && T[norm(label)]) registry.push({ el: el, attr: 'aria-label', key: norm(label) });

    var kids = el.children;
    if (!kids.length) {
      var text = norm(el.textContent);
      if (text && T[text]) { registry.push({ el: el, key: text, mode: 'text' }); }
      return;
    }

    var onlyInline = true;
    for (var i = 0; i < kids.length; i++) {
      if (!INLINE[kids[i].tagName]) { onlyInline = false; break; }
    }
    if (onlyInline) {
      var html = norm(el.innerHTML);
      if (T[html]) { registry.push({ el: el, key: html, mode: 'html' }); return; }
    }

    // Gemischter Inhalt: lose Textknoten einzeln, Elemente rekursiv
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 1) { collect(n); return; }
      if (n.nodeType !== 3) return;
      var key = norm(n.data);
      if (key && T[key]) {
        var m = n.data.match(/^(\s*)[\s\S]*?(\s*)$/);
        registry.push({ node: n, key: key, lead: m[1], trail: m[2] });
      }
    });
  }

  function translate(key, code) {
    if (code === DEFAULT) return key;
    var entry = T[key];
    return (entry && entry[code]) || key;
  }

  function applyAll() {
    registry.forEach(function (r) {
      var val = translate(r.key, lang);
      if (r.attr) { r.el.setAttribute(r.attr, val); return; }
      if (r.node) { r.node.data = r.lead + val + r.trail; return; }
      if (r.mode === 'html') r.el.innerHTML = val;
      else r.el.textContent = val;
    });
    document.documentElement.lang = lang;
    syncSwitchers();
  }

  // ── Umschalter (Header + schwebend) ──────────────────────
  var GLOBE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 3.9 5.9 3.9 9.5s-1.3 6.8-3.9 9.5c-2.6-2.7-3.9-5.9-3.9-9.5s1.3-6.8 3.9-9.5z"/></svg>';
  var CHEVRON = '<svg class="lang__chev" width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.6"/></svg>';
  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>';

  var switchers = [];
  var waLink = null;
  var uid = 0;

  function buildSwitcher(variant) {
    var id = 'lang-menu-' + (++uid);
    var wrap = document.createElement('div');
    wrap.className = 'lang lang--' + variant;
    wrap.setAttribute('data-no-i18n', '');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    btn.innerHTML = GLOBE + '<span class="lang__code"></span>' + CHEVRON;

    var list = document.createElement('ul');
    list.className = 'lang__menu';
    list.id = id;
    list.hidden = true;

    LANGS.forEach(function (l) {
      var li = document.createElement('li');
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'lang__opt';
      opt.lang = l.code;
      opt.setAttribute('data-lang-opt', l.code);
      opt.innerHTML = '<span>' + l.name + '</span><span class="lang__opt-code">' + l.code.toUpperCase() + '</span>';
      opt.addEventListener('click', function () {
        setLang(l.code);
        close(true);
      });
      li.appendChild(opt);
      list.appendChild(li);
    });

    function open() {
      closeAll();
      list.hidden = false;
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      var active = list.querySelector('[aria-current]') || list.querySelector('button');
      if (active) active.focus({ preventScroll: true });
    }
    function close(returnFocus) {
      if (list.hidden) return;
      list.hidden = true;
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) btn.focus({ preventScroll: true });
    }

    btn.addEventListener('click', function () {
      if (list.hidden) open(); else close(false);
    });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(true); return; }
      if (e.key === 'Tab') { close(false); return; }
      if (list.hidden || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
      e.preventDefault();
      var opts = Array.prototype.slice.call(list.querySelectorAll('button'));
      var i = opts.indexOf(document.activeElement);
      i = e.key === 'ArrowDown' ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
      opts[i].focus();
    });

    wrap.appendChild(btn);
    wrap.appendChild(list);
    switchers.push({ wrap: wrap, btn: btn, list: list, close: close });
    return wrap;
  }

  function closeAll() { switchers.forEach(function (s) { s.close(false); }); }

  function syncSwitchers() {
    var ui = UI[lang] || UI[DEFAULT];
    switchers.forEach(function (s) {
      s.btn.querySelector('.lang__code').textContent = lang.toUpperCase();
      var current = LANGS.filter(function (l) { return l.code === lang; })[0];
      s.btn.setAttribute('aria-label', ui.choose + ' – ' + current.name);
      s.list.setAttribute('aria-label', ui.choose);
      Array.prototype.forEach.call(s.list.querySelectorAll('[data-lang-opt]'), function (opt) {
        if (opt.getAttribute('data-lang-opt') === lang) opt.setAttribute('aria-current', 'true');
        else opt.removeAttribute('aria-current');
      });
    });
    if (waLink) {
      waLink.setAttribute('aria-label', ui.wa);
      waLink.title = ui.wa;
    }
  }

  function setLang(code) {
    if (code === lang) return;
    lang = code;
    store(code);
    applyAll();
  }

  function buildDock() {
    var dock = document.createElement('div');
    dock.className = 'dock';
    dock.setAttribute('data-no-i18n', '');

    waLink = document.createElement('a');
    waLink.className = 'dock__wa';
    waLink.href = WA_URL;
    waLink.target = '_blank';
    waLink.rel = 'noopener';
    waLink.innerHTML = WA_ICON;

    dock.appendChild(buildSwitcher('float'));
    dock.appendChild(waLink);
    document.body.appendChild(dock);
  }

  // Klick außerhalb schließt offene Menüs
  document.addEventListener('click', function (e) {
    switchers.forEach(function (s) {
      if (!s.wrap.contains(e.target)) s.close(false);
    });
  });

  // ── Start ────────────────────────────────────────────────
  function init() {
    if (document.body) collect(document.body);

    var actions = document.querySelector('.site-header__actions');
    if (actions) {
      var anchor = actions.querySelector('.btn--header') || actions.firstChild;
      actions.insertBefore(buildSwitcher('header'), anchor);
    }
    buildDock();
    applyAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

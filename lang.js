(function () {
  'use strict';

  var STORE_KEY = 'fp-lang';
  var DEFAULT = 'de';

  var LANGS = [
    { code: 'de', label: 'DE', name: 'Deutsch' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' },
    { code: 'it', label: 'IT', name: 'Italiano' },
    { code: 'ru', label: 'RU', name: 'Русский' }
  ];

  // ── Translation dictionary ────────────────────────────────
  var T = {
    // Navigation
    'nav.leistungen':  { de: 'Leistungen',    en: 'Services',        es: 'Servicios',         it: 'Servizi',           ru: 'Услуги' },
    'nav.ablauf':      { de: 'Ablauf',         en: 'Process',         es: 'Proceso',           it: 'Processo',          ru: 'Процесс' },
    'nav.kurs':        { de: 'Online-Kurs',    en: 'Online Course',   es: 'Curso online',      it: 'Corso online',      ru: 'Онлайн-курс' },
    'nav.gutschein':   { de: 'Gutschein',      en: 'Gift Card',       es: 'Vale regalo',       it: 'Buono regalo',      ru: 'Сертификат' },
    'nav.ueber':       { de: 'Über mich',      en: 'About',           es: 'Sobre mí',          it: 'Chi sono',          ru: 'Обо мне' },
    'nav.zertifikate': { de: 'Zertifikate',    en: 'Certificates',    es: 'Certificados',      it: 'Certificati',       ru: 'Сертификаты' },
    'nav.cta':         { de: 'Termin buchen',  en: 'Book Appointment',es: 'Reservar cita',     it: 'Prenota',           ru: 'Записаться' },

    // Hero
    'hero.eyebrow':  { de: 'Spaichingen · Faszien &amp; Triggerpunktarbeit', en: 'Spaichingen · Fascia &amp; Trigger Point Therapy', es: 'Spaichingen · Terapia de fascia y puntos gatillo', it: 'Spaichingen · Terapia della fascia e trigger point', ru: 'Шпайхинген · Фасциальная и триггерная терапия' },
    'hero.heading':  { de: 'Praxis für Faszien<br>&amp; <em>Triggerpunkte</em><br>in Spaichingen', en: 'Practice for Fascia<br>&amp; <em>Trigger Points</em><br>in Spaichingen', es: 'Centro de terapia<br>de <em>fascia y puntos gatillo</em><br>en Spaichingen', it: 'Studio di terapia fascia<br>&amp; <em>trigger point</em><br>a Spaichingen', ru: 'Кабинет фасциальной<br>&amp; <em>триггерной терапии</em><br>в Шпайхингене' },
    'hero.sub':      { de: 'Für Menschen mit anhaltenden Schmerzbelastungen und körperlichen Beschwerden.<br>Bei Druck, Ziehen, Stechen und verhärteten Strukturen im Gewebe.', en: 'For pressure, pulling, stabbing pain and hardened tissue — targeted deep-tissue work by a certified fascia &amp; sports therapist.', es: 'Para presión, tirantez, dolor punzante y tejido endurecido — trabajo profundo dirigido por un terapeuta de fascia y deportivo certificado.', it: 'Per pressione, trazione, dolore pungente e tessuto indurito — lavoro profondo mirato di un terapista della fascia e sportivo certificato.', ru: 'При давлении, тянущих, колющих болях и уплотнениях в тканях — целенаправленная работа с глубокими тканями от сертифицированного фасциального и спортивного терапевта.' },
    'hero.book':     { de: 'Termin buchen',          en: 'Book Appointment',        es: 'Reservar cita',         it: 'Prenota appuntamento',  ru: 'Записаться' },
    'hero.services': { de: 'Leistungen ansehen',     en: 'View Services',           es: 'Ver servicios',         it: 'Vedi servizi',          ru: 'Услуги' },
    'hero.reviews':  { de: 'Bewertungen',            en: 'Reviews',                 es: 'Reseñas',               it: 'Recensioni',            ru: 'отзывов' },
    'hero.cert':     { de: 'Zertifizierter Faszientherapeut &amp; Sporttherapeut', en: 'Certified Fascia &amp; Sports Therapist', es: 'Terapeuta de fascia y deportivo certificado', it: 'Terapista della fascia e sportivo certificato', ru: 'Сертифицированный фасциальный и спортивный терапевт' },

    // Trust bar
    'trust.google':  { de: 'auf Google',             en: 'on Google',               es: 'en Google',             it: 'su Google',             ru: 'в Google' },
    'trust.reviews': { de: 'Bewertungen',             en: 'Reviews',                 es: 'Reseñas',               it: 'Recensioni',            ru: 'отзывов' },
    'trust.cert':    { de: 'Zertifizierter Faszientherapeut', en: 'Certified Fascia Therapist', es: 'Terapeuta de fascia certificado', it: 'Terapista della fascia certificato', ru: 'Сертифицированный фасциальный терапевт' },
    'trust.deep':    { de: 'Gezielte Tiefengewebearbeit',     en: 'Targeted Deep-Tissue Work',  es: 'Trabajo profundo dirigido',      it: 'Lavoro profondo mirato',            ru: 'Целенаправленная работа с тканями' },
    'trust.appt':    { de: 'Behandlung mit Termin',      en: 'By Appointment Only',        es: 'Solo con cita previa',           it: 'Solo su appuntamento',              ru: 'Только по записи' },

    // Hours
    'hours.label': { de: 'Öffnungszeiten', en: 'Opening Hours', es: 'Horario', it: 'Orari', ru: 'Часы работы' },

    // Conditions section
    'cond.eyebrow': { de: 'Behandlungsbereiche', en: 'Treatment Areas',     es: 'Áreas de tratamiento',  it: 'Aree di trattamento',   ru: 'Области лечения' },
    'cond.title':   { de: 'Womit ich helfen kann', en: 'What I Can Help With', es: 'Cómo puedo ayudarte', it: 'Come posso aiutarti',   ru: 'Чем я могу помочь' },
    'cond.lead':    { de: 'Wenn du dich in einem der folgenden Punkte erkennst, ist eine Behandlung für dich geeignet.', en: 'If you recognise yourself in any of the following, a treatment is suitable for you.', es: 'Si te identificas con alguno de los siguientes puntos, un tratamiento es adecuado para ti.', it: 'Se ti riconosci in uno dei seguenti punti, un trattamento è adatto a te.', ru: 'Если вы узнаёте себя в одном из следующих пунктов, лечение подойдёт вам.' },
    'cond.1.h': { de: 'Rücken &amp; Nacken',         en: 'Back &amp; Neck',           es: 'Espalda y cuello',       it: 'Schiena e collo',         ru: 'Спина и шея' },
    'cond.1.p': { de: 'Chronische Rückenschmerzen, Nackenverspannungen, Zugspannung im Kopfbereich', en: 'Chronic back pain, neck tension, pulling tension in the head area', es: 'Dolor crónico de espalda, tensión cervical, tensión de tracción en la cabeza', it: 'Dolore cronico alla schiena, tensione cervicale, tensione di trazione nella testa', ru: 'Хронические боли в спине, напряжение шеи, тянущее давление в области головы' },
    'cond.2.h': { de: 'Schulter &amp; Arm',          en: 'Shoulder &amp; Arm',        es: 'Hombro y brazo',         it: 'Spalla e braccio',        ru: 'Плечо и рука' },
    'cond.2.p': { de: 'Eingeschränkte Schulterbeweglichkeit, Taubheitsgefühle in Armen oder Händen', en: 'Restricted shoulder mobility, numbness in arms or hands', es: 'Movilidad limitada del hombro, entumecimiento en brazos o manos', it: 'Mobilità limitata della spalla, intorpidimento nelle braccia o nelle mani', ru: 'Ограниченная подвижность плечевого сустава, онемение в руках или кистях' },
    'cond.3.h': { de: 'Beine &amp; Füße',            en: 'Legs &amp; Feet',           es: 'Piernas y pies',         it: 'Gambe e piedi',           ru: 'Ноги и стопы' },
    'cond.3.p': { de: 'Waden- und Oberschenkelverhärtungen, Fußsohlenschmerzen, Gesäßblockaden', en: 'Calf and thigh hardening, sole pain, gluteal blockages', es: 'Endurecimiento de gemelos y muslos, dolor en la planta del pie, bloqueos glúteos', it: 'Indurimento di polpacci e cosce, dolore alla pianta del piede, blocchi glutei', ru: 'Уплотнения в икрах и бёдрах, боли в подошве, блокировки ягодиц' },
    'cond.4.h': { de: 'Triggerpunkte',               en: 'Trigger Points',            es: 'Puntos gatillo',         it: 'Punti trigger',           ru: 'Триггерные точки' },
    'cond.4.p': { de: 'Schmerz, der nicht dort sitzt, wo die Ursache liegt — ein Zeichen für aktive Triggerpunkte', en: 'Pain that is not where the cause lies — a sign of active trigger points', es: 'Dolor que no está donde está la causa — una señal de puntos gatillo activos', it: 'Dolore che non è dove si trova la causa — un segnale di punti trigger attivi', ru: 'Боль, которая находится не там, где её причина — признак активных триггерных точек' },
    'cond.5.h': { de: 'Kiefer &amp; Kopf',           en: 'Jaw &amp; Head',            es: 'Mandíbula y cabeza',     it: 'Mascella e testa',        ru: 'Челюсть и голова' },
    'cond.5.p': { de: 'Kieferverspannungen, Druckgefühl im Kopf, Schwindel durch Muskelverspannung', en: 'Jaw tension, pressure sensation in the head, dizziness from muscle tension', es: 'Tensión mandibular, sensación de presión en la cabeza, vértigo por tensión muscular', it: 'Tensione alla mascella, sensazione di pressione alla testa, vertigini da tensione muscolare', ru: 'Напряжение челюсти, чувство давления в голове, головокружение от мышечного напряжения' },
    'cond.6.h': { de: 'Körperspannung &amp; Stress',  en: 'Body Tension &amp; Stress', es: 'Tensión corporal y estrés', it: 'Tensione corporea e stress', ru: 'Напряжение и стресс' },
    'cond.6.p': { de: 'Dauerhaft angespannt, blockiert, innerer Druck — auch ohne klare Schmerzursache', en: 'Permanently tense, blocked, inner pressure — even without a clear cause of pain', es: 'Permanentemente tenso, bloqueado, presión interior — incluso sin causa de dolor clara', it: 'Permanentemente teso, bloccato, pressione interiore — anche senza una causa di dolore chiara', ru: 'Постоянное напряжение, блокировки, внутреннее давление — даже без явной причины боли' },

    // How section
    'how.eyebrow': { de: 'Wie ich arbeite',   en: 'How I Work',         es: 'Cómo trabajo',       it: 'Come lavoro',          ru: 'Как я работаю' },
    'how.title':   { de: 'Gezielte Arbeit,<br><em>keine Kompromisse</em>', en: 'Targeted Work,<br><em>No Compromises</em>', es: 'Trabajo dirigido,<br><em>sin compromisos</em>', it: 'Lavoro mirato,<br><em>senza compromessi</em>', ru: 'Целенаправленная работа,<br><em>без компромиссов</em>' },
    'how.1.h': { de: 'Ursache finden',   en: 'Find the Cause',      es: 'Encontrar la causa',  it: 'Trovare la causa',     ru: 'Найти причину' },
    'how.1.p': { de: 'Jeder Körper erzählt eine Geschichte. Ich taste gezielt nach Verspannungen, Verhärtungen und Triggerpunkten — dort, wo der Schmerz wirklich entsteht, nicht wo er sich zeigt.', en: 'Every body tells a story. I palpate specifically for tensions, hardening and trigger points — where the pain really originates, not where it shows itself.', es: 'Cada cuerpo cuenta una historia. Palpo específicamente en busca de tensiones, endurecimiento y puntos gatillo — donde el dolor realmente se origina, no donde se manifiesta.', it: 'Ogni corpo racconta una storia. Palpo specificamente tensioni, indurimenti e punti trigger — dove il dolore ha realmente origine, non dove si manifesta.', ru: 'Каждое тело рассказывает свою историю. Я пальпирую напряжения, уплотнения и триггерные точки — там, где боль действительно возникает, а не где она проявляется.' },
    'how.2.h': { de: 'Tief behandeln',   en: 'Treat Deeply',        es: 'Tratar en profundidad', it: 'Trattare in profondità', ru: 'Глубокая работа' },
    'how.2.p': { de: 'Mit präzisen manuellen Techniken arbeite ich an tiefsitzenden Gewebeverdichtungen. Das kann intensiv sein — und genau das ist der Unterschied zur klassischen Massage.', en: 'Using precise manual techniques, I work on deep-seated tissue densification. This can be intense — and that is exactly the difference from a classic massage.', es: 'Utilizando técnicas manuales precisas, trabajo en densificaciones tisulares profundas. Esto puede ser intenso — y esa es exactamente la diferencia con un masaje clásico.', it: 'Con tecniche manuali precise lavoro sulle densificazioni dei tessuti profondi. Questo può essere intenso — ed è esattamente la differenza rispetto a un massaggio classico.', ru: 'С помощью точных мануальных техник я работаю с глубокими уплотнениями тканей. Это может быть интенсивно — и именно это отличает работу от классического массажа.' },
    'how.3.h': { de: 'Nachhaltig freier', en: 'Lastingly Freer',    es: 'Liberación duradera', it: 'Più liberi durevolmente', ru: 'Устойчивое облегчение' },
    'how.3.p': { de: 'Nach einer kurzen Reaktionsphase (oft Muskelkater für 1–2 Tage) berichten die meisten Klienten von deutlich reduziertem Schmerz und besserer Beweglichkeit.', en: 'After a short reaction phase (often muscle soreness for 1–2 days), most clients report significantly reduced pain and better mobility.', es: 'Tras una breve fase de reacción (a menudo agujetas durante 1–2 días), la mayoría reporta un dolor significativamente reducido y mayor movilidad.', it: 'Dopo una breve fase di reazione (spesso indolenzimento per 1–2 giorni), la maggior parte dei clienti riferisce dolore notevolmente ridotto e mobilità migliorata.', ru: 'После короткой фазы реакции (часто мышечная боль 1–2 дня) большинство клиентов отмечают значительное снижение боли и улучшение подвижности.' },

    // About
    'about.eyebrow': { de: 'Über mich',    en: 'About me',   es: 'Sobre mí',    it: 'Chi sono',     ru: 'Обо мне' },
    'about.title':   { de: 'Ich bin <em>Wadim Fech</em>', en: 'I am <em>Wadim Fech</em>', es: 'Soy <em>Wadim Fech</em>', it: 'Sono <em>Wadim Fech</em>', ru: 'Я <em>Вадим Фех</em>' },
    'about.role':    { de: 'Faszientherapeut &amp; Sporttherapeut &amp; Gesundheitspraktiker', en: 'Fascia Therapist &amp; Sports Therapist &amp; Health Practitioner', es: 'Terapeuta de fascia &amp; deportivo &amp; salud', it: 'Terapista della fascia &amp; sportivo &amp; della salute', ru: 'Фасциальный &amp; спортивный &amp; оздоровительный терапевт' },
    'about.quote':   { de: '„Mein Anspruch: dort arbeiten, wo viele Ansätze nicht weiterkommen. Präzise, ehrlich, mit Zeit für deinen Körper."', en: '"My goal: to work where many approaches fall short. Precise, honest, with time for your body."', es: '"Mi objetivo: trabajar donde otros enfoques no llegan. Preciso, honesto, con tiempo para tu cuerpo."', it: '"Il mio obiettivo: lavorare dove molti approcci non arrivano. Preciso, onesto, con tempo per il tuo corpo."', ru: '«Моя цель — работать там, где многие подходы не дают результата. Точно, честно, с вниманием к вашему телу.»' },
    'about.p1':      { de: 'Ich bin Wadim Fech, selbstständiger Faszientherapeut &amp; Sporttherapeut mit Schwerpunkt auf manueller Tiefengewebearbeit. Sie sind bei mir richtig, wenn Sie im Alltag anhaltenden Druck im Körper, Ziehen oder stechende Empfindungen von Kopf bis Fuß wahrnehmen – zum Beispiel im Nacken-, Schulter-, Rücken-, Arm- oder Beinbereich.', en: 'I am Wadim Fech, a self-employed fascia therapist &amp; sports therapist specialising in manual deep-tissue work. You are in the right place if you experience persistent pressure in the body, pulling or stabbing sensations from head to toe — for example in the neck, shoulder, back, arm or leg area.', es: 'Soy Wadim Fech, terapeuta de fascia y deportivo independiente especializado en trabajo manual de tejido profundo. Estás en el lugar correcto si en tu vida diaria experimentas presión persistente en el cuerpo, tirantez o sensaciones de punzada de la cabeza a los pies.', it: 'Sono Wadim Fech, terapista della fascia e sportivo indipendente specializzato nel lavoro manuale sui tessuti profondi. Sei nel posto giusto se avverti una pressione persistente nel corpo, trazione o sensazioni di dolore dalla testa ai piedi.', ru: 'Я Вадим Фех — самозанятый фасциальный и спортивный терапевт, специализирующийся на мануальной работе с глубокими тканями. Вы попали по адресу, если ощущаете постоянное давление в теле, тянущие или колющие боли от головы до пят.' },
    'about.p2':      { de: 'Viele Menschen spüren über längere Zeit Druck im Gewebe, harte Muskelstrukturen oder tief sitzende Verhärtungen, die sich im Laufe der Jahre im Körper aufbauen. Solche Strukturen entstehen häufig durch dauerhafte körperliche Belastung, einseitige Bewegungsmuster oder anhaltenden Druck im Bewegungsapparat.', en: 'Many people feel pressure in the tissue, hard muscle structures or deep-seated hardening that builds up in the body over the years. Such structures often arise from prolonged physical strain, one-sided movement patterns or persistent pressure on the musculoskeletal system.', es: 'Muchas personas sienten con el tiempo presión en el tejido, estructuras musculares duras o endurecimientos profundos que se acumulan en el cuerpo a lo largo de los años. Estas estructuras suelen surgir de la tensión física prolongada o patrones de movimiento unilaterales.', it: 'Molte persone avvertono nel tempo pressione nel tessuto, strutture muscolari rigide o indurimenti profondi che si accumulano nel corpo nel corso degli anni. Tali strutture sorgono spesso da sforzo fisico prolungato o schemi di movimento unilaterali.', ru: 'Многие люди на протяжении длительного времени ощущают давление в тканях, жёсткие мышечные структуры или глубокие уплотнения, которые накапливаются в теле годами. Подобные структуры часто возникают из-за длительной физической нагрузки или однобоких паттернов движения.' },
    'about.more':    { de: 'Mehr über mich', en: 'More about me', es: 'Más sobre mí', it: 'Scopri di più', ru: 'Подробнее' },

    // Cert tags
    'cert.1': { de: 'Faszientherapeut &amp; Sporttherapeut', en: 'Fascia &amp; Sports Therapist', es: 'Terapeuta de fascia y deportivo', it: 'Terapista della fascia e sportivo', ru: 'Фасциальный и спортивный терапевт' },
    'cert.2': { de: 'Faszienpraktiker',   en: 'Fascia Practitioner',   es: 'Practicante de fascia',   it: 'Praticante della fascia',   ru: 'Фасциальный практик' },
    'cert.3': { de: 'Gesundheitspraktiker', en: 'Health Practitioner', es: 'Profesional de salud',    it: 'Operatore sanitario',       ru: 'Оздоровительный практик' },
    'cert.4': { de: 'Triggerpunkttherapeut', en: 'Trigger Point Therapist', es: 'Terapeuta de puntos gatillo', it: 'Terapista dei punti trigger', ru: 'Триггерный терапевт' },
    'cert.5': { de: 'Sporttherapeut',     en: 'Sports Therapist',      es: 'Terapeuta deportivo',     it: 'Terapista sportivo',        ru: 'Спортивный терапевт' },
    'cert.6': { de: 'Manuelle Techniken', en: 'Manual Techniques',     es: 'Técnicas manuales',       it: 'Tecniche manuali',          ru: 'Мануальные техники' },

    // Logo slider
    'logos.label': { de: 'Ausbildung &amp; Zertifizierungen', en: 'Training &amp; Certifications', es: 'Formación y certificaciones', it: 'Formazione e certificazioni', ru: 'Обучение и сертификаты' },

    // Pricing
    'price.eyebrow':  { de: 'Preise &amp; Leistungen', en: 'Prices &amp; Services', es: 'Precios y servicios',     it: 'Prezzi e servizi',         ru: 'Цены и услуги' },
    'price.title':    { de: 'Behandlungsoptionen',     en: 'Treatment Options',     es: 'Opciones de tratamiento', it: 'Opzioni di trattamento',   ru: 'Варианты лечения' },
    'price.sub':      { de: 'Wähle die Behandlung, die zu deinen Bedürfnissen passt. Alle Preise inkl. Nachbetreuung und Tipps.', en: 'Choose the treatment that suits your needs. All prices include follow-up care and tips.', es: 'Elige el tratamiento adecuado. Todos los precios incluyen seguimiento y consejos.', it: 'Scegli il trattamento adatto. Tutti i prezzi includono assistenza post-trattamento e consigli.', ru: 'Выберите подходящее лечение. Все цены включают последующее наблюдение и рекомендации.' },
    'price.1.name': { de: 'Schulter · Nacken · Rücken', en: 'Shoulder · Neck · Back', es: 'Hombro · Cuello · Espalda', it: 'Spalla · Collo · Schiena', ru: 'Плечо · Шея · Спина' },
    'price.1.dur':  { de: '30 Minuten gezielte Arbeit',  en: '30 minutes targeted work', es: '30 minutos de trabajo dirigido', it: '30 minuti di lavoro mirato', ru: '30 минут целенаправленной работы' },
    'price.1.f1':   { de: 'Gezielte Triggerpunktarbeit',   en: 'Targeted trigger point work',    es: 'Trabajo de puntos gatillo',       it: 'Lavoro mirato sui punti trigger',    ru: 'Работа с триггерными точками' },
    'price.1.f2':   { de: 'Schmerzlinderung im Fokusbereich', en: 'Pain relief in the focus area', es: 'Alivio del dolor en el área focal', it: 'Sollievo dal dolore nell\'area target', ru: 'Снятие боли в целевой зоне' },
    'price.1.f3':   { de: 'Beweglichkeitssteigerung',     en: 'Improved mobility',               es: 'Mejora de la movilidad',          it: 'Miglioramento della mobilità',       ru: 'Улучшение подвижности' },
    'price.1.f4':   { de: 'Nachbetreuung &amp; Tipps',    en: 'Follow-up care &amp; tips',       es: 'Seguimiento y consejos',          it: 'Assistenza e consigli',              ru: 'Последующее наблюдение' },
    'price.2.badge':{ de: 'Beliebteste Wahl',             en: 'Most Popular',                    es: 'Más popular',                     it: 'La più scelta',                      ru: 'Самый популярный' },
    'price.2.name': { de: 'Ganzkörperbehandlung',        en: 'Full Body Treatment',             es: 'Tratamiento corporal completo',   it: 'Trattamento corpo intero',           ru: 'Лечение всего тела' },
    'price.2.dur':  { de: '30–45 Min. · je nach Körperbau', en: '30–45 min · depending on physique', es: '30–45 min · según complexión', it: '30–45 min · in base alla corporatura', ru: '30–45 мин. · зависит от телосложения' },
    'price.2.f1':   { de: 'Vollständige Tiefengewebsarbeit', en: 'Complete deep tissue work',  es: 'Trabajo completo de tejido profundo', it: 'Lavoro completo sui tessuti profondi', ru: 'Полная работа с глубокими тканями' },
    'price.2.f2':   { de: 'Triggerpunkte am ganzen Körper',  en: 'Trigger points throughout the body', es: 'Puntos gatillo en todo el cuerpo', it: 'Punti trigger su tutto il corpo', ru: 'Триггерные точки по всему телу' },
    'price.2.f3':   { de: 'Muskelverhärtungen &amp; Faszien', en: 'Muscle hardening &amp; fascia', es: 'Endurecimiento muscular y fascias', it: 'Indurimenti muscolari e fasce', ru: 'Мышечные уплотнения и фасции' },
    'price.2.f4':   { de: 'Nerveneinklemmungen',          en: 'Nerve compressions',              es: 'Compresiones nerviosas',          it: 'Compressioni nervose',               ru: 'Защемления нервов' },
    'price.2.f5':   { de: 'Ziehende oder stechende Empfindungen im Körper', en: 'Pulling or stabbing sensations in the body', es: 'Sensaciones de tracción o punzadas', it: 'Sensazioni di trazione o dolore nel corpo', ru: 'Тянущие или колющие ощущения' },
    'price.2.f6':   { de: 'Nachbetreuung &amp; Heimübungen', en: 'Follow-up care &amp; home exercises', es: 'Seguimiento y ejercicios en casa', it: 'Assistenza e esercizi a casa', ru: 'Наблюдение и домашние упражнения' },
    'price.3.name': { de: 'Beinlösung',                  en: 'Leg Relief',                      es: 'Solución para piernas',           it: 'Soluzione gambe',                    ru: 'Лечение ног' },
    'price.3.dur':  { de: '30 Minuten gezielte Arbeit',  en: '30 minutes targeted work',        es: '30 minutos de trabajo dirigido',  it: '30 minuti di lavoro mirato',         ru: '30 минут целенаправленной работы' },
    'price.3.f1':   { de: 'Waden &amp; Oberschenkel',    en: 'Calves &amp; Thighs',             es: 'Gemelos y muslos',                it: 'Polpacci e cosce',                   ru: 'Икры и бёдра' },
    'price.3.f2':   { de: 'Fußsohlenschmerzen',          en: 'Sole pain',                       es: 'Dolor en la planta del pie',      it: 'Dolore alla pianta del piede',       ru: 'Боли в подошве' },
    'price.3.f3':   { de: 'Gesäß &amp; Hüfte',           en: 'Glutes &amp; Hip',                es: 'Glúteos y cadera',                it: 'Glutei e anca',                      ru: 'Ягодицы и бёдра' },
    'price.3.f4':   { de: 'Bewegungseinschränkungen',    en: 'Movement restrictions',           es: 'Restricciones de movimiento',    it: 'Limitazioni del movimento',          ru: 'Ограничения движения' },
    'price.book':   { de: 'Termin buchen',               en: 'Book Appointment',                es: 'Reservar cita',                   it: 'Prenota appuntamento',               ru: 'Записаться' },

    // Final CTA
    'cta.eyebrow':       { de: 'Bereit für echte Veränderung?',  en: 'Ready for real change?',     es: '¿Listo para un cambio real?',   it: 'Pronto per un vero cambiamento?',  ru: 'Готовы к переменам?' },
    'cta.title':         { de: 'Ich arbeite dort,<br><em>wo viele Ansätze nicht mehr weiterkommen.</em>', en: 'I work where<br><em>many approaches fall short.</em>', es: 'Trabajo donde<br><em>otros enfoques no llegan.</em>', it: 'Lavoro dove<br><em>molti approcci non arrivano.</em>', ru: 'Я работаю там,<br><em>где другие подходы не помогают.</em>' },
    'cta.book':          { de: 'Termin online buchen',           en: 'Book appointment online',     es: 'Reservar cita en línea',        it: 'Prenota appuntamento online',       ru: 'Записаться онлайн' },
    'cta.call':          { de: 'Anrufen',                        en: 'Call',                        es: 'Llamar',                        it: 'Chiama',                            ru: 'Позвонить' },
    'cta.call.hint':     { de: 'Mo–Fr während der Öffnungszeiten', en: 'Mon–Fri during opening hours', es: 'Lun–Vie en horario de apertura', it: 'Lun–Ven durante gli orari',       ru: 'Пн–Пт в часы работы' },
    'cta.email':         { de: 'E-Mail',                         en: 'E-Mail',                      es: 'Correo electrónico',            it: 'E-mail',                            ru: 'Эл. почта' },
    'cta.email.hint':    { de: 'Antwort meist innerhalb 24 h',   en: 'Reply usually within 24 h',   es: 'Respuesta en menos de 24 h',    it: 'Risposta di solito entro 24 h',     ru: 'Ответ обычно в течение 24 ч' },
    'cta.location':      { de: 'Praxis',                         en: 'Practice',                    es: 'Clínica',                       it: 'Studio',                            ru: 'Кабинет' },
    'cta.location.hint': { de: 'Route in Google Maps öffnen →',  en: 'Open route in Google Maps →', es: 'Abrir ruta en Google Maps →',   it: 'Apri percorso in Google Maps →',    ru: 'Маршрут в Google Maps →' }
  };

  // ── Hours: multilingual schedule status ───────────────────
  var SCHEDULE = {
    1: [[8,0,11,0],[15,0,18,0]],
    2: [[8,0,11,0],[15,0,18,0]],
    3: [[9,0,13,0]],
    4: [[15,0,19,0]],
    5: [[9,0,13,0]]
  };
  var DAY_NAMES = {
    de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    es: ['dom','lun','mar','mié','jue','vie','sáb'],
    it: ['dom','lun','mar','mer','gio','ven','sab'],
    ru: ['вс','пн','вт','ср','чт','пт','сб']
  };
  var OPEN_TPL  = { de: 'Jetzt geöffnet <strong>bis {t} Uhr</strong>', en: 'Open now <strong>until {t}</strong>', es: 'Abierto <strong>hasta las {t}</strong>', it: 'Aperto <strong>fino alle {t}</strong>', ru: 'Открыто <strong>до {t}</strong>' };
  var CLOSE_TPL = { de: 'Geschlossen — öffnet {when} um <strong>{t} Uhr</strong>', en: 'Closed — opens {when} at <strong>{t}</strong>', es: 'Cerrado — abre {when} a las <strong>{t}</strong>', it: 'Chiuso — apre {when} alle <strong>{t}</strong>', ru: 'Закрыто — откроется {when} в <strong>{t}</strong>' };
  var TODAY_LBL    = { de: 'heute',   en: 'today',    es: 'hoy',    it: 'oggi',   ru: 'сегодня' };
  var TOMORROW_LBL = { de: 'morgen',  en: 'tomorrow', es: 'mañana', it: 'domani', ru: 'завтра' };

  function fmt(h, m) { return h + ':' + (m < 10 ? '0' + m : m); }

  function nextOpening(now) {
    for (var i = 0; i < 7; i++) {
      var d = new Date(now);
      d.setDate(d.getDate() + i);
      var slots = SCHEDULE[d.getDay()];
      if (!slots) continue;
      for (var j = 0; j < slots.length; j++) {
        var s = slots[j];
        var t2 = new Date(d);
        t2.setHours(s[0], s[1], 0, 0);
        if (t2 > now) return { day: d.getDay(), hh: s[0], mm: s[1], today: i === 0, tomorrow: i === 1 };
      }
    }
    return null;
  }

  function updateHoursStatus() {
    var statusEl = document.getElementById('hours-status');
    if (!statusEl) return;
    var textEl = statusEl.querySelector('.hours-status-text');
    if (!textEl) return;

    var now = new Date();
    var slots = SCHEDULE[now.getDay()];
    var isOpen = false;
    var closesAt = null;

    if (slots) {
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        var openT = new Date(now); openT.setHours(s[0], s[1], 0, 0);
        var closeT = new Date(now); closeT.setHours(s[2], s[3], 0, 0);
        if (now >= openT && now < closeT) { isOpen = true; closesAt = { hh: s[2], mm: s[3] }; break; }
      }
    }

    statusEl.setAttribute('data-open', isOpen ? 'true' : 'false');

    if (isOpen) {
      textEl.innerHTML = (OPEN_TPL[lang] || OPEN_TPL.de).replace('{t}', fmt(closesAt.hh, closesAt.mm));
    } else {
      var next = nextOpening(now);
      if (next) {
        var days = DAY_NAMES[lang] || DAY_NAMES.de;
        var when = next.today ? (TODAY_LBL[lang] || TODAY_LBL.de)
          : next.tomorrow ? (TOMORROW_LBL[lang] || TOMORROW_LBL.de)
          : days[next.day];
        textEl.innerHTML = (CLOSE_TPL[lang] || CLOSE_TPL.de)
          .replace('{when}', when)
          .replace('{t}', fmt(next.hh, next.mm));
      } else {
        textEl.textContent = T['hours.label'][lang] || 'Öffnungszeiten';
      }
    }
  }

  // Expose so components.js can delegate to us
  window.fpLang = { updateHours: updateHoursStatus };

  // ── State ─────────────────────────────────────────────────
  var lang = localStorage.getItem(STORE_KEY) || DEFAULT;
  if (!T['nav.leistungen'][lang]) lang = DEFAULT;

  // ── Apply translations ────────────────────────────────────
  function applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = T[key] && (T[key][lang] || T[key][DEFAULT]);
      if (val == null) return;
      el.innerHTML = val;
    });
    updateHoursStatus();
    updateTrigger();
    // Update html lang attribute
    document.documentElement.lang = lang;
  }

  function setLang(code) {
    lang = code;
    localStorage.setItem(STORE_KEY, code);
    applyAll();
  }

  // ── Widget CSS ────────────────────────────────────────────
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = [
      '.lang-sw{position:fixed;bottom:24px;left:24px;z-index:950;font-family:"DM Sans",system-ui,sans-serif}',
      '.lang-sw-trigger{display:flex;align-items:center;gap:8px;background:#0a2540;color:#f5faff;border:1px solid rgba(255,255,255,.14);padding:10px 16px;border-radius:2px;cursor:pointer;font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;transition:border-color .2s,background .2s;line-height:1}',
      '.lang-sw-trigger:hover{border-color:rgba(255,255,255,.35);background:#0d2e52}',
      '.lang-sw-trigger:focus-visible{outline:2px solid #0496ff;outline-offset:2px}',
      '.lang-sw-chevron{transition:transform .2s ease;opacity:.55}',
      '.lang-sw.open .lang-sw-chevron{transform:rotate(180deg)}',
      '.lang-sw-menu{position:absolute;bottom:calc(100% + 8px);left:0;min-width:158px;background:#0a2540;border:1px solid rgba(255,255,255,.14);border-radius:2px;list-style:none;margin:0;padding:5px 0;display:none;box-shadow:0 10px 32px rgba(10,37,64,.45)}',
      '.lang-sw.open .lang-sw-menu{display:block}',
      '.lang-sw-menu li{margin:0;padding:0}',
      '.lang-sw-opt{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px 16px;background:none;border:none;color:rgba(245,250,255,.6);font-family:inherit;font-size:12px;font-weight:400;letter-spacing:.04em;cursor:pointer;text-align:left;transition:color .15s,background .15s;line-height:1}',
      '.lang-sw-opt:hover{color:#f5faff;background:rgba(255,255,255,.06)}',
      '.lang-sw-opt.active{color:#0496ff;font-weight:500}',
      '.lang-sw-opt:focus-visible{outline:2px solid #0496ff;outline-offset:-2px}',
      '.lang-sw-check{opacity:0;color:#0496ff;flex-shrink:0}',
      '.lang-sw-opt.active .lang-sw-check{opacity:1}',
      '@media(max-width:640px){.lang-sw{bottom:88px}}'
    ].join('');
    document.head.appendChild(s);
  }

  // ── Widget HTML ───────────────────────────────────────────
  function createWidget() {
    injectStyles();

    var wrap = document.createElement('div');
    wrap.id = 'lang-switcher';
    wrap.className = 'lang-sw';
    wrap.setAttribute('role', 'navigation');
    wrap.setAttribute('aria-label', 'Language selection');

    var menu = document.createElement('ul');
    menu.className = 'lang-sw-menu';
    menu.setAttribute('role', 'listbox');

    LANGS.forEach(function (l) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.className = 'lang-sw-opt' + (l.code === lang ? ' active' : '');
      btn.setAttribute('data-lang-opt', l.code);
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', l.code === lang ? 'true' : 'false');
      btn.innerHTML = l.name +
        '<svg class="lang-sw-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
      btn.addEventListener('click', function () {
        setLang(l.code);
        close();
      });
      li.appendChild(btn);
      menu.appendChild(li);
    });

    var trigger = document.createElement('button');
    trigger.className = 'lang-sw-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
      '<span class="lang-sw-code"></span>' +
      '<svg class="lang-sw-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';

    wrap.appendChild(menu);
    wrap.appendChild(trigger);
    document.body.appendChild(wrap);

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = wrap.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    function close() {
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  function updateTrigger() {
    var codeEl = document.querySelector('.lang-sw-code');
    if (codeEl) {
      var current = LANGS.filter(function (l) { return l.code === lang; })[0];
      if (current) codeEl.textContent = current.label;
    }
    document.querySelectorAll('[data-lang-opt]').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-opt') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
  }

  // ── Nav translation (loaded async) ────────────────────────
  function watchNav() {
    if (!('MutationObserver' in window)) return;
    var obs = new MutationObserver(function () {
      if (document.querySelector('nav')) {
        applyAll();
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ── Boot ─────────────────────────────────────────────────
  function init() {
    createWidget();
    applyAll();
    watchNav();
    // Keep hours in sync after components.js interval fires
    setInterval(updateHoursStatus, 61000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

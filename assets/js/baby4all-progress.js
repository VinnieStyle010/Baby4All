/* =========================================================
   BABY4ALL PROGRESS SYSTEM
   Centrale opslag voor voortgang, sterren, leren,
   avonturen, ontdekkingen, ei en vriendjes.
========================================================= */

(function () {

  "use strict";


  /* =====================================================
     INSTELLINGEN
  ===================================================== */

  const STORAGE_KEY = "baby4all-progress";

  const TASK_COOLDOWN =
    60 * 60 * 1000; // 1 uur


  /* =====================================================
     STANDAARD PROFIEL
  ===================================================== */

  function defaultProgress() {

    return {

      version: 1,

      /* ---------------------------------
         STERREN
      --------------------------------- */

      stars: {

        /*
          Sterren die uitgegeven kunnen worden.
        */

        spendable: 0,


        /*
          Alle sterren die ooit verdiend zijn.

          Deze waarde daalt NOOIT wanneer
          een kind iets koopt.
        */

        totalEarned: 0

      },


      /* ---------------------------------
         LEREN
      --------------------------------- */

      learning: {

        language: {
          stars: 0,
          completed: 0
        },

        reading: {
          stars: 0,
          completed: 0
        },

        spelling: {
          stars: 0,
          completed: 0
        },

        math: {
          stars: 0,
          completed: 0
        },

        logic: {
          stars: 0,
          completed: 0
        },

        nature: {
          stars: 0,
          completed: 0
        },

        biology: {
          stars: 0,
          completed: 0
        },

        geography: {
          stars: 0,
          completed: 0
        },

        history: {
          stars: 0,
          completed: 0
        },

        science: {
          stars: 0,
          completed: 0
        },

        technology: {
          stars: 0,
          completed: 0
        },

        creativity: {
          stars: 0,
          completed: 0
        },

        music: {
          stars: 0,
          completed: 0
        },

        movement: {
          stars: 0,
          completed: 0
        }

      },


      /* ---------------------------------
         AVONTUREN
      --------------------------------- */

      adventures: {

        "hoofdstuk-1": {

          started: false,

          completed: false,

          currentPart: 1,

          completedParts: [],

          clues: []

        }

      },


      /* ---------------------------------
         MYSTERIEUZE EI
      --------------------------------- */

      egg: {

        /*
          Het ei bestaat al in het verhaal,
          maar het kind heeft het nog
          niet noodzakelijk gevonden.
        */

        discovered: false,

        owned: false,

        hatched: false,


        /*
          Ontwikkelingsfase:

          0 = onbekend
          1 = gevonden
          2 = reageert
          3 = begint te veranderen
          4 = beweegt / gloeit
          5 = barstjes
          6 = klaar voor uitbroedavontuur
          7 = uitgekomen
        */

        stage: 0,


        /*
          Bijzondere momenten die het kind
          met het ei heeft meegemaakt.
        */

        moments: [],


        /*
          Eigenschappen worden later tijdens
          avonturen opgebouwd.
        */

        traits: {

          baseType: null,

          primaryColor: null,

          secondaryColor: null,

          ears: null,

          wings: null,

          tail: null,

          pattern: null,

          bodyCovering: null,

          eyes: null,

          nose: null,

          feet: null,

          horns: null,

          antennae: null,

          mane: null,

          teeth: null

        }

      },


      /* ---------------------------------
         VRIENDJES
      --------------------------------- */

      companions: [],


      /* ---------------------------------
         ONTDEKKINGEN
      --------------------------------- */

      discoveries: {

        eggs: [],

        characters: [],

        vehicles: [],

        clothing: [],

        places: [],

        objects: []

      },


      /* ---------------------------------
         INVENTARIS
      --------------------------------- */

      inventory: {

        clothing: [],

        vehicles: [],

        objects: [],

        roomItems: []

      },


      /* ---------------------------------
         TALENTEN AVATAR
      --------------------------------- */

      talents: {

        language: 0,

        math: 0,

        logic: 0,

        creativity: 0,

        nature: 0,

        technology: 0,

        music: 0,

        movement: 0,

        caring: 0

      },


      /* ---------------------------------
         OPDRACHTGESCHIEDENIS
      --------------------------------- */

      tasks: {}

    };

  }


  /* =====================================================
     OBJECTEN SAMENVOEGEN

     Hierdoor blijven nieuwe onderdelen later
     beschikbaar voor oudere opgeslagen profielen.
  ===================================================== */

  function mergeDeep(defaults, saved) {

    if (
      typeof defaults !== "object" ||
      defaults === null
    ) {
      return saved === undefined
        ? defaults
        : saved;
    }


    if (Array.isArray(defaults)) {

      return Array.isArray(saved)
        ? saved
        : [...defaults];

    }


    const result = {
      ...defaults
    };


    if (
      typeof saved !== "object" ||
      saved === null ||
      Array.isArray(saved)
    ) {
      return result;
    }


    Object.keys(saved).forEach(key => {

      if (
        key in defaults &&
        typeof defaults[key] === "object" &&
        defaults[key] !== null &&
        !Array.isArray(defaults[key])
      ) {

        result[key] =
          mergeDeep(
            defaults[key],
            saved[key]
          );

      }

      else {

        result[key] =
          saved[key];

      }

    });


    return result;

  }


  /* =====================================================
     LADEN
  ===================================================== */

  function load() {

    let saved = null;


    try {

      saved =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          )
        );

    }

    catch (error) {

      console.warn(
        "Baby4All voortgang kon niet worden geladen.",
        error
      );

    }


    return mergeDeep(
      defaultProgress(),
      saved
    );

  }


  /* =====================================================
     OPSLAAN
  ===================================================== */

  function save(progress) {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progress)
    );


    /*
      Tijdelijk houden we ook de oude
      sterrensleutels bijgewerkt.

      Daardoor blijven de pagina's die
      we al gemaakt hebben gewoon werken.
    */

    localStorage.setItem(
      "baby4all-stars",
      progress.stars.spendable
    );


    localStorage.setItem(
      "baby4all-total-stars",
      progress.stars.totalEarned
    );


    return progress;

  }


  /* =====================================================
     OUDE STERREN IMPORTEREN

     We hebben in de eerste pagina's al
     sterren opgeslagen voordat deze
     centrale motor bestond.

     Die raken we dus NIET kwijt.
  ===================================================== */

  function migrateOldStars() {

    const progress = load();


    const oldSpendable =
      Number(
        localStorage.getItem(
          "baby4all-stars"
        )
      ) || 0;


    const oldTotal =
      Number(
        localStorage.getItem(
          "baby4all-total-stars"
        )
      ) || 0;


    if (
      oldSpendable >
      progress.stars.spendable
    ) {

      progress.stars.spendable =
        oldSpendable;

    }


    if (
      oldTotal >
      progress.stars.totalEarned
    ) {

      progress.stars.totalEarned =
        oldTotal;

    }


    save(progress);

  }


  /* =====================================================
     STERREN VERDIENEN
  ===================================================== */

  function earnStars(
    amount,
    subject = null
  ) {

    amount = Number(amount);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      return load();

    }


    const progress = load();


    progress.stars.spendable +=
      amount;


    progress.stars.totalEarned +=
      amount;


    /*
      Als de opdracht bij een leergebied hoort,
      houden we dat apart bij.
    */

    if (
      subject &&
      progress.learning[subject]
    ) {

      progress.learning[subject].stars +=
        amount;


      progress.learning[subject].completed +=
        1;

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     STERREN UITGEVEN
  ===================================================== */

  function spendStars(amount) {

    amount = Number(amount);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      return {
        success: false,
        reason: "invalid"
      };

    }


    const progress = load();


    if (
      progress.stars.spendable <
      amount
    ) {

      return {

        success: false,

        reason:
          "not-enough-stars",

        balance:
          progress.stars.spendable

      };

    }


    progress.stars.spendable -=
      amount;


    /*
      totalEarned wordt hier bewust
      NIET verlaagd.
    */


    save(progress);


    return {

      success: true,

      balance:
        progress.stars.spendable,

      totalEarned:
        progress.stars.totalEarned

    };

  }


  /* =====================================================
     KAN IETS WORDEN ONTGRENDELD?
  ===================================================== */

  function hasTotalStars(amount) {

    const progress = load();

    return (
      progress.stars.totalEarned >=
      Number(amount)
    );

  }


  /* =====================================================
     LEERGEBIED CONTROLEREN
  ===================================================== */

  function hasLearningProgress(
    subject,
    minimumStars = 0,
    minimumCompleted = 0
  ) {

    const progress = load();

    const data =
      progress.learning[subject];


    if (!data) {
      return false;
    }


    return (

      data.stars >= minimumStars &&

      data.completed >=
      minimumCompleted

    );

  }


  /* =====================================================
     GROTE ONTGRENDELVOORWAARDE

     Hiermee kunnen we straks bijvoorbeeld
     zeggen:

     1000 totaalsterren
     + taal
     + rekenen
     + natuur
     + logica
  ===================================================== */

  function checkRequirements(
    requirements
  ) {

    const progress = load();

    const missing = [];


    if (
      requirements.totalStars &&
      progress.stars.totalEarned <
      requirements.totalStars
    ) {

      missing.push({

        type: "stars",

        current:
          progress.stars.totalEarned,

        required:
          requirements.totalStars

      });

    }


    if (requirements.subjects) {

      Object.entries(
        requirements.subjects
      )
      .forEach(
        ([subject, requirement]) => {

          const data =
            progress.learning[subject];


          if (!data) {

            missing.push({
              type: "subject",
              subject: subject
            });

            return;

          }


          const neededStars =
            requirement.stars || 0;


          const neededCompleted =
            requirement.completed || 0;


          if (
            data.stars < neededStars ||
            data.completed <
            neededCompleted
          ) {

            missing.push({

              type: "subject",

              subject: subject,

              stars:
                data.stars,

              requiredStars:
                neededStars,

              completed:
                data.completed,

              requiredCompleted:
                neededCompleted

            });

          }

        }
      );

    }


    return {

      unlocked:
        missing.length === 0,

      missing:
        missing

    };

  }


  /* =====================================================
     AVONTUUR STARTEN
  ===================================================== */

  function startAdventure(
    adventureId
  ) {

    const progress = load();


    if (
      !progress.adventures[
        adventureId
      ]
    ) {

      progress.adventures[
        adventureId
      ] = {

        started: true,

        completed: false,

        currentPart: 1,

        completedParts: [],

        clues: []

      };

    }

    else {

      progress.adventures[
        adventureId
      ].started = true;

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     DEEL VOLTOOIEN
  ===================================================== */

  function completeAdventurePart(
    adventureId,
    part
  ) {

    const progress = load();


    if (
      !progress.adventures[
        adventureId
      ]
    ) {

      startAdventure(
        adventureId
      );

      return completeAdventurePart(
        adventureId,
        part
      );

    }


    const adventure =
      progress.adventures[
        adventureId
      ];


    if (
      !adventure.completedParts
      .includes(part)
    ) {

      adventure.completedParts
      .push(part);

    }


    adventure.currentPart =
      Math.max(
        adventure.currentPart,
        Number(part) + 1
      );


    save(progress);

    return progress;

  }


  /* =====================================================
     AANWIJZING ONTDEKKEN
  ===================================================== */

  function discoverClue(
    adventureId,
    clueId
  ) {

    const progress = load();


    if (
      !progress.adventures[
        adventureId
      ]
    ) {

      progress.adventures[
        adventureId
      ] = {

        started: true,

        completed: false,

        currentPart: 1,

        completedParts: [],

        clues: []

      };

    }


    const clues =
      progress.adventures[
        adventureId
      ].clues;


    if (
      !clues.includes(clueId)
    ) {

      clues.push(clueId);

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     PERSONAGE ONTDEKKEN
  ===================================================== */

  function discoverCharacter(
    characterId
  ) {

    const progress = load();

    const list =
      progress.discoveries
      .characters;


    if (
      !list.includes(characterId)
    ) {

      list.push(characterId);

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     VOORWERP ONTDEKKEN
  ===================================================== */

  function discoverItem(
    category,
    itemId
  ) {

    const progress = load();


    if (
      !progress.discoveries[
        category
      ]
    ) {

      return progress;

    }


    const list =
      progress.discoveries[
        category
      ];


    if (
      !list.includes(itemId)
    ) {

      list.push(itemId);

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     EI ONTDEKKEN
  ===================================================== */

  function discoverEgg() {

    const progress = load();


    progress.egg.discovered =
      true;


    if (
      progress.egg.stage < 1
    ) {

      progress.egg.stage = 1;

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     EI WORDT VAN HET KIND
  ===================================================== */

  function obtainEgg() {

    const progress = load();


    progress.egg.discovered =
      true;

    progress.egg.owned =
      true;


    if (
      progress.egg.stage < 1
    ) {

      progress.egg.stage = 1;

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     BIJZONDER EI-MOMENT
  ===================================================== */

  function addEggMoment(
    momentId
  ) {

    const progress = load();


    if (
      !progress.egg.moments
      .includes(momentId)
    ) {

      progress.egg.moments
      .push(momentId);

    }


    /*
      Voor het eerste ei gebruiken we
      maximaal zes belangrijke momenten
      voordat het uitbroedavontuur
      beschikbaar komt.
    */

    const moments =
      progress.egg.moments.length;


    if (
      progress.egg.discovered
    ) {

      if (moments >= 1)
        progress.egg.stage =
          Math.max(
            progress.egg.stage,
            2
          );


      if (moments >= 2)
        progress.egg.stage =
          Math.max(
            progress.egg.stage,
            3
          );


      if (moments >= 3)
        progress.egg.stage =
          Math.max(
            progress.egg.stage,
            4
          );


      if (moments >= 4)
        progress.egg.stage =
          Math.max(
            progress.egg.stage,
            5
          );


      if (moments >= 5)
        progress.egg.stage =
          Math.max(
            progress.egg.stage,
            6
          );

    }


    save(progress);

    return progress;

  }


  /* =====================================================
     EI-EIGENSCHAP TOEVOEGEN

     Bijvoorbeeld:

     setEggTrait(
       "wings",
       "small"
     );
  ===================================================== */

  function setEggTrait(
    trait,
    value
  ) {

    const progress = load();


    if (
      !(trait in progress.egg.traits)
    ) {

      return progress;

    }


    progress.egg.traits[
      trait
    ] = value;


    save(progress);

    return progress;

  }


  /* =====================================================
     EI UIT LATEN KOMEN
  ===================================================== */

  function hatchEgg(
    companion
  ) {

    const progress = load();


    if (
      progress.egg.stage < 6
    ) {

      return {

        success: false,

        reason:
          "egg-not-ready"

      };

    }


    progress.egg.hatched =
      true;

    progress.egg.stage =
      7;


    if (companion) {

      progress.companions
      .push(companion);

    }


    save(progress);


    return {

      success: true,

      progress: progress

    };

  }


  /* =====================================================
     OPDRACHT COOLDOWN

     Een afgeronde opdracht kan na ongeveer
     één uur opnieuw sterren opleveren.
  ===================================================== */

  function taskStatus(
    taskId
  ) {

    const progress = load();

    const task =
      progress.tasks[
        taskId
      ];


    if (!task) {

      return {

        available: true,

        remaining: 0

      };

    }


    const elapsed =
      Date.now() -
      task.lastReward;


    const remaining =
      Math.max(
        0,
        TASK_COOLDOWN -
        elapsed
      );


    return {

      available:
        remaining === 0,

      remaining:
        remaining,

      lastReward:
        task.lastReward,

      timesCompleted:
        task.timesCompleted || 0

    };

  }


  /* =====================================================
     OPDRACHT AFRONDEN + BELONING

     Dit wordt straks de belangrijkste
     functie voor leeropdrachten.
  ===================================================== */

  function completeTask(
    taskId,
    options = {}
  ) {

    const status =
      taskStatus(taskId);


    if (!status.available) {

      return {

        success: false,

        rewarded: false,

        reason:
          "cooldown",

        remaining:
          status.remaining

      };

    }


    const reward =
      Number(
        options.stars || 0
      );


    const subject =
      options.subject || null;


    let progress =
      earnStars(
        reward,
        subject
      );


    if (
      !progress.tasks[
        taskId
      ]
    ) {

      progress.tasks[
        taskId
      ] = {

        timesCompleted: 0,

        lastReward: 0

      };

    }


    progress.tasks[
      taskId
    ].timesCompleted += 1;


    progress.tasks[
      taskId
    ].lastReward =
      Date.now();


    save(progress);


    return {

      success: true,

      rewarded: true,

      stars: reward,

      subject: subject,

      balance:
        progress.stars.spendable,

      totalEarned:
        progress.stars.totalEarned

    };

  }


  /* =====================================================
     COOLDOWN LEESBAAR MAKEN
  ===================================================== */

  function formatCooldown(
    milliseconds
  ) {

    const minutes =
      Math.ceil(
        milliseconds /
        60000
      );


    if (minutes <= 0) {
      return "nu";
    }


    if (minutes === 1) {
      return "ongeveer 1 minuut";
    }


    if (minutes < 60) {

      return (
        "ongeveer " +
        minutes +
        " minuten"
      );

    }


    return "ongeveer 1 uur";

  }


  /* =====================================================
     RESET

     Alleen voor ontwikkeling/testen.
     Nog GEEN knop voor kinderen maken.
  ===================================================== */

  function resetAllProgress() {

    localStorage.removeItem(
      STORAGE_KEY
    );

    localStorage.removeItem(
      "baby4all-stars"
    );

    localStorage.removeItem(
      "baby4all-total-stars"
    );

    return load();

  }


  /* =====================================================
     EERSTE MIGRATIE
  ===================================================== */

  migrateOldStars();


  /* =====================================================
     PUBLIEKE BABY4ALL API

     Andere pagina's kunnen straks simpel:

     Baby4AllProgress.earnStars(...)
     Baby4AllProgress.completeTask(...)
     Baby4AllProgress.discoverEgg(...)
     enz.
  ===================================================== */

  window.Baby4AllProgress = {

    load,

    save,

    earnStars,

    spendStars,

    hasTotalStars,

    hasLearningProgress,

    checkRequirements,

    startAdventure,

    completeAdventurePart,

    discoverClue,

    discoverCharacter,

    discoverItem,

    discoverEgg,

    obtainEgg,

    addEggMoment,

    setEggTrait,

    hatchEgg,

    taskStatus,

    completeTask,

    formatCooldown,

    resetAllProgress

  };


})();

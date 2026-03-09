export const deck = {
  title: "Evaluación de implementación PIGND (2018–2025)",
  meta: {
    ratio: "16:9",
    framework: "UIkit",
    language: "es-CL",
    theme: {
      // Tokens; el render define cómo se ven.
      accents: {
        accentA: "genderPurple",
        accentB: "teal",
        accentC: "magenta",
        accentD: "neutral"
      },
      motifs: ["quad", "tiers", "thin-line-icons", "high-whitespace", "subtle-grid", "gender-signals"]
    }
  },

  slides: [
    // 01
    {
      id: "cover",
      kicker: "PIGND",
      title: "Evaluación de implementación (2018–2025)",
      subtitle: "Avances, brechas y recomendaciones estratégicas.",
      layout: "cover",
      badges: ["GÉNERO", "JUSTICIA", "EVALUACIÓN", "PODER JUDICIAL", "CHILE"],
      visual: { type: "motif", name: "quadNode" }
    },

    // 02
    {
      id: "agenda",
      kicker: "Contenido",
      title: "Agenda",
      layout: "list",
      bullets: [
        "Política (fin, propósito, ejes)",
        "Metodología",
        "Contexto",
        "Hallazgos por eje",
        "Conclusiones",
        "Recomendaciones",
        "Cierre"
      ]
    },

    // 03
    {
      id: "policy-fin-prop",
      kicker: "Recordando la PIGND",
      title: "Fin y propósito",
      layout: "twoCards",
      cards: [
        {
          title: "Fin",
          body:
            "Garantizar la igualdad de género y la no discriminación en todo el quehacer del Poder Judicial."
        },
        {
          title: "Propósito",
          body:
            "Incorporar igualdad/no discriminación en la atención usuaria y la labor jurisdiccional para asegurar acceso efectivo a la justicia y relaciones igualitarias internas."
        }
      ],
      visual: { type: "iconPair", left: "gavelEqual", right: "usersJustice" }
    },

    // 04
    {
      id: "policy-axes",
      kicker: "Recordando la PIGND",
      title: "Ejes estratégicos (4)",
      layout: "quadrants",
      cards: [
        { title: "Eje 1", body: "No discriminación", accent: "accentA" },
        { title: "Eje 2", body: "Enfoque de género en acceso a la justicia", accent: "accentB" },
        { title: "Eje 3", body: "No violencia de género", accent: "accentC" },
        {
          title: "Eje 4",
          body: "Capacitación (transversal: difusión, contenidos, comunicación)",
          accent: "accentD"
        }
      ],
      note: "Visual dominante: cuadrantes de la Política."
    },

    // 05
    {
      id: "method-what",
      kicker: "Metodología",
      title: "Qué se evaluó",
      layout: "list",
      bullets: [
        "Objetivo: evaluar avances por ejes/dimensiones; identificar logros, desafíos y recomendaciones.",
        "Período evaluado: 2018–2025 (7 años de implementación).",
        "Tipo: evaluación de implementación (ex-dure) centrada en resultados intermedios."
      ],
      visual: { type: "target", labels: ["avance", "brechas", "recomendaciones"] }
    },

    // 06
    {
      id: "method-who",
      kicker: "Metodología",
      title: "Financia / ejecuta",
      layout: "twoCards",
      cards: [
        {
          title: "Financia",
          body: "Banco Interamericano de Desarrollo (BID).",
          media: [{ type: "logo", key: "bid" }]
        },
        {
          title: "Ejecuta",
          body:
            "Núcleo Interdisciplinario de Investigación Evaluativa · Facultad de Ciencias Sociales · Universidad de Chile.",
          media: [
            { type: "logo", key: "nucleoEvaluativo" },
            { type: "logo", key: "facsoUChile" }
          ]
        }
      ],
      note: "Slide útil para atribución institucional; sin texto denso."
    },

    // 07
    {
      id: "method-frames",
      kicker: "Metodología",
      title: "Marcos interpretativos y criterio causal",
      layout: "threePillars",
      cards: [
        { title: "Teorías de género", body: "Barreras y persistencias; sesgos y trayectorias." },
        { title: "Enfoque de DDHH", body: "Igualdad sustantiva; garantías; acceso efectivo." },
        { title: "Causalidad", body: "Contribución (no atribución lineal) en sistemas complejos." }
      ],
      visual: { type: "pillars", style: "thin" }
    },

    // 08
    {
      id: "method-evidence",
      kicker: "Metodología",
      title: "Cómo se levantó evidencia",
      layout: "pipeline",
      steps: [
        "Revisión documental",
        "Cualitativo: 10 grupos focales + 6 entrevistas",
        "Encuesta censal: universo 13.422 · respuestas 3.298 · 24,6%",
        "Análisis de sentencias (muestra no representativa)",
        "Buenas prácticas comparadas"
      ],
      visual: { type: "flow", direction: "horizontal" }
    },

    // 09
    {
      id: "reach-model",
      kicker: "Modelo de lectura",
      title: "Mapa de alcances",
      layout: "tiers",
      tiers: [
        { title: "CONTROL", body: "Insumos · actividades · productos" },
        { title: "INFLUENCIA", body: "Cambios en prácticas y comportamientos" },
        { title: "INTERÉS", body: "Cultura · poder · acceso efectivo a la justicia" }
      ],
      note: "Visual dominante: 3 niveles o 3 anillos."
    },

    // 10
    {
      id: "context-external",
      kicker: "Análisis de contexto",
      title: "Contexto externo",
      layout: "list",
      bullets: [
        "Impulso normativo: Ley 21.643 (Ley Karin) y Ley 21.675 (Ley integral) aumentan exigencias al sistema de justicia.",
        "Transformaciones sociales (casos mediáticos de acoso; mayo feminista) incrementan expectativas y escrutinio público.",
        "Coordinación interinstitucional: participación en instancias internacionales y nacionales."
      ],
      visual: { type: "iconList", icons: ["law", "publicEye", "network"] }
    },

    // 11
    {
      id: "context-internal",
      kicker: "Análisis de contexto",
      title: "Contexto interno",
      layout: "list",
      bullets: [
        "STIGND (AD 566-2016) opera como motor del cambio y “control social” interno al instalar agenda y herramientas.",
        "Coexisten cambios formales con resistencias culturales persistentes (antigüedad y territorio)."
      ],
      visual: { type: "iconList", icons: ["gear", "shield", "terrain"] }
    },

    // 12
    {
      id: "eje1-scaffold",
      kicker: "Hallazgos por eje",
      title: "Eje 1 — No discriminación (andamiaje formal)",
      layout: "list",
      bullets: [
        "Institucionalización: STIGND, comités de género en 17 Cortes de Apelaciones (2020) y Consejo Consultivo.",
        "Campaña comunicacional PIGND; estudio de acceso a justicia de personas LBTI+; meta de eficiencia institucional.",
        "Conciliación/corresponsabilidad: campaña de buen trato (2022) y estudios de maternidad/paternidad.",
        "Reclutamiento/selección: estudios de movilidad/ascenso (2019–2021) y recomendaciones sobre paridad (Acta 207-2022)."
      ],
      visual: { type: "stackCards", count: 4 }
    },

    // 13
    {
      id: "eje1-kpis",
      kicker: "Hallazgos por eje",
      title: "Eje 1 — Señales y métricas (2015→2025)",
      layout: "dashboard",
      kpis: [
        { label: "Visibilidad PIGND", value: "93%", note: "Conoce existencia (solo 7% no conoce)" },
        { label: "Cultura “machista”", value: "50,5%→48,6%", note: "Acuerdo 2015→2025 (−1,9 pp)" },
        { label: "Trato discriminatorio", value: "45,9%→36,3%", note: "Observó/experimentó (−9,6 pp)" }
      ],
      bullets: [
        "En 2025, motivo principal reportado: cargo o nivel jerárquico (44,7%).",
        "Lectura cualitativa: disminuye lo explícito; persiste machismo solapado."
      ],
      visual: { type: "deltaCards", arrows: true }
    },

    // 14
    {
      id: "eje1-career",
      kicker: "Hallazgos por eje",
      title: "Eje 1 — Ascensos y sesgos percibidos (encuesta 2025)",
      layout: "list",
      bullets: [
        "62% está de acuerdo: concursos para ascender son públicos, abiertos y transparentes (2015: 38,8%).",
        "53% está en desacuerdo: existen políticas para promover ascenso de mujeres (28,7% de acuerdo).",
        "70,3% está en desacuerdo: quienes tienen más posibilidades de ascender son mujeres."
      ],
      visual: { type: "bars", mode: "singleSlide", emphasis: "gaps" }
    },

    // 15
    {
      id: "eje2-products",
      kicker: "Hallazgos por eje",
      title: "Eje 2 — Productos instalados",
      layout: "tiles6",
      tiles: [
        "Manual de lenguaje inclusivo",
        "Cuaderno de buenas prácticas",
        "Concurso de sentencias (4 al 2025)",
        "Repositorio de sentencias",
        "Revista Justicia con perspectiva de género",
        "Podcast Justicia con perspectiva de género"
      ],
      visual: { type: "tileGrid", cols: 3 }
    },

    // 16
    {
      id: "manual-kpis",
      kicker: "Eje 2",
      title: "Manual de lenguaje inclusivo — lectura rápida",
      layout: "dashboard",
      kpis: [
        { label: "Conocimiento", value: "34%", note: "Declara conocer el manual" },
        { label: "Valoración alta", value: "76,5%", note: "Notas 5–7 (quienes lo conocen)" },
        { label: "Valoración baja", value: "11,2%", note: "Notas 1–3 (quienes lo conocen)" }
      ],
      bullets: [
        "Brecha por sexo/género: mujeres 80,1% (5–7) · hombres 71% (5–7) · no binarias 63,7% (6–7).",
        "Reticencias (evaluación negativa): 44% incomodidad/confusión · 44% baja difusión.",
        "Idea-fuerza: aprobación alta, alcance bajo."
      ],
      visual: { type: "kpiBars", highlight: "awarenessGap" }
    },

    // 17
    {
      id: "manual-context",
      kicker: "Eje 2",
      title: "Manual — fricción reportada (cualitativo)",
      layout: "quote",
      quote:
        "“...bastante reacio... lo de los pronombres, a mí me supera... en la sentencia... lo ocupo poco”",
      chips: ["Confusión", "Baja difusión", "Uso limitado en sentencia"],
      visual: { type: "quoteCard", icon: "speech" }
    },

    // 18
    {
      id: "cuaderno-kpis",
      kicker: "Eje 2",
      title: "Cuaderno de buenas prácticas — uso y valoración",
      layout: "stacked",
      kpiTop: "Conocimiento (escalafón primario): 76,4%",
      segments: [
        { label: "8,3% uso frecuente", value: 8.3, cls: "segA" },
        { label: "35,3% algunas veces", value: 35.3, cls: "segB" },
        { label: "32,8% lo conoce pero no lo usa", value: 32.8, cls: "segC" },
        { label: "23,5% no lo conoce", value: 23.5, cls: "segD" }
      ],
      kpiBottom: "Valoración (5–7 entre quienes lo conocen): 78,2% (mujeres 84,5% | hombres 69,2%).",
      visual: { type: "stackBar", orientation: "horizontal" }
    },

    // 19
    {
      id: "cuaderno-ranking",
      kicker: "Eje 2",
      title: "Cuaderno — por qué se valora",
      layout: "ranking",
      rows: [
        { label: "Útil para incorporar perspectiva de género y DDHH", value: "58,2%" },
        { label: "Identifica estereotipos y sesgos", value: "54,1%" },
        { label: "Refuerza estándares internacionales", value: "52,5%" }
      ],
      noteRows: ["Otros: 45,5% contenido claro · 39,3% práctico · 29,9% ejemplos"],
      visual: { type: "rankBars", topN: 3 }
    },

    // 20
    {
      id: "eje2-justice-shift",
      kicker: "Eje 2",
      title: "Giro jurisdiccional (2015→2025) — neutralidad vs perspectiva",
      layout: "twoCards",
      cards: [
        {
          title: "“Juez ciego”",
          body: "Acuerdo 63,2% → 27,2% (Escalafón Primario)."
        },
        {
          title: "Derecho y desigualdad",
          body: "Acuerdo: 40,6% → 64,2% (“puede perpetuar desigualdad de género”)."
        }
      ],
      visual: { type: "deltaPair", arrows: true }
    },

    // 21
    {
      id: "eje2-pg-why",
      kicker: "Eje 2",
      title: "Importancia de perspectiva de género (2025)",
      layout: "dashboard",
      kpis: [
        { label: "Mujeres (alta)", value: "87,4%", note: "Importancia alta" },
        { label: "Hombres (alta)", value: "68,7%", note: "Importancia alta" },
        { label: "No binario (alta)", value: "71,3%", note: "Importancia alta" }
      ],
      bullets: [
        "Razones principales: justicia igualitaria/no discriminatoria (75%).",
        "Considera contextos/realidades específicas (51%) · evita estereotipos/sesgos (49%) · visibiliza desigualdades (48%) · enfoque DDHH (46%)."
      ],
      visual: { type: "kpiGroup", style: "compact" }
    },

    // 22
    {
      id: "eje2-frequency-context",
      kicker: "Eje 2",
      title: "Frecuencia de considerar contextos diferenciados (2025)",
      layout: "list",
      bullets: [
        "Ocasionalmente: 52,9%",
        "Casi siempre: 28,4% · Siempre: 7,8%",
        "Casi nunca: 8,1% · Nunca: 2,7%",
        "Comparación 2015→2025: “Nunca” baja 17,6% → 2,7%."
      ],
      visual: { type: "distribution", kind: "bars" }
    },

    // 23
    {
      id: "eje3-products",
      kicker: "Hallazgos por eje",
      title: "Eje 3 — No violencia de género (productos y medidas)",
      layout: "list",
      bullets: [
        "Acoso sexual: Acta 103-2018 (prevención/denuncia/tratamiento; indagatorias admisibles; protege también a personas usuarias).",
        "Acta 207: prevención, atención y reparación; énfasis en evitar revictimización.",
        "Capacitaciones a unidades; campaña “Acoso es acoso”; estudios e informes en derecho.",
        "Transparencia: estadísticas y fallos anonimizados publicados a fines de 2025."
      ],
      visual: { type: "iconList", icons: ["policy", "repair", "training", "chart"] }
    },

    // 24
    {
      id: "eje3-visibility",
      kicker: "Eje 3",
      title: "Acoso sexual — visibilización y subdenuncia",
      layout: "dashboard",
      kpis: [
        { label: "Visibilización", value: "10,1%→15,6%", note: "Presenció/experimentó (2015→2025)" },
        { label: "Subdenuncia", value: "80%", note: "Entre quienes viven/presencian (N=514) no denunció" },
        { label: "Confianza (alta)", value: "54,1%", note: "Escala 1–7: 5–7 (N=2.910)" }
      ],
      bullets: [
        "Brecha por sexo en confianza: mujeres 50,4% alta (25,1% baja) vs hombres 59,3% alta (19,6% baja).",
        "Barreras cualitativas: miedo a represalias, exposición y efectos en carrera; jerarquía e impunidad percibida."
      ],
      visual: { type: "kpiBars", highlight: "trustGap" }
    },

    // 25
    {
      id: "eje3-channels",
      kicker: "Eje 3",
      title: "Canales de denuncia (2025, N=103) — cambio de patrón",
      layout: "list",
      bullets: [
        "Canal normativa interna (Acta 103-2018): 31,1% (en 2015 no existía).",
        "Jefatura: 25% → 67% (2015→2025).",
        "Otra unidad interna: 9% → 11,7% · Externa: 1% → 4,9%."
      ],
      visual: { type: "sankeyLite", emphasis: "hierarchy" }
    },

    // 26
    {
      id: "eje4-facts",
      kicker: "Hallazgos por eje",
      title: "Eje 4 — Capacitación (hechos concretos)",
      layout: "dashboard",
      kpis: [
        { label: "Cursos STIGND–Academia Judicial (2020–2024)", value: "1.915", note: "Participantes" },
        { label: "Cursos virtuales CAPJ (2021–2024)", value: "5.810", note: "Participantes" },
        { label: "Charlas/jornadas STIGND (2022–2024)", value: "3.401", note: "Participantes" }
      ],
      bullets: [
        "Programa obligatorio (Acta 207-2022): 129 a 2024.",
        "Difusión/medio: sitio web STIGND + revista + podcast + convenios + participación en instancias internacionales."
      ],
      visual: { type: "kpiGrid", columns: 3 }
    },

    // 27
    {
      id: "eje4-web",
      kicker: "Eje 4",
      title: "Difusión digital — sitio web STIGND",
      layout: "dashboard",
      kpis: [
        { label: "2021", value: "36.000 / 95.000", note: "Usuarias(os) / vistas" },
        { label: "2023", value: "66.807 / 230.000", note: "Usuarias(os) / vistas (máximo)" },
        { label: "Repositorio", value: "11.000+", note: "Interacciones (recurso más consultado)" }
      ],
      visual: { type: "trendCards", arrows: true }
    },

    // 28
    {
      id: "eje4-participation",
      kicker: "Eje 4",
      title: "Capacitación — conocimiento, participación y brecha",
      layout: "dashboard",
      kpis: [
        { label: "Conoce actividades", value: "78,6%", note: "Encuesta 2025" },
        { label: "Participó al menos una vez", value: "69,9%", note: "Encuesta 2025" },
        { label: "Brecha", value: "30,1%", note: "No asistió ni accedió a difusión" }
      ],
      bullets: [
        "Valoración (quienes accedieron): difusión 87,2% satisfecho/muy satisfecho; cursos/talleres 77,1%."
      ],
      visual: { type: "kpiBars", highlight: "coverageGap" }
    },

    // 29
    {
      id: "cross-conclusions",
      kicker: "Conclusiones",
      title: "Lectura transversal (3 marcos)",
      layout: "threePillars",
      cards: [
        {
          title: "Género",
          body:
            "Avances y “ruido” institucional; persisten machismo solapado y sesgos en trayectorias (maternidad/ascenso)."
        },
        {
          title: "DDHH",
          body:
            "Instrumentos y protocolos amplían garantías; ejercicio efectivo requiere accesibilidad, información y confianza (especialmente en acoso)."
        },
        {
          title: "Cambio institucional",
          body:
            "Se consolidan reglas/estructuras; estabilización depende de incentivos, capacidades y monitoreo para evitar desacoples."
        }
      ]
    },

    // 30
    {
      id: "conclusive-findings",
      kicker: "Conclusiones",
      title: "Hallazgos concluyentes",
      layout: "list",
      bullets: [
        "Predomina cambio formal (reglas, comités, protocolos, formación).",
        "Cambio informal (prácticas/cultura) heterogéneo.",
        "Traba principal: difusión y uso efectivo de instrumentos (conocimiento parcial pese a alta valoración).",
        "Acoso: institucionalidad operativa, pero con subdenuncia y brecha de confianza.",
        "Jurisdiccional: giro cultural 2015–2025 (menos neutralidad abstracta; mayor conciencia de desigualdad).",
        "Nudo transversal: rendición de cuentas con datos desagregados, seguimiento y aprendizaje."
      ],
      visual: { type: "checklist", density: "tight" }
    },

    // 31
    {
      id: "spheres-dashboard",
      kicker: "Resultados",
      title: "Avances por esfera (control · influencia · interés)",
      layout: "threeCards",
      cards: [
        {
          title: "CONTROL",
          body:
            "Comités (17 CA), actas y protocolos (acoso), herramientas (manuales, revista, repositorio, podcast), oferta formativa, web/transparencia."
        },
        {
          title: "INFLUENCIA",
          body:
            "Baja de trato discriminatorio (45,9%→36,3%); canales de denuncia se diversifican; uso de canal formal existe."
        },
        {
          title: "INTERÉS",
          body:
            "Se reconoce cultura machista (50,5%→48,6%); persiste machismo solapado; acoso más visible (10,1%→15,6%) y brecha de confianza."
        }
      ]
    },

    // 32
    {
      id: "summary",
      kicker: "En resumen",
      title: "Síntesis ejecutiva",
      layout: "list",
      bullets: [
        "La PIGND instala arquitectura institucional robusta y herramientas.",
        "Hay avances observables en prácticas (p. ej., disminuye trato discriminatorio).",
        "Persisten resistencias culturales y brechas de apropiación que limitan transversalización.",
        "Siguiente fase: uso efectivo, difusión estratégica y rendición de cuentas con evidencia."
      ],
      visual: { type: "bridge", from: "formal", to: "cultural", support: "evidence" }
    },

    // 33
    {
      id: "reco-transversal",
      kicker: "Recomendaciones",
      title: "Orientaciones transversales",
      layout: "threePillars",
      cards: [
        { title: "Interseccionalidad", body: "Operacionalización sistemática del enfoque en implementación." },
        { title: "Datos y rendición", body: "Seguimiento, retroalimentación y aprendizaje continuo." },
        { title: "Institucionalidad", body: "Consolidar rol estratégico de STIGND, comités y gobernanza." }
      ],
      visual: { type: "pillars", style: "boldTitle" }
    },

    // 34
    {
      id: "reco-by-axis",
      kicker: "Recomendaciones",
      title: "Acciones prioritarias por eje",
      layout: "tiles4",
      tiles: [
        "Eje 1 — No discriminación: revisar criterios de reclutamiento/ascenso y sesgos “neutros”; reforzar conciliación y corresponsabilidad.",
        "Eje 2 — Acceso a justicia: ampliar difusión/capacitación en protocolos; estandarizar atención; asegurar infraestructura y tiempos para víctimas.",
        "Eje 3 — No violencia: fortalecer prevención, protección y reparación; asegurar trazabilidad y análisis de denuncias; reforzar confianza en procedimientos.",
        "Eje 4 — Capacitación: avanzar hacia obligatoriedad/segmentación por rol; monitorear cobertura y efectos en prácticas (no solo asistencia)."
      ],
      visual: { type: "tileGrid", cols: 2 }
    },

    // 35
    {
      id: "close",
      kicker: "Cierre",
      title: "Mensaje final",
      layout: "statement",
      statement:
        "La PIGND ha consolidado una arquitectura institucional robusta y ha impulsado cambios relevantes. El desafío de la siguiente fase es sostener el cambio cultural, asegurar uso efectivo de instrumentos y rendir cuentas con evidencia, para avanzar hacia igualdad sustantiva y acceso efectivo a la justicia.",
      badges: ["Cambio formal → cambio sostenible", "Evidencia → mejora continua"],
      visual: { type: "signatureMotif", name: "evidenceBridge" }
    }
  ]
};

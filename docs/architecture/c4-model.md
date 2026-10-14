# Alcancía Viva - Arquitectura de Software (Modelo C4)

Este documento detalla la arquitectura de **Alcancía Viva** siguiendo los niveles de abstracción del modelo C4 (Contexto, Contenedores y Componentes), enfocado en la interacción humano-computador, accesibilidad (WCAG 2.2 AA) y desacoplamiento de servicios inteligentes.

---

## Nivel 1: Diagrama de Contexto del Sistema (System Context)

El diagrama de contexto ilustra cómo los distintos usuarios (estudiantes, familias, usuarios con discapacidad visual, auditiva o motora) interactúan con Alcancía Viva y los servicios externos involucrados.

```mermaid
C4Context
    title Diagrama de Contexto del Sistema - Alcancía Viva

    Person(usuario_general, "Usuario / Estudiante", "Registra gastos cotidianos por voz o texto y consulta su avance financiero.")
    Person(usuario_accesible, "Usuario con Discapacidad", "Opera la aplicación mediante lector de pantalla, comandos de voz o modo de baja carga cognitiva.")
    Person(familia_grupo, "Miembros de Grupo", "Colaboran en metas de ahorro compartidas sin exponer transacciones privadas.")

    System(alcancia_viva, "Alcancía Viva (PWA)", "Aplicación web progresiva con ecosistema visual dinámico, registro por lenguaje natural e interfaces multimodales.")

    System_Ext(llm_providers, "Proveedores de LLM", "Claude / OpenAI / Ollama / Mock para extracción de entidades y asesoramiento financiero empático.")
    System_Ext(web_speech, "Web Speech API", "Motor de reconocimiento de voz (STT) y síntesis de voz (TTS) nativo del navegador.")
    System_Ext(supabase, "Supabase Cloud", "Servicios de autenticación, base de datos Postgres con Row Level Security (RLS) y sincronización Realtime.")

    Rel(usuario_general, alcancia_viva, "Dicta o escribe transacciones, visualiza ecosistema", "Voz / Táctil / Teclado")
    Rel(usuario_accesible, alcancia_viva, "Interactúa con retroalimentación oral, alto contraste y ARIA", "WCAG 2.2 AA")
    Rel(familia_grupo, alcancia_viva, "Aporta a metas compartidas y monitorea progreso colectivo", "Web Sockets / Realtime")

    Rel(alcancia_viva, llm_providers, "Envía frases para extracción estructurada y consejos sin culpa", "HTTPS / REST")
    Rel(alcancia_viva, web_speech, "Captura audio y reproduce síntesis de voz", "Web API nativa")
    Rel(alcancia_viva, supabase, "Sincroniza transacciones, metas y presencia grupal", "HTTPS / WSS")
```

---

## Nivel 2: Diagrama de Contenedores (Container Diagram)

Describe los entornos de ejecución de alto nivel que componen la solución. Alcancía Viva está diseñada como una **Single Page Application (SPA) / Progressive Web App (PWA)** que garantiza funcionamiento offline inmediato.

```mermaid
C4Container
    title Diagrama de Contenedores - Alcancía Viva

    Person(user, "Usuario", "Interactúa en móvil o laptop.")

    Container_Boundary(c1, "Plataforma Cliente (PWA)") {
        Container(spa, "Single Page Application", "React 19, TypeScript, Vite", "Renderiza la interfaz no convencional (SVG dinámico), gestiona el estado y la navegación accesible.")
        Container(sw, "Service Worker & Cache", "Workbox / Cache API", "Gestiona la instalación PWA, almacenamiento en caché de activos estáticos y cola de sincronización offline.")
        ContainerDb(idb, "Local Storage / IndexedDB", "Browser Storage", "Almacena transacciones locales, perfil adaptativo persistente, histórico y cola de reintento.")
    }

    Container_Boundary(c2, "Servicios en la Nube y Motores de IA") {
        Container(supabase_api, "Supabase BaaS", "PostgreSQL + RLS + Realtime", "Gestiona autenticación, persistencia remota de transacciones cifradas y canales WebSocket para grupos.")
        Container(llm_gateway, "Capa de Abstracción LLM", "TypeScript Adapter Pattern", "Intercambia en caliente entre Claude, OpenAI, Ollama o Mock local sin reiniciar la app.")
    }

    Rel(user, spa, "Usa la aplicación", "Táctil, Voz, Teclado")
    Rel(spa, sw, "Consulta recursos y encola solicitudes", "PWA Hooks")
    Rel(spa, idb, "Guarda estado local y perfil persistente", "API síncrona / asíncrona")
    Rel(spa, llm_gateway, "Solicita procesamiento semántico de lenguaje natural", "In-app Abstraction")
    Rel(llm_gateway, supabase_api, "Sincroniza datos validados", "HTTPS / WebSocket")
```

---

## Nivel 3: Diagrama de Componentes (Component Diagram - Cliente PWA)

Detalla la estructura interna de la Single Page Application dentro del navegador.

```mermaid
C4Component
    title Diagrama de Componentes - Frontend PWA de Alcancía Viva

    Container_Boundary(spa_comp, "Módulos de la Aplicación") {
        Component(view_ecosystem, "Ecosystem Engine (SVG)", "React Component", "Renderiza y anima el ecosistema vivo (árbol/pez/huerto) según el estado financiero visceral y conductual.")
        Component(voice_service, "Speech Service", "Web Speech Adapter", "Encapsula SpeechRecognition y SpeechSynthesis con soporte de transcripción y lectura ARIA.")
        Component(llm_factory, "LLM Factory & Providers", "Design Pattern Factory", "Orquesta `MockProvider`, `ClaudeProvider`, `OpenAIProvider` y `OllamaProvider` bajo la interfaz `ILLMProvider`.")
        Component(offline_sync, "Offline Queue Manager", "Local Queue Handler", "Encola transacciones generadas sin conectividad y las despacha al restablecer conexión.")
        Component(user_profile, "Adaptive Profile Store", "State Store", "Almacena preferencias, tono de asistente, ritmo de gasto, tolerancia y diccionario semántico aprendido.")
        Component(goals_manager, "Goals & Realtime Collab", "Supabase Channels", "Sincroniza metas personales y metas de ahorro compartidas en salas grupales en tiempo real.")
        Component(a11y_hub, "Accessibility Controller", "WCAG Manager", "Controla alto contraste, escala tipográfica al 200%, reducción de movimiento y soporte de teclado.")
    }

    Rel(view_ecosystem, user_profile, "Consulta saldo semanal y salud del ecosistema")
    Rel(voice_service, llm_factory, "Envía texto reconocido para extracción de monto y categoría")
    Rel(llm_factory, offline_sync, "Si falla o no hay red, activa modo de respaldo manual estructurado")
    Rel(offline_sync, user_profile, "Actualiza historial y saldo del usuario")
    Rel(goals_manager, user_profile, "Vincula aportes a metas")
    Rel(a11y_hub, view_ecosystem, "Aplica estilos de alto contraste y supresión de animaciones SVG")
```

---

## Registro de Decisiones de Arquitectura (ADRs)

### ADR-01: Adopción del Patrón Fábrica y Adaptador para LLM
* **Contexto:** La rúbrica exige que el LLM pueda cambiar de proveedor sin modificar los módulos funcionales (NFR-08) y permitir evaluación sin claves pagadas (FR-19, FR-20).
* **Decisión:** Se implementa la interfaz común `ILLMProvider` con soporte para:
  1. `MockLLMProvider`: Motor de reglas y heurísticas semánticas sin costo ni red.
  2. `AnthropicProvider`: Integración con API de Claude 3.5 Sonnet.
  3. `OpenAIProvider`: Integración con API de GPT-4o / GPT-4o-mini.
  4. `OllamaProvider`: Integración con modelos locales (Llama 3, Mistral) vía HTTP local.
* **Consecuencia:** Cero acoplamiento a una sola API comercial y reproducibilidad garantizada para los evaluadores.

### ADR-02: Metáfora Visual Basada en SVG Declarativo
* **Contexto:** Se requiere una interfaz no convencional con diseño emocional (Norman: visceral, conductual, reflexivo).
* **Decisión:** Emplear gráficos vectoriales SVG interactivos manipulados por propiedades React, evitando motores 3D pesados que degradarían el rendimiento en móviles de gama baja.
* **Consecuencia:** Carga instantánea, escalabilidad infinita sin pixelación, soporte nativo de reducción de movimiento (`prefers-reduced-motion`) y descripciones semánticas accesibles vía atributos `role="img"` y `aria-label`.

### ADR-03: Política Offline-First y Almacenamiento Local
* **Contexto:** En escenarios de movilidad en transporte público o mercados de Lima, la conectividad es inestable (PACT A1).
* **Decisión:** Todas las escrituras se consolidan primero en el almacenamiento local (`LocalStorage` / `IndexedDB`) y se despachan a la nube de manera asíncrona mediante una cola idempotente.

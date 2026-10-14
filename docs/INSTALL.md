# Guía de Instalación y Despliegue - Alcancía Viva

Esta guía contiene los pasos necesarios para instalar, configurar y ejecutar la aplicación **Alcancía Viva** en entorno local tanto en laptops convencionales como en dispositivos móviles.

---

## 1. Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu sistema:
* **Node.js**: Versión 18.0 o superior (recomendado Node 20 LTS o 22+).
* **npm**: Versión 9.0 o superior (o pnpm / yarn).
* **Navegador Web Moderno**: Google Chrome, Microsoft Edge, Brave o Safari (con soporte para Web Speech API).
* **Git**: Para clonar el repositorio.

---

## 2. Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Faalvial/Alcancia-Viva.git
cd alcancia-viva
```

### Paso 2: Instalar Dependencias
Instala todas las dependencias necesarias del proyecto:
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Copia el archivo de plantilla `.env.example` a un nuevo archivo `.env`:

* **En Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
* **En Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

#### Configuración de Proveedores LLM:
Por defecto, la aplicación viene configurada en **Modo Demostración (`mock`)**, lo que permite evaluarla y utilizarla inmediatamente sin necesidad de ingresar ninguna API Key de pago ni conexión a internet:
```env
VITE_LLM_PROVIDER=mock
```

Si deseas utilizar un proveedor real:
* **OpenAI:** Cambia `VITE_LLM_PROVIDER=openai` y coloca tu clave en `VITE_OPENAI_API_KEY=sk-...`
* **Anthropic (Claude):** Cambia `VITE_LLM_PROVIDER=anthropic` y coloca tu clave en `VITE_ANTHROPIC_API_KEY=sk-ant-...`
* **Ollama (Local):** Cambia `VITE_LLM_PROVIDER=ollama` y asegúrate de tener Ollama corriendo en `http://localhost:11434`.

---

## 3. Ejecución en Modo Desarrollo

Inicia el servidor local de desarrollo con Vite:
```bash
npm run dev
```

La consola mostrará una URL local, usualmente:
```
  VITE v6.x.x  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.X:5173/
```

Abre tu navegador e ingresa a `http://localhost:5173`.

---

## 4. Probando en Dispositivos Móviles (PWA)

1. Conecta tu teléfono móvil a la misma red Wi-Fi que tu computadora.
2. En la terminal de Vite, inicia el servidor exponiendo la red:
   ```bash
   npm run dev -- --host
   ```
3. Abre el navegador de tu móvil (Chrome en Android o Safari en iOS) e ingresa a la dirección `http://192.168.1.X:5173`.
4. **Instalación como PWA:**
   * En Chrome (Android): Toca el menú de tres puntos y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
   * En Safari (iOS): Toca el botón Compartir y selecciona **"Agregar al inicio"**.
5. La aplicación funcionará con aspecto y fluidez nativa a pantalla completa.

---

## 5. Carga de Datos Simulados para Demostración

Para verificar inmediatamente los 30 días de transacciones, metas activas y el ecosistema dinámico:
1. Haz clic en el botón superior **"Modo Demostración / Cargar Datos"** en la barra de herramientas.
2. Se cargarán instantáneamente los datos de `data/mock_data.json` en tu almacenamiento local.
3. Podrás explorar:
   * El árbol interactivo en estado saludable (frondoso).
   * El desglose de gastos semanales (S/ 235.00).
   * La meta individual de ahorro para una **Laptop (S/ 800 de S/ 2000)**.
   * La sala de ahorro colaborativo para el **Viaje a Cusco (S/ 1250 de S/ 3000)**.

---

## 6. Construcción para Producción

Para compilar la aplicación optimizada para despliegue:
```bash
npm run build
```
Los archivos estáticos listos para producción se generarán en la carpeta `dist/`. Puedes previsualizarlos localmente con:
```bash
npm run preview
```

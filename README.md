# Hyrox Cancún 2027

PWA del plan integrado: entrenamiento, nutrición y día a día para Hyrox Cancún (19-21 feb 2027).

## Uso

```bash
npm install
npm run dev       # desarrollo (abre también en el celular por la red local)
npm run build     # genera dist/ con service worker
npm run preview   # prueba el build
npm run icons     # regenera los PNG de public/icons (Windows)
```

## Cómo está armada

```
data/                     Los 3 JSON del plan (solo lectura). Cambiarlos = cambiar el plan.
src/data/plan.js          Única puerta de entrada a los JSON.
src/engine/               Lógica sin interfaz:
  calendar.js             fecha → semana, fase, sesiones (plantilla + datos de la semana)
  diario.js               variante A/B, horas por ancla, ajuste alta → media
  semaforo.js             criterios del check-in → verde / amarillo / rojo
  registro.js             formularios por tipo, registro anterior, progresión doble, pace
  peso.js                 promedio de 7 días y reglas de ajuste de calorías
  nutricion.js            suplementos que tocan hoy, avisos de semanas especiales
  dia.js                  calcularDia(): función pura que arma cualquier día
  progreso.js             series para las gráficas y cumplimiento
  ics.js                  exporta la línea de tiempo al calendario con alarmas
src/hooks/useDiaPlan.js   el día completo (variante, línea de tiempo, metas) para Hoy y Nutrición
  dates.js                fechas locales y horas
src/store/store.js        Registros del atleta en localStorage (prefijo hgc_), separados del plan.
src/screens/              Pantallas. hoy/ es la pantalla principal.
src/components/           Icon (iconos SVG propios), NavBar, Sheet.
```

## Scripts de datos

Si regeneras los JSON, corre estos dos en orden (se pueden repetir sin problema):

```bash
node scripts/add-porciones.cjs   # gramos por alimento de las 5 comidas fijas, según sus macros
node scripts/add-acentos.cjs     # acentos en textos visibles (no toca identificadores)
```

`data/_respaldo/` guarda los JSON originales sin acentos ni porciones.

## Reglas aplicadas

- **Semáforo**: 0 criterios = verde, 1 = amarillo, 2+ = rojo. Rodilla 3/10+ o dolor agudo = rojo directo.
  La FC en reposo se compara con el promedio de los 7 días previos (necesita 3 registros).
- **Martes**: variante B (sin Engine) automática si la semana la omite o el semáforo no está en verde.
- **Descarga / taper**: si el día es media y la plantilla diaria es alta, se quita la diferencia de
  carbohidratos (80 g) entre comida y cena.
- **Semana 0**: sin sesiones fijas; la línea de tiempo muestra despertar y comidas fijas.

## Fases

1. Base, check-in, semáforo y pantalla Hoy ✅
2. Plan: calendario de 19 semanas, detalle de sesión, registro (gym, running, clase) y pruebas ✅
3. Nutrición: metas, agua, suplementos, peso con promedio de 7 días y ajuste cada 2 semanas ✅
4. Progreso: cumplimiento, semáforo, FC, sueño, ritmo Z2, fuerza, pruebas vs Roma; respaldo y recordatorios (.ics) ✅

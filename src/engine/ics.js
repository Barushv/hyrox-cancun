// Genera un archivo de calendario (.ics) con la línea de tiempo de uno o varios días.
// Cada toma, sesión y suplemento queda como evento con alarma: así llegan los recordatorios
// aunque la app esté cerrada, sin servidor de notificaciones.

const esc = (t) => String(t ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

// Las líneas de más de 75 caracteres se parten (RFC 5545)
function plegar(linea) {
  const out = []
  let resto = linea
  while (resto.length > 73) {
    out.push(resto.slice(0, 73))
    resto = ' ' + resto.slice(73)
  }
  out.push(resto)
  return out.join('\r\n')
}

const fechaHora = (iso, hhmm) => `${iso.replace(/-/g, '')}T${hhmm.replace(':', '')}00`

function descripcion(it) {
  const partes = []
  if (it.porciones) partes.push(it.porciones.map((p) => `${p.cantidad} ${p.alimento}`).join('\n'))
  if (it.macros) partes.push(`P ${it.macros.p} · C ${it.macros.c} · G ${it.macros.g}`)
  if (it.detalle) partes.push(it.detalle)
  return partes.join('\n\n')
}

/** dias: [{ fecha, items }] (items de construirDia) */
export function generarICS(dias) {
  const ahora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const lineas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hyrox Cancun//PWA//ES', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Hyrox Cancún']
  for (const { fecha, items } of dias) {
    for (const it of items) {
      const min = Math.max(it.duracion_min || 0, 10)
      const antes = it.tipo === 'entreno' ? 15 : 0
      lineas.push(
        'BEGIN:VEVENT',
        `UID:${fecha}-${it.key}@hyrox-cancun`,
        `DTSTAMP:${ahora}`,
        `DTSTART:${fechaHora(fecha, it.hora)}`,
        `DURATION:PT${min}M`,
        `SUMMARY:${esc(it.titulo)}`,
        `DESCRIPTION:${esc(descripcion(it))}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(it.titulo)}`,
        `TRIGGER:-PT${antes}M`,
        'END:VALARM',
        'END:VEVENT',
      )
    }
  }
  lineas.push('END:VCALENDAR')
  return lineas.map(plegar).join('\r\n')
}

// En el teléfono abre el menú de compartir (Calendario, Archivos…); en la computadora descarga el archivo
export async function compartirArchivo(nombre, contenido, tipo) {
  const file = new File([contenido], nombre, { type: tipo })
  const tactil = window.matchMedia?.('(pointer: coarse)').matches
  if (tactil && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: nombre })
      return 'compartido'
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelado'
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'descargado'
}

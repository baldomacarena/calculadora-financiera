const STORAGE_KEY = "calc-financiera-v1";

const cuentasList = document.getElementById("cuentas-list");
const compromisosList = document.getElementById("compromisos-list");

function formatear(monto) {
  const signo = monto < 0 ? "-" : "";
  const abs = Math.abs(monto);
  return signo + "$" + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function crearFilaCuenta(datos = {}) {
  const row = document.createElement("div");
  row.className = "row-item";
  row.innerHTML = `
    <input type="text" class="c-nombre" placeholder="Nombre de la cuenta" value="${datos.nombre ?? ""}">
    <input type="number" class="c-disponible" placeholder="Disponible $" min="0" value="${datos.disponible ?? ""}">
    <input type="number" class="c-liberar" placeholder="A liberar $" min="0" value="${datos.liberar ?? ""}">
    <button type="button" class="btn-remove" title="Quitar">×</button>
  `;
  row.querySelector(".btn-remove").addEventListener("click", () => {
    row.remove();
    guardarEstado();
  });
  row.querySelectorAll("input").forEach(i => i.addEventListener("input", guardarEstado));
  return row;
}

function crearFilaCompromiso(datos = {}) {
  const row = document.createElement("div");
  row.className = "row-item compromiso";
  row.innerHTML = `
    <input type="text" class="k-concepto" placeholder="Concepto (cheque, transferencia...)" value="${datos.concepto ?? ""}">
    <input type="number" class="k-importe" placeholder="Importe $" min="0" value="${datos.importe ?? ""}">
    <button type="button" class="btn-remove" title="Quitar">×</button>
  `;
  row.querySelector(".btn-remove").addEventListener("click", () => {
    row.remove();
    guardarEstado();
  });
  row.querySelectorAll("input").forEach(i => i.addEventListener("input", guardarEstado));
  return row;
}

document.getElementById("add-cuenta").addEventListener("click", () => {
  cuentasList.appendChild(crearFilaCuenta());
  guardarEstado();
});

document.getElementById("add-compromiso").addEventListener("click", () => {
  compromisosList.appendChild(crearFilaCompromiso());
  guardarEstado();
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.getElementById("dias").value = chip.dataset.dias;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    guardarEstado();
  });
});

document.querySelectorAll('input[name="modo-ingreso"]').forEach(radio => {
  radio.addEventListener("change", () => {
    const esTotal = document.querySelector('input[name="modo-ingreso"]:checked').value === "total";
    document.getElementById("ingreso-total-wrap").style.display = esTotal ? "flex" : "none";
    document.getElementById("ingreso-promedio-wrap").style.display = esTotal ? "none" : "flex";
    guardarEstado();
  });
});

document.getElementById("dias").addEventListener("input", guardarEstado);
document.getElementById("ingreso-total").addEventListener("input", guardarEstado);
document.getElementById("ingreso-promedio").addEventListener("input", guardarEstado);

document.getElementById("limpiar").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  cuentasList.innerHTML = "";
  compromisosList.innerHTML = "";
  cuentasList.appendChild(crearFilaCuenta());
  compromisosList.appendChild(crearFilaCompromiso());
  document.getElementById("dias").value = 30;
  document.getElementById("ingreso-total").value = "";
  document.getElementById("ingreso-promedio").value = "";
  document.querySelector('input[name="modo-ingreso"][value="total"]').checked = true;
  document.getElementById("ingreso-total-wrap").style.display = "flex";
  document.getElementById("ingreso-promedio-wrap").style.display = "none";
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  document.getElementById("resultado").classList.remove("visible");
  document.getElementById("resultado").classList.add("hidden");
});

function guardarEstado() {
  const estado = {
    cuentas: [...cuentasList.querySelectorAll(".row-item")].map(row => ({
      nombre: row.querySelector(".c-nombre").value,
      disponible: row.querySelector(".c-disponible").value,
      liberar: row.querySelector(".c-liberar").value,
    })),
    compromisos: [...compromisosList.querySelectorAll(".row-item")].map(row => ({
      concepto: row.querySelector(".k-concepto").value,
      importe: row.querySelector(".k-importe").value,
    })),
    dias: document.getElementById("dias").value,
    modoIngreso: document.querySelector('input[name="modo-ingreso"]:checked').value,
    ingresoTotal: document.getElementById("ingreso-total").value,
    ingresoPromedio: document.getElementById("ingreso-promedio").value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function restaurarEstado() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    cuentasList.appendChild(crearFilaCuenta());
    compromisosList.appendChild(crearFilaCompromiso());
    return;
  }
  try {
    const estado = JSON.parse(raw);
    (estado.cuentas || []).forEach(c => cuentasList.appendChild(crearFilaCuenta(c)));
    (estado.compromisos || []).forEach(k => compromisosList.appendChild(crearFilaCompromiso(k)));
    if (!estado.cuentas || estado.cuentas.length === 0) cuentasList.appendChild(crearFilaCuenta());
    if (!estado.compromisos || estado.compromisos.length === 0) compromisosList.appendChild(crearFilaCompromiso());

    if (estado.dias) document.getElementById("dias").value = estado.dias;
    if (estado.modoIngreso) {
      document.querySelector(`input[name="modo-ingreso"][value="${estado.modoIngreso}"]`).checked = true;
      const esTotal = estado.modoIngreso === "total";
      document.getElementById("ingreso-total-wrap").style.display = esTotal ? "flex" : "none";
      document.getElementById("ingreso-promedio-wrap").style.display = esTotal ? "none" : "flex";
    }
    if (estado.ingresoTotal) document.getElementById("ingreso-total").value = estado.ingresoTotal;
    if (estado.ingresoPromedio) document.getElementById("ingreso-promedio").value = estado.ingresoPromedio;
  } catch (e) {
    cuentasList.appendChild(crearFilaCuenta());
    compromisosList.appendChild(crearFilaCompromiso());
  }
}

function animarNumero(el, desde, hasta, duracionMs) {
  const inicio = performance.now();
  function paso(ahora) {
    const t = Math.min(1, (ahora - inicio) / duracionMs);
    const facil = 1 - Math.pow(1 - t, 3);
    const valor = desde + (hasta - desde) * facil;
    el.textContent = formatear(valor);
    if (t < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function fila(label, valor, negrita = false) {
  return `
    <div class="r-row ${negrita ? "bold" : ""}">
      <span class="r-item">${label}</span>
      <span class="r-val">${formatear(valor)}</span>
    </div>
  `;
}

function seccion(titulo, fechaTexto, filasHtml, totalLabel, totalValor) {
  return `
    <div class="r-section">
      <p style="margin:0 0 6px;">
        <span class="r-label">${titulo}</span>
        <span class="r-sub"> · al ${fechaTexto}</span>
      </p>
      ${filasHtml}
      ${fila(totalLabel, totalValor, true)}
    </div>
    <div class="r-divider"></div>
  `;
}

function formatearFecha(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

document.getElementById("calcular").addEventListener("click", () => {
  const cuentas = [...cuentasList.querySelectorAll(".row-item")].map(row => ({
    nombre: row.querySelector(".c-nombre").value.trim() || "Cuenta sin nombre",
    disponible: parseFloat(row.querySelector(".c-disponible").value) || 0,
    liberar: parseFloat(row.querySelector(".c-liberar").value) || 0,
  }));

  const compromisos = [...compromisosList.querySelectorAll(".row-item")]
    .map(row => ({
      concepto: row.querySelector(".k-concepto").value.trim() || "Compromiso sin nombre",
      importe: parseFloat(row.querySelector(".k-importe").value) || 0,
    }))
    .filter(k => k.importe > 0);

  const dias = parseInt(document.getElementById("dias").value) || 1;
  const modoIngreso = document.querySelector('input[name="modo-ingreso"]:checked').value;
  let ingresos = 0;
  let promedio = 0;
  if (modoIngreso === "total") {
    ingresos = parseFloat(document.getElementById("ingreso-total").value) || 0;
  } else {
    promedio = parseFloat(document.getElementById("ingreso-promedio").value) || 0;
    ingresos = promedio * dias;
  }

  const totalDisponible = cuentas.reduce((s, c) => s + c.disponible, 0);
  const totalLiberar = cuentas.reduce((s, c) => s + c.liberar, 0);
  const totalCompromisos = compromisos.reduce((s, k) => s + k.importe, 0);
  const resultado = totalDisponible + totalLiberar + ingresos - totalCompromisos;

  let estado, estadoClase;
  if (resultado > 0) { estado = "Positivo"; estadoClase = "positivo"; }
  else if (resultado === 0) { estado = "Equilibrado"; estadoClase = "equilibrado"; }
  else { estado = "Deficitario"; estadoClase = "deficitario"; }

  const hoy = new Date();
  const fechaProyeccion = new Date();
  fechaProyeccion.setDate(hoy.getDate() + dias);

  const filasDisp = cuentas.map(c => fila(c.nombre, c.disponible)).join("");
  const filasLib = cuentas.map(c => fila(c.nombre, c.liberar)).join("");
  const filasComp = compromisos.length
    ? compromisos.map(k => fila(k.concepto, k.importe)).join("")
    : fila("Sin compromisos cargados", 0);

  const resultadoEl = document.getElementById("resultado");
  resultadoEl.innerHTML = `
    <div class="result-header">
      <p>Proyección financiera</p>
      <h3>${formatearFecha(fechaProyeccion)}</h3>
    </div>
    <div class="result-body">
      ${seccion("Saldos disponibles", formatearFecha(hoy), filasDisp, "Total disponible", totalDisponible)}
      ${seccion("Saldos a liberar", formatearFecha(hoy), filasLib, "Total a liberar", totalLiberar)}

      <div class="r-section">
        <p style="margin:0 0 6px;">
          <span class="r-label">Ingresos proyectados</span>
          <span class="r-sub"> · al ${formatearFecha(fechaProyeccion)}</span>
        </p>
        ${modoIngreso === "promedio"
          ? fila(`${formatear(promedio)}/día × ${dias} días`, ingresos, true)
          : fila("Monto proyectado", ingresos, true)}
      </div>
      <div class="r-divider"></div>

      ${seccion("Compromisos", formatearFecha(fechaProyeccion), filasComp, "Total compromisos", totalCompromisos)}

      <div class="r-section">
        <p style="margin:0 0 6px;">
          <span class="r-label">Resumen</span>
          <span class="r-sub"> · al ${formatearFecha(fechaProyeccion)}</span>
        </p>
        ${fila("Total disponible", totalDisponible)}
        ${fila("+ Total a liberar", totalLiberar)}
        ${fila("+ Ingresos proyectados", ingresos)}
        ${fila("- Compromisos", totalCompromisos)}
        ${fila("= Saldo proyectado", resultado, true)}
      </div>

      <div class="estado-box ${estadoClase}">
        <div class="estado-label">Estado: ${estado}</div>
        <div class="estado-valor" id="valor-final">${formatear(0)}</div>
      </div>
    </div>
  `;

  resultadoEl.classList.remove("hidden");
  requestAnimationFrame(() => resultadoEl.classList.add("visible"));
  resultadoEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const valorFinalEl = document.getElementById("valor-final");
  animarNumero(valorFinalEl, 0, resultado, 700);

  guardarEstado();
});

restaurarEstado();

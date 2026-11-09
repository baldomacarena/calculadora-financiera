# Calculadora de Proyección Financiera

Herramienta web simple para saber, en segundos, si vas a llegar con plata a una fecha determinada.
Cargás lo que tenés hoy, lo que esperás cobrar y lo que tenés que pagar, y la calculadora te dice
si tu saldo proyectado queda **positivo**, **equilibrado** o en **déficit**.

## ¿Qué calcula?

```
  Saldo disponible hoy
+ Saldo a liberar hoy
+ Ingresos proyectados del período
- Compromisos del período
= Saldo proyectado
```

## Cómo se usa

1. **Saldo disponible y a liberar HOY** — una fila por cuenta (banco, billetera virtual, efectivo),
   con lo disponible y lo que está por liberarse.
2. **Período a proyectar** — cantidad de días hacia adelante, o los atajos *Día*, *Semana* y *Mes*.
3. **Ingresos proyectados** — como monto total del período o como promedio diario
   (se multiplica por la cantidad de días).
4. **Compromisos** — pagos previstos: cheques, transferencias, etc.
5. **Calcular proyección** — muestra el detalle por sección, el resumen y el estado final.

*Limpiar todo* borra los datos y deja el formulario vacío.

## Privacidad

No hay servidor ni base de datos: todo se calcula en el navegador. Los datos cargados se guardan
en el `localStorage` del propio navegador para no perderlos al recargar la página, y no se envían
a ningún lado.

## Tecnologías

HTML, CSS y JavaScript puro. Sin dependencias ni proceso de build.

## Ejecutarla

Abrir `index.html` en cualquier navegador. No requiere instalación.

## Estructura

```
index.html   Estructura de la página y formulario
style.css    Estilos
script.js    Lógica: filas dinámicas, cálculo, resultado y guardado en localStorage
```

## Autora

Macarena Baldo

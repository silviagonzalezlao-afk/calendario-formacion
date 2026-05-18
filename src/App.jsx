import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const supabase = createClient("https://YOUR_URL.supabase.co", "YOUR_ANON_KEY");

export default function App() {
  const [formaciones, setFormaciones] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [capacidad, setCapacidad] = useState(0);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaPrioridad, setNuevaPrioridad] = useState(2);
  const [formacionActiva, setFormacionActiva] = useState(null);

  // ✅ NUEVO: usuario (simulado)
  const [usuario, setUsuario] = useState("admin");


  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const { data: fData } = await supabase.from("formaciones").select("*");
    const { data: iData } = await supabase.from("inscripciones").select("*");
    setFormaciones(fData || []);
    setInscripciones(iData || []);
  };

  const crearFormacion = async () => {
    if (usuario !== "admin") return alert("Solo admin puede crear formaciones");


    await supabase.from("formaciones").insert([
      { titulo, fecha, capacidad: Number(capacidad) }
    ]);
    setTitulo("");
    setFecha("");
    setCapacidad(0);
    cargarDatos();
  };

  const getInscritos = (formacionId, estado) => {
    return inscripciones
      .filter(i => i.formacion_id === formacionId && i.estado === estado)
      .sort((a, b) => b.prioridad - a.prioridad || new Date(a.created_at) - new Date(b.created_at));
  };

  const agregarParticipante = async () => {
    if (!nuevoNombre || !formacionActiva) return;

    const confirmados = getInscritos(formacionActiva, "confirmado");
    const formacion = formaciones.find(f => f.id === formacionActiva);

    const estado = confirmados.length < formacion.capacidad ? "confirmado" : "espera";

    await supabase.from("inscripciones").insert([
      {
        nombre: nuevoNombre,
        prioridad: nuevaPrioridad,
        estado,
        formacion_id: formacionActiva,
        creado_por: usuario
      }
    ]);

    setNuevoNombre("");
    setFormacionActiva(null);
    cargarDatos();
  };

  const eliminarParticipante = async (id) => {
    if (usuario !== "admin") return alert("Solo admin puede eliminar");


    await supabase.from("inscripciones").delete().eq("id", id);
    cargarDatos();
  };

  const liberarPlaza = async (formacionId) => {
    if (usuario !== "admin") return;


    const confirmados = getInscritos(formacionId, "confirmado").reverse();
    if (confirmados.length > 0) {
      await supabase.from("inscripciones").delete().eq("id", confirmados[0].id);
    }

    const espera = getInscritos(formacionId, "espera");
    if (espera.length > 0) {
      await supabase.from("inscripciones").update({ estado: "confirmado" }).eq("id", espera[0].id);
    }

    cargarDatos();
  };

  const eventosCalendario = formaciones.map(f => {
    const confirmados = getInscritos(f.id, "confirmado");
    return {
      id: f.id,
      title: `${f.titulo} (${confirmados.length}/${f.capacidad})`,
      date: f.fecha,
      color: confirmados.length >= f.capacidad ? "#ef4444" : "#22c55e"
    };
  });

  const onEventClick = (info) => {
    const id = Number(info.event.id);
    setFormacionActiva(id);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agenda Formaciones (Modo Empresa)</h1>
      {/* LOGIN SIMPLIFICADO */}
      <Card>
        <CardContent className="p-4 flex gap-2">
          <Button onClick={() => setUsuario("admin")}>
            Admin
          </Button>
          <Button variant="outline" onClick={() => setUsuario("user")}>
            Usuario
          </Button>
          <span>Activo: {usuario}</span>
        </CardContent>
      </Card>


      {/* CALENDARIO */}
      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={eventosCalendario}
            eventClick={onEventClick}
            height={500}
          />
        </CardContent>
      </Card>

      {/* ADMIN ONLY */}
      {usuario === "admin" && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <input className="border p-2 w-full" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
            <input className="border p-2 w-full" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
            <input className="border p-2 w-full" type="number" placeholder="Capacidad" value={capacidad} onChange={e => setCapacidad(e.target.value)} />
            <Button onClick={crearFormacion}>Crear formación</Button>
          </CardContent>
        </Card>
      )}
      {/* FORMULARIO PARTICIPANTE */}
      {formacionActiva && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2>Añadir participante</h2>
            <input className="border p-2 w-full" placeholder="Nombre" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
            <select className="border p-2 w-full" value={nuevaPrioridad} onChange={e => setNuevaPrioridad(Number(e.target.value))}>
              <option value={3}>Alta</option>
              <option value={2}>Media</option>
              <option value={1}>Baja</option>
            </select>
            <Button onClick={agregarParticipante}>Guardar</Button>
          </CardContent>
        </Card>
      )}

      {/* LISTADO */}
      <div className="grid gap-4 md:grid-cols-2">
        {formaciones.map(f => {
          const confirmados = getInscritos(f.id, "confirmado");
          const espera = getInscritos(f.id, "espera");

          return (
            <Card key={f.id}>
              <CardContent className="p-4 space-y-2">
                <h2>{f.titulo}</h2>
                <p>{f.fecha}</p>
                <p>{confirmados.length}/{f.capacidad}</p>

                {usuario === "admin" && (
                  <Button onClick={() => liberarPlaza(f.id)}>Liberar plaza</Button>
                )}

                <div>
                  <strong>Confirmados</strong>
                  <ul>
                    {confirmados.map(i => (
                      <li key={i.id}>
                        {i.nombre}
                        {usuario === "admin" && (
                          <button onClick={() => eliminarParticipante(i.id)}>❌</button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong>Espera</strong>
                  <ul>
                    {espera.map(i => (
                      <li key={i.id}>{i.nombre}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
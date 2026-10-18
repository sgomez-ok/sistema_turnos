# Importamos librerias y modulos
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from pydantic import BaseModel
from database import(init_db,crear_turno, obtener_turnos, obtener_turno_por_id, eliminar_turno, actualizar_turno, obtener_turno_por_fecha)

# Conectamos fast
app = FastAPI(title="Sistema de Gestión de Turnos", version="1.0.0")

# Configuración de CORS amplia para permitir acceso local, red móvil y túneles públicos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# BaseModel para no pongan datos erroneos
class CrearTurno(BaseModel):
    nombre_cliente: str
    servicio: str
    fecha_hora: str = ""


# Ruta get para mostrar un mensaje
@app.get("/estado")
def primer_mensaje():
    return {"mensaje": "Sistema de turnos activo"}




# Ruta post para enviar datos, en este caso guarda datos del cliente en la bd
@app.post("/turnos")
def turno_nuevo(datos: CrearTurno):
    # 1. Consultamos la base de datos para verificar si la fecha existe
    try:
        fecha_hora_existente = obtener_turno_por_fecha(datos.fecha_hora)
    except Exception:
        raise HTTPException(status_code=500, detail="Error al consultar la base de datos")

    # 2. Validamos afuera del try: si está ocupado, enviamos el error 400
    if fecha_hora_existente is not None:
        raise HTTPException(status_code=400, detail="El horario ya está ocupado")

    # 3. Si no está ocupado, creamos el turno
    try:
        id_nuevo = crear_turno(datos.nombre_cliente, datos.servicio, datos.fecha_hora)
        return {"id": id_nuevo, "mensaje": "Turno guardado con éxito"}
    except Exception:
        raise HTTPException(status_code=500, detail="Error al crear el turno en la base de datos")




# Ruta mostrar datos, muestra listado de turnos, si hay algun error va al except y devuelve ese mensaje
@app.get("/turnos")
def mostrar_turnos():
    try:
        return obtener_turnos()
    except Exception:
        raise HTTPException(status_code=500,detail="Error al consultar los turnos en la base de datos")


# Ruta para mostrar un turno por id
@app.get("/turnos/{turno_id}")
def obtener_turno(turno_id: int):
    try:
        turno = obtener_turno_por_id(turno_id)

    except Exception:
        raise HTTPException(status_code=500,detail="Error al consultar la base de datos")

    if turno is None:
        raise HTTPException(status_code=404,detail="Turno no encontrado")
    return turno


# Ruta para eliminar un turno
@app.delete("/turnos/{turno_id}")
def borrar_turno(turno_id: int):
    try:
        exito = eliminar_turno(turno_id)
    except Exception:
        raise HTTPException(status_code=500,detail="Error al intentar eliminar")

    if not exito:
        raise HTTPException(status_code=404,detail="Turno no encontrado")
    return {"mensaje": "Turno eliminado con éxito"}



# Ruta para actualizar un turno
@app.put("/turnos/{turno_id}")
def turno_actualizado(turno_id: int, datos: CrearTurno):

    try:
        turno_existente = obtener_turno_por_fecha(datos.fecha_hora)
    except Exception:
            raise HTTPException(status_code=500, detail="Error al consultar la base de datos")

    if turno_existente is not None and turno_existente["id"] != turno_id:
        raise HTTPException(status_code=400, detail="El horario ya está ocupado por otro turno")

    try:
        actualizo = actualizar_turno(datos.nombre_cliente, datos.servicio, datos.fecha_hora, turno_id)
    except Exception:
        raise HTTPException(status_code=500,detail="Error al intentar actualizar")

    if not actualizo:
        raise HTTPException(status_code=404,detail="Turno no encontrado")
    return {"mensaje": "Turno actualizado con éxito"}





# Montamos la carpeta del frontend para servir la aplicación en el mismo puerto que la API
if os.path.exists("frontend"):
    app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

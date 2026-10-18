import sqlite3

# Codigo para crear la bd y la tabla
def init_db():
    conexion = None

    try:
        conexion = sqlite3.connect("turnos.db")
        cursor = conexion.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS turnos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_cliente TEXT NOT NULL,
                servicio TEXT NOT NULL,
                fecha_hora TEXT NOT NULL
        )
    """)
        conexion.commit()

    except sqlite3.Error as error:
        print(f"Error en SQLite: {error}")
        raise error

    finally:
        if conexion:
            conexion.close()


# Codigo para crear un turno en la bd
def crear_turno(nombre_cliente, servicio, fecha_hora):
    conexion = None

    try:
        conexion = sqlite3.connect("turnos.db")
        cursor = conexion.cursor()

        cursor.execute("INSERT INTO turnos (nombre_cliente, servicio, fecha_hora) VALUES (?, ?, ?)", (nombre_cliente, servicio, fecha_hora))
        conexion.commit()
        id_creado = cursor.lastrowid

    except sqlite3.Error as error:
        print(f"Error en SQLite: {error}")
        raise error

    finally:
        if conexion:
            conexion.close()
    return id_creado


# Codigo para obtener todos los turnos
def obtener_turnos():
    conexion = None

    try:
        # Conexiones minimas de sqlite
        conexion = sqlite3.connect("turnos.db")
        conexion.row_factory = sqlite3.Row
        cursor = conexion.cursor()

        # Consulta a base de datos
        cursor.execute("SELECT id, nombre_cliente, servicio, fecha_hora FROM turnos")
        filas = cursor.fetchall()

        # Convertimos las filas a diccionarios
        turnos =  [dict(fila) for fila in filas]
        return turnos

    # Si hay algun error en try, pasa esto
    except sqlite3.Error as error:
        print(f"Error en SQLite: {error}")
        raise error

    # Cerramos la consulta en cualquier caso
    finally:
        if conexion:
            conexion.close()


# Codigo para obtener un turno por id en la bd
def obtener_turno_por_id(turno_id):
    conexion = None

    try:
        conexion = sqlite3.connect("turnos.db")
        conexion.row_factory = sqlite3.Row
        cursor = conexion.cursor()

        cursor.execute("SELECT id, nombre_cliente, servicio, fecha_hora FROM turnos WHERE id = ?", (turno_id,))
        fila = cursor.fetchone()

        if fila:
            return dict(fila)

    except sqlite3.Error as error:
        print(f"Error en SQLite: {error}")
        raise error

    finally:
        if conexion:
            conexion.close()



def obtener_turno_por_fecha(fecha_hora):
    conexion = None

    try:
        conexion = sqlite3.connect("turnos.db")
        conexion.row_factory = sqlite3.Row
        cursor = conexion.cursor()

        cursor.execute("SELECT id FROM turnos WHERE fecha_hora = ?", (fecha_hora,))
        busqueda_fecha_hora = cursor.fetchone()

        if busqueda_fecha_hora:
            return dict(busqueda_fecha_hora)
        else:
            return None

    except sqlite3.Error as error:
            print(f"Error en SQLite: {error}")
            raise error


    finally:
        if conexion:
            conexion.close()













# Codigo para eliminar un turno en la bd
def eliminar_turno(turno_id):
    conexion = None

    try:
        conexion = sqlite3.connect("turnos.db")
        cursor = conexion.cursor()

        cursor.execute("DELETE FROM turnos WHERE id = ?", (turno_id,))
        borrar_id = cursor.rowcount
        conexion.commit()

        return borrar_id > 0

    except sqlite3.Error as error:
        print(f"Error en SQLite: {error}")
        raise error

    finally:
        if conexion:
            conexion.close()


# Codigo para actualizar un turno en la bd
def actualizar_turno(nombre_cliente, servicio, fecha_hora, turno_id):
    conexion = None

    try:
        conexion = sqlite3.connect("turnos.db")
        cursor = conexion.cursor()
        cursor.execute("UPDATE turnos SET nombre_cliente = ?, servicio = ?, fecha_hora = ? WHERE id = ?", (nombre_cliente, servicio, fecha_hora, turno_id))
        conexion.commit()

        return cursor.rowcount > 0

    except sqlite3.Error as error:
        print(f"Error en SQLite: {error}")
        raise error


    finally:
        if conexion:
            conexion.close()

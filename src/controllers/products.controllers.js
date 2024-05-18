import { getConnection } from '../database/connection.js'
import sql from 'mssql'
import jwt from 'jsonwebtoken'

export const getUsers = async (req, res) => {
    const pool = await getConnection();
    try {
        const result = await pool.request().query('SELECT * FROM dbo.usuarios');
        console.log(result.recordset);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send('Error getting users');
    }
}

export const getUser = async (req, res) => {
    const cedula = req.params.cedula; // Obtenemos la cédula del parámetro de la URL
    console.log(cedula)
    const pool = await getConnection();
    try {
        const result = await pool.request()
            .input('cedula', sql.VarChar, cedula) // Pasamos la cédula como parámetro
            .query('SELECT * FROM usuarios WHERE cedula = @cedula'); // Filtramos por cédula
        console.table(result.recordset);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Enviamos el primer registro encontrado
        } else {
            res.status(404).send('Usuario no encontrado'); // Si no se encuentra ningún usuario
        }
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).send('Error obteniendo usuario');
    }
}

export const getUserByEmail = async (req, res) => {
    const correo = req.params.correo; // Obtenemos el correo del parámetro de la URL
    console.log(correo)
    const pool = await getConnection();
    try {
        const result = await pool.request()
            .input('correo', sql.VarChar, correo) // Pasamos el correo como parámetro
            .query('SELECT * FROM usuarios WHERE correo = @correo'); // Filtramos por correo
        console.table(result.recordset);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Enviamos el primer registro encontrado
        } else {
            res.status(404).send('Usuario no encontrado'); // Si no se encuentra ningún usuario
        }
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).send('Error obteniendo usuario');
    }
}

export const createUser = async (req, res) => {
    console.log(req.body);
    const pool = await getConnection()
    
    const result = await pool
    .request()
    .input('nombre', sql.VarChar, req.body.nombre)
    .input('correo', sql.VarChar, req.body.correo)
    .input('cedula', sql.VarChar, req.body.cedula)
    .input('telefono', sql.VarChar, req.body.telefono)
    .input('departamento', sql.VarChar, req.body.departamento)
    .input('contrasnha', sql.VarChar, req.body.contrasnha)
    .query("INSERT INTO usuarios (nombre, correo, cedula, telefono, departamento, contrasnha) VALUES (@nombre, @correo, @cedula, @telefono, @departamento, @contrasnha)")
    res.send('Creando Usuario');
}

export const updateUser = async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool
            .request()
            .input('correo', sql.VarChar, req.body.correo)
            .input('cedula', sql.VarChar, req.body.cedula)
            .input('telefono', sql.VarChar, req.body.telefono)
            .input('departamento', sql.VarChar, req.body.departamento)
            .query("UPDATE usuarios SET correo = @correo, telefono = @telefono, departamento = @departamento WHERE cedula = @cedula");

        res.status(200).json({ message: 'Usuario Modificado' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
}


export const deleteUser = (req, res) => {
    res.send(`Eliminando Usuario ${req.params.correo}`);
}
// Define el método para el inicio de sesión
export const loginUser = async (req, res) => {
    const { correo, contrasnha } = req.body;

    // Verifica si el correo y la contraseña coinciden con algún usuario en la base de datos
    const pool = await getConnection();
    try {
        const result = await pool.request()
            .input('correo', sql.VarChar, correo)
            .input('contrasnha', sql.VarChar, contrasnha)
            .query('SELECT * FROM usuarios WHERE correo = @correo AND contrasnha = @contrasnha');

        if (result.recordset.length > 0) {
            // Si las credenciales son válidas, extrae los valores adicionales de la base de datos
            const usuario = result.recordset[0];
            
            // Construye el payload del token con los valores obtenidos de la base de datos
            const payload = {
                correo: usuario.correo,
                nombre: usuario.nombre,
                telefono: usuario.telefono,
                departamento: usuario.departamento,
                cedula: usuario.cedula
            };
            
            res.status(200).json({ message: 'Inicio de sesión exitoso', payload: payload});
        } else {
            // Si las credenciales son inválidas, se envía un mensaje de error
            res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }
    } catch (error) {
        // Si ocurre algún error durante la consulta, se envía un mensaje de error
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el inicio de sesión' });
    }
};

export const registerUser = async (req, res) => {
    const { nombre, correo, cedula, telefono, departamento, contrasnha } = req.body;

    // Verificar si el correo o la cédula ya existen en la base de datos
    const pool = await getConnection();
    try {
        const checkExistingUser = await pool.request()
            .input('correo', sql.VarChar, correo)
            .input('cedula', sql.VarChar, cedula)
            .query('SELECT COUNT(*) AS count FROM usuarios WHERE correo = @correo OR cedula = @cedula');

        const existingUserCount = checkExistingUser.recordset[0].count;

        if (existingUserCount > 0) {
            return res.status(400).json({ message: 'El correo o la cédula ya están registrados' });
        }

        // Si el correo y la cédula no existen, proceder con el registro
        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('correo', sql.VarChar, correo)
            .input('cedula', sql.VarChar, cedula)
            .input('telefono', sql.VarChar, telefono)
            .input('departamento', sql.VarChar, departamento)
            .input('contrasnha', sql.VarChar, contrasnha)
            .query('INSERT INTO usuarios (nombre, correo, cedula, telefono, departamento, contrasnha) VALUES (@nombre, @correo, @cedula, @telefono, @departamento, @contrasnha)');

        // Envía una respuesta exitosa
        res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
        // Si ocurre algún error durante la consulta, envía un mensaje de error
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el registro' });
    }
};

export const createProject = async (req, res) => {
    try {
        console.log(req.body);
        const pool = await getConnection()
        const totalproyectos = await pool.request().query('SELECT COUNT(*) AS count FROM Proyectos');
        const idProyecto = totalproyectos.recordset[0].count
        const result = await pool
        .request()
        .input('nombre', sql.VarChar, req.body.nombre_proyecto)
        .input('descripcion', sql.Text, req.body.descripcion)
        .input('fecha_inicio', sql.VarChar, req.body.fecha_inicio)
        .input('estado', sql.Int, 0)
        .input('ced_responsable', sql.VarChar, req.body.ced_responsable)
        .input("presupuesto", sql.Float, req.body.presupuesto)
        .input("recursosNecesarios", sql.Text, req.body.recursosNecesarios)
        .query("INSERT INTO Proyectos (nombre_proyecto, descripcion, fechaInicio, estado, ced_responsable, presupuesto, recursosNecesarios) VALUES (@nombre, @descripcion, @fecha_inicio, @estado, @ced_responsable, @presupuesto, @recursosNecesarios)")
        res.status(200).json({ message: 'Registro exitoso', idProyecto: idProyecto});
    } catch (error) {
        console.log("Error: ",error)
    }
}



//falta de terminar, debido a que se debe obtener el id del proyecto
export const createMeeting = async (req, res) => {
    try {
        console.log(req.body);
        const pool = await getConnection()
        const totalreuniones = await pool.request().query('SELECT COUNT(*) AS count FROM Reuniones');
        const result = await pool
        .request()
        .input('id_reunion', sql.Int, totalreuniones.recordset[0].count)
        .input('tema', sql.VarChar, req.body.tema)
        .input('fecha', sql.DateTime, req.body.fecha)
        .input('medio', sql.VarChar, req.body.medio)
        .input('id_proyecto', sql.Int, req.body.id_proyecto)
        .query("INSERT INTO Reuniones (id, fecha,nombre,medio, idProyecto) VALUES (@id_reunion, @fecha,@tema, @medio, @id_proyecto)")
        res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
        console.log("Error: ",error)
    }
}


export const getProjects = async (req, res) => {
    try {
        console.log(req.body);
        const pool = await getConnection();
        const result = await pool
        .request()
        .input('cedula', sql.VarChar, req.body.cedula)
        .query('SELECT * FROM proyectos');
        const projects = result.recordset;
        console.log(projects);
        res.json(projects);
    } catch (error) {
        console.log("Error: ",error)  
    }
}

export const getProject = async (req, res) => {
    const idProyecto = req.params.id; // Obtenemos el id del proyecto del parámetro de la URL
    console.log(idProyecto)
    const pool = await getConnection();
    try {
        const result = await pool.request()
            .input('idProyecto', sql.Int, idProyecto) // Pasamos el id del proyecto como parámetro
            .query('SELECT * FROM Proyectos WHERE idProyecto = @idProyecto'); // Filtramos por id del proyecto
        console.table(result.recordset);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Enviamos el primer registro encontrado
        } else {
            res.status(404).send('Proyecto no encontrado'); // Si no se encuentra ningún proyecto
        }
    } catch (error) {
        console.error('Error obteniendo proyecto:', error);
        res.status(500).send('Error obteniendo proyecto');
    }
}
export const getProjectsByEmail = async (req, res) => {
    const correo = req.params.correo; // Obtenemos el correo del parámetro de la URLdata
    console.log(correo)
    const pool = await getConnection();
    try {
        console.log(req.body);
        const pool = await getConnection();
        const result = await pool
        .request()
        .input('correo', sql.VarChar, correo)
        .query('select p.idProyecto, p.nombre_proyecto, p.descripcion, p.fechaInicio, p.estado, p.ced_responsable, p.presupuesto, p.recursosNecesarios from PROYECTOS P INNER JOIN COLABORADORES C ON C.idProyecto = P.idProyecto INNER JOIN USUARIOS U ON U.Cedula = C.ced_colaborador where U.correo = @correo');
        const projects = result.recordset;
        console.log(projects);
        res.json(projects);
    } catch (error) {
        console.log("Error: ",error)  
    }
}

export const updateProject = async (req, res) => {
    try {
        console.log(req.body);
        const pool = await getConnection();
        const idProyecto = req.body.id_proyecto;
        const result = await pool
        .request()
        .input('id_proyecto', sql.Int, req.body.id_proyecto)
        .input('nombre', sql.VarChar, req.body.nombre_proyecto)
        .input('descripcion', sql.Text, req.body.descripcion)
        .input('fecha_inicio', sql.VarChar, req.body.fecha_inicio)
        .input('estado', sql.Int, req.body.estado)
        .input('ced_responsable', sql.VarChar, req.body.ced_responsable)
        .input("presupuesto", sql.Float, req.body.presupuesto)
        .input("recursosNecesarios", sql.Text, req.body.recursosNecesarios)
        .query("UPDATE Proyectos SET nombre_proyecto = @nombre, descripcion = @descripcion, fechaInicio = @fecha_inicio, estado = @estado, ced_responsable = @ced_responsable, presupuesto = @presupuesto, recursosNecesarios = @recursosNecesarios WHERE idProyecto = @id_proyecto");
        res.status(200).json({ message: 'Registro exitoso', idProyecto: idProyecto});
    } catch (error) {
        console.log("Error: ",error)
    }
}
export const agregarColaborador = async (req, res) => {
    const idProyecto = req.params.idProyecto
    const cedula = req.params.cedula
    try {
        console.log(req.body);
        const pool = await getConnection();
        const totalColaboradores = await pool.request().query('SELECT COUNT(*) AS count FROM colaboradores');
        const result = await pool
        .request()
        .input('id_colaborador', sql.Int, totalColaboradores.recordset[0].count)
        .input('cedula', sql.VarChar, cedula)
        .input('id_proyecto', sql.Int, idProyecto)
        .query("INSERT INTO colaboradores ( ced_colaborador, idProyecto) VALUES (@cedula, @id_proyecto)");
        res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
        console.log("Error: ",error)
    }
}
export const deleteCollaborator = async (req, res) => {
    const idProyecto = req.params.idProyecto;
    const cedula = req.params.cedula;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('cedula', sql.VarChar, cedula)
            .input('id_proyecto', sql.Int, idProyecto)
            .query("DELETE FROM colaboradores WHERE ced_colaborador = @cedula AND idProyecto = @id_proyecto");
        res.status(200).json({ message: 'Colaborador eliminado exitosamente' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Error al intentar eliminar el colaborador' });
    }
};

export const getColaborators = async(req, res) => {
    const idProyecto = req.params.idProyecto;
    try {
        const pool = await getConnection();
        const result = await pool
        .request()
        .input('id_proyecto', sql.Int, idProyecto)
        .query("Select * from colaboradores where idProyecto = @id_proyecto");
        const colaboradores = result.recordset;
        console.log(colaboradores);
        res.json(colaboradores);
    } catch (error) {
        console.log("Error: ". error)
    }

}
export const addTask = async (req, res) => {
    try {
        console.log(req.body);
        const pool = await getConnection();
        const totalTareas = await pool.request().query('SELECT COUNT(*) AS count FROM tareas');
        const result = await pool
        .request()
        .input('nombre', sql.VarChar, req.body.nombre)
        .input('descripcion', sql.Text, req.body.descripcion)
        .input('fecha_inicio', sql.VarChar, req.body.fecha_inicio)
        .input('estado', sql.VarChar,  req.body.estado)
        .input('ced_responsable', sql.VarChar, req.body.responsable)
        .input('id_proyecto', sql.Int, req.body.id_proyecto)
        .input('tiempo_estimado', sql.VarChar, req.body.tiempo_estimado)
        .input('storypoints', sql.Int, req.body.storypoints)
        .input('recursos', sql.Text, req.body.recursos)
        .query("INSERT INTO tareas (idProyecto, nombre_Tarea, descripcion, responsable, estado, fechaInicio, tiempo_estimado, storypoints, recursos) VALUES (@id_proyecto, @nombre,@descripcion,@ced_responsable,@estado,@fecha_inicio, @tiempo_estimado, @storypoints,@recursos)");
        res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
        console.log("Error: ",error)
    }
}

export const getTasks = async (req, res) => {
    const idProyecto = req.params.idProyecto; 
    try {
        console.log(req.body);
        const pool = await getConnection();
        const result = await pool
        .request()
        .input('idProyecto', sql.Int, idProyecto)
        .query('SELECT * FROM tareas where idProyecto = @idProyecto');
        const tasks = result.recordset;
        console.log(tasks);
        res.json(tasks);
    } catch (error) {
        console.log("Error: ",error)  
    }
}

export const updateTask = async (req, res) => {
    try {
        console.log(req.body);
        const pool = await getConnection();
        const idTarea = req.params.idTarea;
        const result = await pool
        .request()
        .input('id_tarea', sql.Int, req.body.id_tarea)
        .input('nombre', sql.VarChar, req.body.nombre)
        .input('descripcion', sql.Text, req.body.descripcion)
        .input('fecha_inicio', sql.VarChar, req.body.fecha_inicio)
        .input('estado', sql.VarChar,  req.body.estado)
        .input('ced_responsable', sql.VarChar, req.body.responsable)
        .input('id_proyecto', sql.Int, req.body.id_proyecto)
        .input('tiempo_estimado', sql.VarChar, req.body.tiempo_estimado)
        .input('storypoints', sql.Int, req.body.storypoints)
        .input('recursos', sql.Text, req.body.recursos)
        .query("UPDATE tareas SET nombre_Tarea = @nombre, descripcion = @descripcion, responsable = @ced_responsable, estado = @estado, fechaInicio = @fecha_inicio, tiempo_estimado = @tiempo_estimado, storypoints = @storypoints, recursos = @recursos WHERE idTarea = @id_tarea");
        res.status(200).json({ message: 'Tarea actualizada correctamente', idTarea: idTarea});
    } catch (error) {
        console.log("Error: ",error)
    }
}

export const deleteTask = async (req, res) => {
    const idTarea = req.params.idTarea;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_tarea', sql.Int, idTarea)
            .query("DELETE FROM tareas WHERE idTarea = @id_tarea");
        res.status(200).json({ message: 'Tarea eliminada exitosamente' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Error al intentar eliminar la tarea' });
    }
}


export const createMessage = async (req, res) => {
    try {
        console.log(req.body);
        const pool = await getConnection();
        const result = await pool
        .request()
        .input('idProyecto', sql.Int, req.params.idProyecto)
        .input('nombreColaborador', sql.VarChar, req.body.nombreColaborador)
        .input('mensaje', sql.Text, req.body.mensaje)
        .query("INSERT INTO mensaje (idProyecto, nombreColaborador, mensaje) VALUES (@idProyecto, @nombreColaborador, @mensaje)");
        res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
        console.log("Error: ",error)
    }
}
export const getMessages = async (req, res) => {
    const idProyecto = req.params.idProyecto; 
    try {
        console.log(req.body);
        const pool = await getConnection();
        const result = await pool
        .request()
        .input('idProyecto', sql.Int, idProyecto)
        .query('SELECT * FROM mensaje where idProyecto = @idProyecto');
        const messages = result.recordset;
        console.log(messages);
        res.json(messages);
    } catch (error) {
        console.log("Error: ",error)  
    }
}
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

export const updateUser = (req, res) => {
    res.send(`Actualizando Usuario ${req.params.correo}`);
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
                const usuario = result.recordset[0]; // Obtener los datos del usuario autenticado
        
                // Firmar un token JWT con los datos del usuario
                const token = jwt.sign({
                    cedula: usuario.cedula,
                    correo: usuario.correo,
                    nombre: usuario.nombre,
                    departamento: usuario.departamento,
                    estado: usuario.estado,
                  // Agrega más información del usuario que desees incluir en el token
                }, jwtOptions.secretOrKey);
            res.json({ token });
            res.status(200).json({ message: 'Inicio de sesión exitoso' });
        } else {
            // Si las credenciales son inválidas, se envía un mensaje de error
            console.log("TODO A MALIDO SAL PERO BIEN")
            res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }
    } catch (error) {
        // Si ocurre algún error durante la consulta, se envía un mensaje de error
        console.log("TODO A MALIDO SAL")
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
        const result = await pool
        .request()
        .input('id_proyecto', sql.Int, totalproyectos.recordset[0].count)
        .input('nombre', sql.VarChar, req.body.nombre_proyecto)
        .input('descripcion', sql.Text, req.body.descripcion)
        .input('fecha_inicio', sql.VarChar, req.body.fecha_inicio)
        .input('estado', sql.Int, 0)
        .input('ced_responsable', sql.VarChar, req.body.ced_responsable)
        .input("presupuesto", sql.Float, req.body.presupuesto)
        .input("recursosNecesarios", sql.Text, req.body.recursosNecesarios)
        .query("INSERT INTO Proyectos (idProyecto, nombre_proyecto, descripcion, fechaInicio, estado, ced_responsable, presupuesto, recursosNecesarios) VALUES (@id_proyecto, @nombre, @descripcion, @fecha_inicio, @estado, @ced_responsable, @presupuesto, @recursosNecesarios)")
        res.status(200).json({ message: 'Registro exitoso' });
    } catch (error) {
        console.log("Error: ",error)
    }
}
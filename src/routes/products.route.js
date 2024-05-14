import { Router } from 'express';
import { createProject, createUser, deleteUser, getProjects, getUser, getUserByEmail, getUsers, loginUser, registerUser, updateUser, createMeeting, agregarColaborador, addTask, getTasks, getProjectsByEmail, getProject, getColaborators, deleteCollaborator } from '../controllers/products.controllers.js';

const router = Router();

// Rutas para usuarios
router.get('/usuarios', getUsers);
router.get('/usuarios/:cedula', getUser);
router.get('/usuarios/correo/:correo', getUserByEmail);
router.post('/usuarios', createUser);
router.put('/usuarios/:correo', updateUser);
router.delete('/usuarios/:correo', deleteUser);
router.delete('/deleteCollaborator/:idProyecto/:cedula', deleteCollaborator)
// Rutas para autenticación
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/createProject', createProject);
router.get('/getProjects', getProjects)
router.get('/getProject/:id', getProject)
router.post('/createMeeting', createMeeting)
router.get('/getProjectsByEmail/:correo', getProjectsByEmail)
router.put('/updateUser', updateUser)
router.post('/addCollaborator/:idProyecto/:cedula', agregarColaborador)
router.post('/addTask', addTask)
router.get('/getTask/:idProyecto', getTasks)
router.get('/getColaboradores/:idProyecto', getColaborators)
export default router;



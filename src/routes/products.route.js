import { Router } from 'express';
import { createProject, createUser, deleteUser, getProjects, getUser, getUserByEmail, getUsers, loginUser, registerUser, updateUser, createMeeting, agregarColaborador, addTask, getTasks, getProjectsByEmail } from '../controllers/products.controllers.js';

const router = Router();

// Rutas para usuarios
router.get('/usuarios', getUsers);
router.get('/usuarios/:cedula', getUser);
router.get('/usuarios/correo/:correo', getUserByEmail);
router.post('/usuarios', createUser);
router.put('/usuarios/:correo', updateUser);
router.delete('/usuarios/:correo', deleteUser);

// Rutas para autenticación
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/createProject', createProject);
router.get('/getProjects', getProjects)
router.get('/getProject/:id', getProjects)
router.post('/createMeeting', createMeeting)
router.get('/getProjectsByEmail/:correo', getProjectsByEmail)
router.put('/updateUser', updateUser)
router.post('/addCollaborator', agregarColaborador)
router.post('/addTask', addTask)
router.post('/getTask', getTasks)
export default router;



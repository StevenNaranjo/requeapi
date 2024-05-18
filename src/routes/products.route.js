import { Router } from 'express';
import { createProject, createUser, deleteUser, getProjects, getUser, getUserByEmail, getUsers, loginUser, registerUser, updateUser, createMeeting, agregarColaborador, addTask, getTasks, getProjectsByEmail, getProject, getColaborators, deleteCollaborator, updateTask, deleteTask, createMessage, getMessages, getAverageTimeForAllTasks, getAverageTimeForProjectTasks, getAverageResourcesPerProject, getProjectWithHighestResources } from '../controllers/products.controllers.js';

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
router.put('/updateTask/:idTarea', updateTask)
router.delete('/deleteTask/:idTarea', deleteTask)
router.post('/createMessage/:idProyecto', createMessage)
router.get('/getMessages/:idProyecto', getMessages)
router.get('/highest-resources', getProjectWithHighestResources);
router.get('/average-resources', getAverageResourcesPerProject);
router.get('/average-time/:idProyecto', getAverageTimeForProjectTasks);
router.get('/average-time', getAverageTimeForAllTasks);
export default router;



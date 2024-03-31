import { Router } from 'express';
import { createProject, createUser, deleteUser, getUser, getUserByEmail, getUsers, loginUser, registerUser, updateUser } from '../controllers/products.controllers.js';

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
export default router;

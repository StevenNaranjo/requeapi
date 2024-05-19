import app from './app.js'
import { getAverageResourcesPerProject } from './controllers/products.controllers.js'
import {consultUsers, getConnection} from './database/connection.js'
getConnection()
app.listen(1434)
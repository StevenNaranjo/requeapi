import app from './app.js'
import {consultUsers, getConnection} from './database/connection.js'
getConnection()

app.listen(1434)
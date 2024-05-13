import app from './app.js'
import {consultUsers, getConnection} from './database/connection.js'
console.log('Antes de cromar')
getConnection()
console.log('Despues de cromar')

app.listen(1433)
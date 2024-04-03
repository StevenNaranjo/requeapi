if(!sessionStorage.getItem('usuario')){
    location.href = 'index.html';
}
const usuario = JSON.parse(sessionStorage.getItem('usuario'));
console.log(usuario);
document.getElementById('texto').innerText = usuario.nombre;
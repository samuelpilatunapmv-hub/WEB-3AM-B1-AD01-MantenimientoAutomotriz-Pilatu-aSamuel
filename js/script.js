// --- DATOS Y USUARIOS ---
const usuarios = [
    { email: 'admin@taller.com', password: '1234', rol: 'Administrador', nombre: 'Carlos Admin' },
    { email: 'cliente@taller.com', password: '1234', rol: 'Cliente', nombre: 'Samuel Pilatuña' },
    { email: 'juan@taller.com', password: '1234', rol: 'Cliente', nombre: 'Juan Pérez' }
];

let solicitudes = JSON.parse(localStorage.getItem('solicitudesAutoSam')) || [
    { id: 1, emailCliente: 'cliente@taller.com', placa: 'ABC-1234', marca: 'Chevrolet', modelo: 'Aveo', anio: 2021, kilometraje: 35000, servicio: 'Mantenimiento Preventivo', fecha: '2026-11-20', hora: '10:00', observaciones: 'Cambio de aceite y filtros', estado: 'Pendiente' }
];

let usuarioActual = JSON.parse(localStorage.getItem('usuarioActualAutoSam')) || null;

// Elementos DOM
const formLogin = document.getElementById('form-login');
const formSolicitud = document.getElementById('form-solicitud');

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Establecer fecha mínima en el input de fecha (hoy en adelante)
    const inputFecha = document.getElementById('fecha');
    if (inputFecha) {
        const hoy = new Date().toISOString().split('T')[0];
        inputFecha.setAttribute('min', hoy);
    }

    if (usuarioActual) {
        irAlPanel();
    } else {
        mostrarSeccion('seccion-inicio');
    }

    // Evento para colapsar/abrir la barra lateral (sidebar)
    const sidebarCollapseBtn = document.getElementById('sidebarCollapse');
    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }
});

// Función para cambiar de vista pública limpiamente
window.mostrarSeccion = function(idSeccion) {
    if (usuarioActual) {
        irAlPanel();
        return;
    }

    const secciones = document.querySelectorAll('.vista-seccion');
    secciones.forEach(sec => sec.classList.add('d-none'));

    document.getElementById('contenedor-sistema-interno').classList.add('d-none');
    document.getElementById('navbar-publico').classList.remove('d-none');
    document.getElementById('footer-principal').classList.remove('d-none');

    let target = document.getElementById(idSeccion);
    if (target) {
        target.classList.remove('d-none');
        window.scrollTo(0, 0);
    }
};

// Cambiar vistas dentro del panel interno (Solicitudes vs Perfil)
window.cambiarVistaPanel = function(vista) {
    const panelCliente = document.getElementById('seccion-panel-cliente');
    const panelAdmin = document.getElementById('seccion-panel-admin');
    const panelPerfil = document.getElementById('seccion-perfil-usuario');

    panelCliente.classList.add('d-none');
    panelAdmin.classList.add('d-none');
    panelPerfil.classList.add('d-none');

    if (vista === 'perfil') {
        panelPerfil.classList.remove('d-none');
        document.getElementById('perfil-nombre').textContent = usuarioActual.nombre;
        document.getElementById('perfil-rol').textContent = `Rol en el sistema: ${usuarioActual.rol}`;
        document.getElementById('perfil-email').textContent = usuarioActual.email;
    } else {
        if (usuarioActual.rol === 'Administrador') {
            panelAdmin.classList.remove('d-none');
            renderizarTablaAdmin();
        } else {
            panelCliente.classList.remove('d-none');
            renderizarTablaCliente();
        }
    }
    window.scrollTo(0, 0);
};

// Redirigir al panel interno
window.irAlPanel = function() {
    if (!usuarioActual) {
        mostrarSeccion('seccion-login');
        return;
    }

    document.getElementById('navbar-publico').classList.add('d-none');
    document.getElementById('footer-principal').classList.add('d-none');

    const secciones = document.querySelectorAll('.vista-seccion');
    secciones.forEach(sec => sec.classList.add('d-none'));

    document.getElementById('contenedor-sistema-interno').classList.remove('d-none');
    document.getElementById('sidebar-rol-text').textContent = `Rol: ${usuarioActual.rol}`;

    cambiarVistaPanel('solicitudes');
};

// Manejar Inicio de Sesión
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

    if (usuarioEncontrado) {
        usuarioActual = usuarioEncontrado;
        localStorage.setItem('usuarioActualAutoSam', JSON.stringify(usuarioActual));
        
        Swal.fire({
            title: '¡Bienvenido!',
            text: `Hola, ${usuarioActual.nombre} (${usuarioActual.rol})`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });

        formLogin.reset();
        irAlPanel();
    } else {
        Swal.fire('Error', 'Correo o contraseña incorrectos', 'error');
    }
});

// Cerrar Sesión
window.cerrarSesion = function() {
    usuarioActual = null;
    localStorage.removeItem('usuarioActualAutoSam');
    document.getElementById('contenedor-sistema-interno').classList.add('d-none');
    document.getElementById('navbar-publico').classList.remove('d-none');
    document.getElementById('footer-principal').classList.remove('d-none');
    mostrarSeccion('seccion-inicio');
    Swal.fire('Sesión cerrada', 'Has salido del sistema exitosamente', 'info');
};

// Renderizar Tabla para Cliente
function renderizarTablaCliente() {
    const contenedor = document.getElementById('tabla-cliente-container');
    const misSolicitudes = solicitudes.filter(s => s.emailCliente === usuarioActual.email);

    if (misSolicitudes.length === 0) {
        contenedor.innerHTML = `<div class="alert alert-info text-center py-4 mb-0">No tienes solicitudes registradas. ¡Haz clic en registrar nueva solicitud!</div>`;
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Placa</th>
                        <th>Vehículo</th>
                        <th>Servicio</th>
                        <th>Fecha y Hora</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;

    misSolicitudes.forEach(s => {
        html += `
            <tr>
                <td class="fw-bold">#${s.id}</td>
                <td><span class="badge bg-secondary">${s.placa}</span></td>
                <td>${s.marca} ${s.modelo} (${s.anio})</td>
                <td>${s.servicio}</td>
                <td>${s.fecha} - ${s.hora}</td>
                <td><span class="badge bg-info text-dark">${s.estado}</span></td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;
}

// Renderizar Tabla para Administrador
function renderizarTablaAdmin() {
    const contenedor = document.getElementById('tabla-admin-container');

    if (solicitudes.length === 0) {
        contenedor.innerHTML = `<div class="alert alert-success text-center py-4 mb-0">No hay solicitudes registradas en el sistema.</div>`;
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-success">
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Placa</th>
                        <th>Vehículo</th>
                        <th>Servicio</th>
                        <th>Fecha / Hora</th>
                        <th>Estado</th>
                        <th>Acciones Admin</th>
                    </tr>
                </thead>
                <tbody>
    `;

    solicitudes.forEach(s => {
        html += `
            <tr>
                <td class="fw-bold">#${s.id}</td>
                <td class="small text-muted">${s.emailCliente}</td>
                <td><span class="badge bg-secondary">${s.placa}</span></td>
                <td>${s.marca} ${s.modelo} (${s.anio})</td>
                <td>${s.servicio}</td>
                <td>${s.fecha} - ${s.hora}</td>
                <td><span class="badge bg-success">${s.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning mb-1 fw-semibold text-dark" onclick="cambiarEstado(${s.id})"><i class="bi bi-pencil-square"></i> Estado</button>
                    <button class="btn btn-sm btn-danger mb-1 fw-semibold" onclick="eliminarSolicitud(${s.id})"><i class="bi bi-trash"></i> Eliminar</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    contenedor.innerHTML = html;
}

// Registrar Solicitud con validaciones estrictas
formSolicitud.addEventListener('submit', (e) => {
    e.preventDefault();

    const placa = document.getElementById('placa').value.toUpperCase().trim();
    const placaRegex = /^[A-Z]{3}-\d{4}$/;
    if (!placaRegex.test(placa)) {
        Swal.fire('Error de validación', 'El formato de la placa es inválido. Debe ser de la forma ABC-1234', 'error');
        return;
    }

    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    if (marca.length < 2 || marca.length > 30 || modelo.length < 2 || modelo.length > 30) {
        Swal.fire('Error de validación', 'La marca y el modelo deben tener entre 2 y 30 caracteres.', 'error');
        return;
    }

    const fechaInput = document.getElementById('fecha').value;
    const hoyStr = new Date().toISOString().split('T')[0];
    if (fechaInput < hoyStr) {
        Swal.fire('Fecha inválida', 'No puedes agendar una cita para un día anterior al actual.', 'error');
        return;
    }

    const horaInput = document.getElementById('hora').value;
    if (horaInput < "08:00" || horaInput > "22:00") {
        Swal.fire('Hora inválida', 'Las citas solo están disponibles en el horario de 08:00 AM a 10:00 PM.', 'error');
        return;
    }

    const nuevaSolicitud = {
        id: solicitudes.length > 0 ? solicitudes[solicitudes.length - 1].id + 1 : 1,
        emailCliente: usuarioActual.email,
        placa: placa,
        marca: marca,
        modelo: modelo,
        anio: parseInt(document.getElementById('anio').value),
        kilometraje: parseInt(document.getElementById('kilometraje').value),
        servicio: document.getElementById('servicio').value,
        fecha: fechaInput,
        hora: horaInput,
        observaciones: document.getElementById('observaciones').value.trim(),
        estado: 'Pendiente'
    };

    solicitudes.push(nuevaSolicitud);
    localStorage.setItem('solicitudesAutoSam', JSON.stringify(solicitudes));

    const modalElement = document.getElementById('modalSolicitud');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    formSolicitud.reset();
    cambiarVistaPanel('solicitudes');
    Swal.fire('¡Éxito!', 'Solicitud de mantenimiento registrada correctamente', 'success');
});

// Admin: Eliminar Solicitud
window.eliminarSolicitud = function(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Esta acción eliminará el registro permanentemente!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            solicitudes = solicitudes.filter(s => s.id !== id);
            localStorage.setItem('solicitudesAutoSam', JSON.stringify(solicitudes));
            renderizarTablaAdmin();
            Swal.fire('¡Eliminado!', 'La solicitud ha sido eliminada del sistema.', 'success');
        }
    });
};

// Admin: Cambiar Estado
window.cambiarEstado = async function(id) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const { value: nuevoEstado } = await Swal.fire({
        title: 'Actualizar Estado de Atención',
        input: 'select',
        inputOptions: {
            'Pendiente': 'Pendiente',
            'En revisión': 'En revisión',
            'En proceso': 'En proceso',
            'Finalizado': 'Finalizado',
            'Cancelado': 'Cancelado'
        },
        inputValue: solicitud.estado,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#198754'
    });

    if (nuevoEstado) {
        solicitud.estado = nuevoEstado;
        localStorage.setItem('solicitudesAutoSam', JSON.stringify(solicitudes));
        renderizarTablaAdmin();
        Swal.fire('¡Actualizado!', `El estado cambió a: ${nuevoEstado}`, 'success');
    }
};
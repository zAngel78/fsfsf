class Admin {
    constructor() {
        this.adminView = document.getElementById('admin-view');
        this.tabButtons = document.querySelectorAll('.admin-tabs .tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.crudModal = document.getElementById('crud-modal');
        this.formContainer = document.getElementById('crud-form-container');
        
        // Inicializar tabs
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        // Inicializar modal
        this.crudModal.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Inicializar filtros
        this.initializeFilters();

        // Cargar datos iniciales
        this.loadInitialData();
    }

    initializeFilters() {
        // Inicializar datepicker para filtro de fecha
        this.fechaFiltro = flatpickr('#filtro-fecha', {
            locale: 'es',
            dateFormat: 'Y-m-d',
            onChange: () => this.filterReservas()
        });

        // Event listeners para filtros
        document.getElementById('buscar-reserva').addEventListener('input', () => this.filterReservas());
        document.getElementById('filtro-estado').addEventListener('change', () => this.filterReservas());
    }

    async loadInitialData() {
        await this.loadPlazas();
        await this.loadServicios();
        await this.loadReservas();
    }

    switchTab(tabName) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    // CRUD Plazas
    async loadPlazas() {
        try {
            const response = await API.getPlazas();
            const plazas = response.plazas || [];
            
            const tbody = document.getElementById('plazas-table-body');
            tbody.innerHTML = plazas.map(plaza => `
                <tr>
                    <td>${plaza.numero}</td>
                    <td>${plaza.dimensiones}</td>
                    <td class="${plaza.activa ? 'estado-activo' : 'estado-inactivo'}">
                        ${plaza.activa ? 'Activa' : 'Inactiva'}
                    </td>
                    <td>${plaza.serviciosDisponibles.length} servicios</td>
                    <td class="crud-actions">
                        <button class="btn-action btn-edit" onclick="window.admin.editPlaza(${plaza.id})">
                            Editar
                        </button>
                        <button class="btn-action btn-toggle" onclick="window.admin.togglePlaza(${plaza.id})">
                            ${plaza.activa ? 'Desactivar' : 'Activar'}
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error al cargar plazas:', error);
        }
    }

    showPlazaForm(plaza = null) {
        const isEdit = !!plaza;
        this.formContainer.innerHTML = `
            <form class="crud-form" onsubmit="window.admin.handlePlazaSubmit(event, ${isEdit})">
                <h3>${isEdit ? 'Editar' : 'Nueva'} Plaza</h3>
                
                <div class="form-group">
                    <label for="numero">Número:</label>
                    <input type="text" id="numero" name="numero" required 
                           value="${plaza ? plaza.numero : ''}" 
                           ${isEdit ? 'readonly' : ''}>
                </div>

                <div class="form-group">
                    <label for="dimensiones">Dimensiones:</label>
                    <input type="text" id="dimensiones" name="dimensiones" required
                           value="${plaza ? plaza.dimensiones : ''}">
                </div>

                <div class="form-group">
                    <label>Servicios Disponibles:</label>
                    <div id="servicios-checkbox"></div>
                </div>

                <div class="btn-group">
                    <button type="button" class="btn-cancel" onclick="window.admin.closeModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary">
                        ${isEdit ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        `;

        // Cargar servicios para checkboxes
        this.loadServiciosCheckbox(plaza?.serviciosDisponibles || []);
        this.openModal();
    }

    async loadServiciosCheckbox(selectedServices = []) {
        try {
            const response = await API.getServicios();
            const servicios = response.categorias.flatMap(cat => cat.servicios) || [];
            
            const container = document.getElementById('servicios-checkbox');
            container.innerHTML = servicios.map(servicio => `
                <label>
                    <input type="checkbox" name="servicios[]" value="${servicio.id}"
                           ${selectedServices.includes(servicio.id) ? 'checked' : ''}>
                    ${servicio.nombre}
                </label>
            `).join('');
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    }

    async handlePlazaSubmit(event, isEdit) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const plazaData = {
            numero: formData.get('numero'),
            dimensiones: formData.get('dimensiones'),
            serviciosDisponibles: Array.from(formData.getAll('servicios[]')).map(Number),
            activa: true
        };

        try {
            if (isEdit) {
                await API.actualizarServiciosPlaza(plazaData.id, plazaData.serviciosDisponibles);
            } else {
                // Aquí iría la llamada para crear plaza si se implementa
                console.log('Crear plaza:', plazaData);
            }

            this.closeModal();
            await this.loadPlazas();
        } catch (error) {
            console.error('Error al guardar plaza:', error);
            alert('Error al guardar los cambios');
        }
    }

    async editPlaza(plazaId) {
        try {
            const response = await API.getPlazas();
            const plaza = response.plazas.find(p => p.id === plazaId);
            if (!plaza) {
                throw new Error('Plaza no encontrada');
            }
            this.showPlazaForm(plaza);
        } catch (error) {
            console.error('Error al cargar plaza para editar:', error);
            alert('Error al cargar los datos de la plaza');
        }
    }

    async togglePlaza(plazaId) {
        try {
            const response = await API.getPlazas();
            const plaza = response.plazas.find(p => p.id === plazaId);
            if (!plaza) {
                throw new Error('Plaza no encontrada');
            }

            await API.actualizarEstadoPlaza(plazaId, !plaza.activa);
            await this.loadPlazas();
        } catch (error) {
            console.error('Error al cambiar estado de plaza:', error);
            alert('Error al cambiar el estado');
        }
    }

    // CRUD Servicios
    async loadServicios() {
        try {
            const response = await API.getServicios();
            const categorias = response.categorias || [];
            
            const tbody = document.getElementById('servicios-table-body');
            tbody.innerHTML = categorias.flatMap(categoria => 
                categoria.servicios.map(servicio => `
                    <tr>
                        <td>${categoria.nombre}</td>
                        <td>${servicio.nombre}</td>
                        <td>${servicio.precio}€</td>
                        <td class="${servicio.activo ? 'estado-activo' : 'estado-inactivo'}">
                            ${servicio.activo ? 'Activo' : 'Inactivo'}
                        </td>
                        <td class="crud-actions">
                            <button class="btn-action btn-edit" onclick="window.admin.editServicio(${servicio.id})">
                                Editar
                            </button>
                            <button class="btn-action btn-toggle" onclick="window.admin.toggleServicio(${servicio.id})">
                                ${servicio.activo ? 'Desactivar' : 'Activar'}
                            </button>
                        </td>
                    </tr>
                `)
            ).join('');
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    }

    showServicioForm(servicio = null) {
        const isEdit = !!servicio;
        this.formContainer.innerHTML = `
            <form class="crud-form" onsubmit="window.admin.handleServicioSubmit(event, ${isEdit})">
                <h3>${isEdit ? 'Editar' : 'Nuevo'} Servicio</h3>
                
                <div class="form-group">
                    <label for="categoria">Categoría:</label>
                    <select id="categoria" name="categoria" required>
                        <option value="1">Pernocta</option>
                        <option value="2">Vaciados</option>
                        <option value="3">Otros Servicios</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" required
                           value="${servicio ? servicio.nombre : ''}">
                </div>

                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" name="precio" step="0.01" required
                           value="${servicio ? servicio.precio : ''}">
                </div>

                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" name="descripcion" rows="3">${servicio ? servicio.descripcion : ''}</textarea>
                </div>

                <div class="btn-group">
                    <button type="button" class="btn-cancel" onclick="window.admin.closeModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary">
                        ${isEdit ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        `;

        if (servicio) {
            document.getElementById('categoria').value = servicio.categoriaId;
        }

        this.openModal();
    }

    async handleServicioSubmit(event, isEdit) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const servicioData = {
            categoriaId: parseInt(formData.get('categoria')),
            nombre: formData.get('nombre'),
            precio: parseFloat(formData.get('precio')),
            descripcion: formData.get('descripcion'),
            activo: true
        };

        try {
            if (isEdit) {
                await API.updateServicio(servicioData.id, servicioData);
            } else {
                await API.createServicio(servicioData);
            }

            this.closeModal();
            await this.loadServicios();
        } catch (error) {
            console.error('Error al guardar servicio:', error);
            alert('Error al guardar los cambios');
        }
    }

    async toggleServicio(servicioId) {
        try {
            const response = await API.getServicios();
            let servicio;
            
            // Buscar el servicio en todas las categorías
            for (const categoria of response.categorias) {
                servicio = categoria.servicios.find(s => s.id === servicioId);
                if (servicio) break;
            }

            if (!servicio) {
                throw new Error('Servicio no encontrado');
            }

            await API.toggleServicioEstado(servicioId, !servicio.activo);
            await this.loadServicios();
        } catch (error) {
            console.error('Error al cambiar estado del servicio:', error);
            alert('Error al cambiar el estado');
        }
    }

    // CRUD Reservas
    async loadReservas() {
        try {
            const response = await API.getReservas();
            this.reservas = response.reservas || [];
            this.renderReservas(this.reservas);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
        }
    }

    renderReservas(reservas) {
        const tbody = document.getElementById('reservas-table-body');
        tbody.innerHTML = reservas.map(reserva => `
            <tr>
                <td>Plaza ${reserva.plazaId}</td>
                <td>${reserva.nombre}</td>
                <td>${reserva.fechaEntrada}</td>
                <td>${reserva.fechaSalida}</td>
                <td>${reserva.total}€</td>
                <td class="estado-${reserva.estado}">${reserva.estado}</td>
                <td class="crud-actions">
                    <button class="btn-action btn-edit" onclick="window.admin.showReservaDetails(${reserva.id})">
                        Ver Detalles
                    </button>
                    <button class="btn-action btn-toggle" onclick="window.admin.updateReservaStatus(${reserva.id})">
                        Cambiar Estado
                    </button>
                </td>
            </tr>
        `).join('');
    }

    filterReservas() {
        const searchTerm = document.getElementById('buscar-reserva').value.toLowerCase();
        const estado = document.getElementById('filtro-estado').value;
        const fecha = this.fechaFiltro.selectedDates[0];

        let filteredReservas = this.reservas;

        if (searchTerm) {
            filteredReservas = filteredReservas.filter(reserva => 
                reserva.nombre.toLowerCase().includes(searchTerm) ||
                reserva.email.toLowerCase().includes(searchTerm)
            );
        }

        if (estado) {
            filteredReservas = filteredReservas.filter(reserva => 
                reserva.estado === estado
            );
        }

        if (fecha) {
            const fechaStr = this.formatDate(fecha);
            filteredReservas = filteredReservas.filter(reserva => 
                reserva.fechaEntrada <= fechaStr && reserva.fechaSalida >= fechaStr
            );
        }

        this.renderReservas(filteredReservas);
    }

    showReservaDetails(reservaId) {
        const reserva = this.reservas.find(r => r.id === reservaId);
        if (!reserva) return;

        this.formContainer.innerHTML = `
            <div class="crud-form">
                <h3>Detalles de Reserva</h3>
                
                <div class="form-group">
                    <label>Plaza:</label>
                    <p>Plaza ${reserva.plazaId}</p>
                </div>

                <div class="form-group">
                    <label>Cliente:</label>
                    <p>${reserva.nombre}</p>
                    <p>${reserva.email}</p>
                    <p>${reserva.telefono}</p>
                </div>

                <div class="form-group">
                    <label>Fechas:</label>
                    <p>Entrada: ${reserva.fechaEntrada}</p>
                    <p>Salida: ${reserva.fechaSalida}</p>
                </div>

                <div class="form-group">
                    <label>Servicios:</label>
                    <ul>
                        ${reserva.serviciosContratados.map(servicio => `
                            <li>${servicio.nombre} (${servicio.categoria}) - ${servicio.precio}€</li>
                        `).join('')}
                    </ul>
                </div>

                <div class="form-group">
                    <label>Total:</label>
                    <p>${reserva.total}€</p>
                </div>

                <div class="form-group">
                    <label>Estado:</label>
                    <select id="reserva-estado" class="form-control">
                        <option value="pendiente" ${reserva.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="confirmada" ${reserva.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                        <option value="cancelada" ${reserva.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </div>

                <div class="btn-group">
                    <button type="button" class="btn-cancel" onclick="window.admin.closeModal()">
                        Cerrar
                    </button>
                    <button type="button" class="btn-primary" 
                            onclick="window.admin.updateReservaStatus(${reserva.id}, document.getElementById('reserva-estado').value)">
                        Guardar Estado
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    async updateReservaStatus(reservaId, newStatus) {
        try {
            await API.actualizarEstadoReserva(reservaId, newStatus);
            this.closeModal();
            await this.loadReservas();
        } catch (error) {
            console.error('Error al actualizar estado de reserva:', error);
            alert('Error al actualizar el estado');
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    openModal() {
        this.crudModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.crudModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new Admin();
}); 
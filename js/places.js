class Places {
    constructor() {
        this.placesGrid = document.getElementById('places-grid');
        this.placeModal = document.getElementById('place-modal');
        this.placeDetails = document.getElementById('place-details');
        this.selectedPlace = null;

        // Event listeners
        this.placeModal.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Cerrar modal al hacer clic fuera
        this.placeModal.addEventListener('click', (e) => {
            if (e.target === this.placeModal) {
                this.closeModal();
            }
        });

        // Escuchar cambios en el hash para cerrar el modal si se navega
        window.addEventListener('hashchange', () => {
            if (this.placeModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    async showPlaces(date) {
        try {
            console.log('Mostrando plazas para fecha:', date);
            // Obtener estado de las plazas para la fecha seleccionada
            const response = await API.getPlazasDisponibles(date, date);
            console.log('Respuesta plazas:', response);
            const plazasOcupadas = response.plazas ? 
                response.plazas.filter(p => !p.activa).map(p => p.numero) : [];

            this.placesGrid.innerHTML = '';

            // Mostrar siempre las 18 plazas
            for (let i = 1; i <= 18; i++) {
                const numero = `P${i}`;
                const isOcupada = plazasOcupadas.includes(numero);

                const placeCard = document.createElement('div');
                placeCard.className = `place-card ${isOcupada ? 'unavailable' : 'available'}`;
                placeCard.innerHTML = `
                    <h4>Plaza ${numero}</h4>
                    <div class="place-info">
                        <p>Estado: ${isOcupada ? 'No disponible' : 'Disponible'}</p>
                    </div>
                `;

                if (!isOcupada) {
                    placeCard.addEventListener('click', () => {
                        this.showPlaceDetails(numero, date);
                    });
                }

                this.placesGrid.appendChild(placeCard);
            }
        } catch (error) {
            console.error('Error al cargar plazas:', error);
            this.placesGrid.innerHTML = '<p>Error al cargar las plazas</p>';
        }
    }

    async showPlaceDetails(numero, date) {
        try {
            console.log('Mostrando detalles de plaza:', numero, 'fecha:', date);
            // Obtener categorías de servicios
            const response = await API.getServicios();
            console.log('Respuesta servicios:', response);
            const categorias = response.categorias || [];
            
            let serviciosHTML = '';
            let precioTotal = 0;

            // Generar HTML para cada categoría de servicios
            categorias.forEach(categoria => {
                const serviciosActivos = categoria.servicios.filter(s => s.activo);
                if (serviciosActivos.length > 0) {
                    serviciosHTML += `
                        <div class="categoria-servicios">
                            <h4>${categoria.nombre}</h4>
                            <ul class="servicios-lista">
                                ${serviciosActivos.map(servicio => {
                                    if (categoria.nombre === 'Pernocta') {
                                        precioTotal += servicio.precio; // Añadir precio base
                                    }
                                    return `
                                        <li>
                                            <label class="servicio-item">
                                                <input type="checkbox" 
                                                       value="${servicio.id}" 
                                                       data-precio="${servicio.precio}"
                                                       data-nombre="${servicio.nombre}"
                                                       data-categoria="${categoria.nombre}"
                                                       ${categoria.nombre === 'Pernocta' ? 'checked disabled' : ''}
                                                       onchange="window.places.updatePrecio(this)">
                                                ${servicio.nombre} - ${servicio.precio}€/día
                                                <small>${servicio.descripcion}</small>
                                            </label>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                    `;
                }
            });

            this.placeDetails.innerHTML = `
                <h3>Plaza ${numero}</h3>
                <div class="place-details-info">
                    <div class="servicios-disponibles">
                        ${serviciosHTML}
                    </div>
                    <div class="precio-info">
                        <p class="precio-total">Total por día: <span id="precio-total">${precioTotal}</span>€</p>
                    </div>
                    <button class="btn-primary" onclick="window.places.iniciarReserva('${numero}', '${date}')">
                        Reservar Ahora
                    </button>
                </div>
            `;

            this.openModal();
        } catch (error) {
            console.error('Error al cargar detalles de la plaza:', error);
            this.placeDetails.innerHTML = '<p>Error al cargar los detalles</p>';
        }
    }

    updatePrecio(checkbox) {
        const precioTotal = document.getElementById('precio-total');
        if (!precioTotal) return;

        const precio = parseFloat(checkbox.dataset.precio);
        let total = parseFloat(precioTotal.textContent);

        if (checkbox.checked) {
            total += precio;
        } else {
            total -= precio;
        }

        precioTotal.textContent = total.toFixed(2);
    }

    iniciarReserva(numero, fecha) {
        try {
            console.log('Iniciando reserva para plaza:', numero, 'fecha:', fecha);
            // Recopilar servicios seleccionados
            const serviciosSeleccionados = Array.from(
                document.querySelectorAll('.servicio-item input:checked')
            ).map(input => ({
                id: parseInt(input.value),
                nombre: input.dataset.nombre,
                categoria: input.dataset.categoria,
                precio: parseFloat(input.dataset.precio)
            }));

            // Guardar datos para el formulario
            const reservaData = {
                plaza: numero,
                fecha: fecha,
                servicios: serviciosSeleccionados,
                precioTotal: document.getElementById('precio-total').textContent
            };

            console.log('Guardando datos de reserva:', reservaData);
            sessionStorage.setItem('reserva', JSON.stringify(reservaData));

            // Cerrar el modal antes de cambiar la vista
            this.closeModal();

            // Cambiar a la vista del formulario
            setTimeout(() => {
                window.location.hash = 'reservation-form';
            }, 100);
        } catch (error) {
            console.error('Error al iniciar reserva:', error);
            alert('Error al iniciar la reserva. Por favor, inténtelo de nuevo.');
        }
    }

    openModal() {
        this.placeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.placeModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.places = new Places();
}); 
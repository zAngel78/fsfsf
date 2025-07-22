const API = {
    async getServicios() {
        const timestamp = new Date().getTime();
        const response = await fetch(`${CONFIG.API_URL}/servicios?_=${timestamp}`, {
            ...CONFIG.FETCH_OPTIONS,
            method: 'GET'
        });
        if (!response.ok) throw new Error('Error al obtener servicios');
        return response.json();
    },

    async getPlazas() {
        const timestamp = new Date().getTime();
        const response = await fetch(`${CONFIG.API_URL}/plazas?_=${timestamp}`, {
            ...CONFIG.FETCH_OPTIONS,
            method: 'GET'
        });
        if (!response.ok) throw new Error('Error al obtener plazas');
        return response.json();
    },

    async getPlazasDisponibles(fechaInicio, fechaFin) {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(
                `${CONFIG.API_URL}/plazas/disponibles?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&_=${timestamp}`,
                {
                    ...CONFIG.FETCH_OPTIONS,
                    method: 'GET'
                }
            );
            
            if (!response.ok) {
                throw new Error('Error al obtener plazas disponibles');
            }
            
            const data = await response.json();
            console.log('Respuesta plazas disponibles:', data);
            return data;
        } catch (error) {
            console.error('Error en getPlazasDisponibles:', error);
            return { plazas: [] };
        }
    },

    async getReservas(filtros = {}) {
        const params = new URLSearchParams(filtros);
        params.append('_', new Date().getTime());
        const response = await fetch(
            `${CONFIG.API_URL}/reservas?${params.toString()}`,
            {
                ...CONFIG.FETCH_OPTIONS,
                method: 'GET'
            }
        );
        if (!response.ok) throw new Error('Error al obtener reservas');
        return response.json();
    },

    async createReserva(reservaData) {
        try {
            console.log('Enviando datos de reserva:', reservaData);
            const response = await fetch(`${CONFIG.API_URL}/reservas`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'POST',
                body: JSON.stringify(reservaData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al crear reserva');
            }

            const data = await response.json();
            console.log('Respuesta createReserva:', data);
            return data;
        } catch (error) {
            console.error('Error en createReserva:', error);
            throw error;
        }
    },

    async calcularPrecio(fechaEntrada, fechaSalida, servicios) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/calcular-precio`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'POST',
                body: JSON.stringify({ fechaEntrada, fechaSalida, servicios })
            });

            if (!response.ok) {
                throw new Error('Error al calcular precio');
            }

            const data = await response.json();
            console.log('Respuesta calcularPrecio:', data);
            return data;
        } catch (error) {
            console.error('Error en calcularPrecio:', error);
            throw error;
        }
    },

    async actualizarEstadoReserva(reservaId, estado) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/reservas/${reservaId}/estado`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'PUT',
                body: JSON.stringify({ estado })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar estado de la reserva');
            }

            const data = await response.json();
            console.log('Respuesta actualizarEstadoReserva:', data);
            return data;
        } catch (error) {
            console.error('Error en actualizarEstadoReserva:', error);
            throw error;
        }
    },

    async actualizarServiciosPlaza(plazaId, servicios) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/plazas/${plazaId}/servicios`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'PUT',
                body: JSON.stringify({ servicios })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar servicios de la plaza');
            }

            const data = await response.json();
            console.log('Respuesta actualizarServiciosPlaza:', data);
            return data;
        } catch (error) {
            console.error('Error en actualizarServiciosPlaza:', error);
            throw error;
        }
    },

    async actualizarEstadoPlaza(plazaId, activa) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/plazas/${plazaId}/estado`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'PUT',
                body: JSON.stringify({ activa })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar estado de la plaza');
            }

            const data = await response.json();
            console.log('Respuesta actualizarEstadoPlaza:', data);
            return data;
        } catch (error) {
            console.error('Error en actualizarEstadoPlaza:', error);
            throw error;
        }
    },

    async createServicio(servicioData) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/servicios`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'POST',
                body: JSON.stringify(servicioData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al crear servicio');
            }

            return response.json();
        } catch (error) {
            console.error('Error en createServicio:', error);
            throw error;
        }
    },

    async updateServicio(servicioId, servicioData) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/servicios/${servicioId}`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'PUT',
                body: JSON.stringify(servicioData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al actualizar servicio');
            }

            return response.json();
        } catch (error) {
            console.error('Error en updateServicio:', error);
            throw error;
        }
    },

    async toggleServicioEstado(servicioId, activo) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/servicios/${servicioId}/estado`, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'PUT',
                body: JSON.stringify({ activo })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al cambiar estado del servicio');
            }

            return response.json();
        } catch (error) {
            console.error('Error en toggleServicioEstado:', error);
            throw error;
        }
    }
}; 
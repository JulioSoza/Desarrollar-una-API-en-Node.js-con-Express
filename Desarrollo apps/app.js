const express = require('express');
const app = express();
app.use(express.json());

// Almacenamiento de turnos (en memoria para este ejemplo)
let turnos = {
    general: [],
    prioritario: [],
    vip: []
};

// Middleware para validar turnos VIP
const validarVIP = (req, res, next) => {
    if (req.headers['codigo-vip'] === 'VIP123') {
        next();
    } else {
        res.status(400).json({ error: 'Código VIP inválido' });
    }
};

// Endpoint para crear turnos
app.post('/turno', (req, res) => {
    const { nombre, edad, tipo } = req.body;
    
    // Validaciones básicas
    if (!nombre || !edad || !tipo) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Validar tipo de turno
    if (!['general', 'prioritario', 'vip'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de turno inválido' });
    }
    
    // Validar reglas específicas
    if (tipo === 'prioritario' && edad <= 60) {
        return res.status(400).json({ error: 'Solo mayores de 60 pueden tomar turnos prioritarios' });
    }
    
    // Para VIP, usamos un middleware aparte
    if (tipo === 'vip') {
        return validarVIP(req, res, () => {
            turnos.vip.push({ nombre, edad, tipo });
            res.status(201).json({ mensaje: 'Turno VIP creado' });
        });
    }
    
    // Crear turno general o prioritario
    turnos[tipo].push({ nombre, edad, tipo });
    res.status(201).json({ mensaje: `Turno ${tipo} creado` });
});

// Endpoint para atender turnos
app.get('/atender', (req, res) => {
    // Buscar el próximo turno según prioridad
    let turnoAtendido = null;
    
    if (turnos.vip.length > 0) {
        turnoAtendido = turnos.vip.shift();
    } else if (turnos.prioritario.length > 0) {
        turnoAtendido = turnos.prioritario.shift();
    } else if (turnos.general.length > 0) {
        turnoAtendido = turnos.general.shift();
    }
    
    if (turnoAtendido) {
        res.json(turnoAtendido);
    } else {
        res.status(404).json({ mensaje: 'No hay turnos en espera' });
    }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
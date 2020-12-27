const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
    patientMobile: {
        type: String,
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
    },
    username: {
        type: String
    },
    status: {
        type: String,
        default:"unscheduled",
    },
    department: {
        type: String,
    },
    date: {
        type: String,
    },
    time: {
        type: String,
    }
});

module.exports = Consultation = mongoose.model('consultation', ConsultationSchema);
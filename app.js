var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Consultation = require('./models/Consultation');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://mongo:27018/clinicDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.get("/", function (req, res) {
  res.render("home",);
});

app.get("/pdashboard", async (req, res)=> {
  let unscheduled = await Consultation.find({status:"unscheduled",patientMobile:req.query.patientMobile});
  let completed = await Consultation.find({status:"completed",patientMobile:req.query.patientMobile});
  let patient = await Patient.findOne({mobile:req.query.patientMobile});
  let patientCount =await Consultation.find({patientMobile:req.query.patientMobile}).estimatedDocumentCount();
  res.render("patientdashboard",{completed:completed,unscheduled:unscheduled,patient:patient,patientCount:patientCount});
});

app.get("/ddashboard", async (req, res)=> {
  let unscheduled = await Consultation.find({status:"unscheduled",username:req.query.username});
  let completed = await Consultation.find({status:"completed",username:req.query.username});
  let consultationCount = await Consultation.find({username:req.query.username}).estimatedDocumentCount();
  let doctorCount =await Doctor.find({patientMobile:req.query.patientMobile}).estimatedDocumentCount();
  res.render("docdashboard",{completed:completed,unscheduled:unscheduled,username:req.query.username,doctorCount:doctorCount,consultationCount:consultationCount});
});


app.get("/dlogin", function (req, res) {
  res.render("dlogin");
});

app.get("/plogin", function (req, res) {
  res.render("plogin");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/list", async (req,res)=>{
  let doctor = await Doctor.find({});
  let patient = await Patient.find({});
  let consultation = await Consultation.find({});
  if (doctor || patient || consultation) {
      res.status(200).json({doctor:doctor,patient:patient,consultation:consultation});
  }
});


app.get('/complete',
async (req, res) => {
       await Consultation.updateOne({"_id":req.query.id},{$set:{"status":"completed"}});
          res.redirect('ddashboard?patientMobile='+req.query.patientMobile);
});

app.post('/doctorLogin',
[
  check('username', 'Username is required').not().isEmpty(),
  check(
      'password',
      'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 })
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
res.redirect('error');
  }

  const { username, password } = req.body;
  // const salt = await bcrypt.genSalt(10);

  // password = await bcrypt.hash(password, salt);
  try {
      let doctor = await Doctor.findOne({ username: username, password: password });
      if (doctor) {
          res.redirect('ddashboard?username='+username);
      }
      else{
        res.redirect('error');
      }
  } catch (err) {
    res.redirect('error');
  }
});

app.post('/patientLogin',     
[
  check('mobile', 'Mobile number is required').not().isEmpty(),
  check(
      'password',
      'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 })
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
res.redirect('error');
  }
console.log(req.body.mobile);
  const { mobile, password } = req.body;
  // const salt = await bcrypt.genSalt(10);

  // password = await bcrypt.hash(password, salt);
      let patient = await Patient.findOne({ mobile: mobile, password: password });  
      if (patient) {
          res.redirect('pdashboard?patientMobile='+mobile);
      }
      else{
        res.redirect('register');
      }
});

app.post('/bookConsultation',
async (req, res) => {
  console.log(req.body);
  const { patientName, patientMobile,symptoms, username,department,date, time } = req.body;
  // const salt = await bcrypt.genSalt(10);
  // let password = await bcrypt.hash(password, salt);
    let consultation = new Consultation({
              username,
              patientName,
              patientMobile,
              department,
              date,
              time,
              symptoms
          });
          await consultation.save();
          res.redirect('ddashboard?username='+username);});

app.post('/doctorRegister',     [
  check('username', 'Username is required').not().isEmpty(),
  check('name', 'name is required').not().isEmpty(),
  check(
      'password',
      'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 })
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
res.redirect('error');
  }
  const { name, username, password } = req.body;
  // const salt = await bcrypt.genSalt(10);
  // let password = await bcrypt.hash(password, salt);
  try {
      let doctor = await Doctor.findOne({ username:username });
      if (!doctor) {
          doctor = new Doctor({
              name,
              username,
              password
          });
          await doctor.save();
          res.redirect('ddashboard?username='+username);
        }
        else{
          res.redirect('dlogin');
        }
  } catch (err) {
    res.redirect('error');
  }
});

app.post('/patientRegister',
  [
    check('name', 'name is required').not().isEmpty(),
    check('mobile', 'Mobile number is required').not().isEmpty(),
    check(
        'password',
        'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
res.redirect('error');
    }
    console.log(req.body);
    const { name, mobile, password } = req.body;
    // const salt = await bcrypt.genSalt(10);
    // password = await bcrypt.hash(password, salt);
    try {
        let patient = await Patient.findOne({ mobile: mobile});
        if (!patient) {
            patient = new Patient({
                name,
                mobile,
                password
            });
            await patient.save();
            res.redirect('dashboard?patientMobile='+mobile);
        }
        else{
          return res.status(400).json({ errors: "Patient already exists" });
        }
    } catch (err) {
        res.redirect('error');
    }
});

app.get('*', function(req, res){
  res.render('error');
});

app.get('/error', function(req, res){
  res.redirect('error');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Server started on port" + PORT);
});


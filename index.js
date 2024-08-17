const express = require('express');
require('dotenv').config();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

mongoose.connect(process.env.MONGODB_URI);
const UserSchema = new mongoose.Schema({
    "userId": {type:String, },
    "currentStep": {type:String},
    "data": {
      "candidateName": {type:String},
      "position": {type:String},
      "salary": {type:String},
      "startDate": {type:String},
      "companyName": {type:String},
      "hiringManagerName": {type:String},
      "additionalTerms": {type:String}
    }
});

const User = mongoose.model('JobOfferLetter', UserSchema);

const app = express();

async function getUser(userId){
  let user = await User.findOne({userId: userId});
  if(!user){
    const newUser = new User({
      userId:userId,
      currentStep:"start",
      data:{
        candidateName:"",
        position: "",
        salary: "",
        startDate: "",
        companyName: "",
        hiringManagerName: "",
        additionalTerms: ""
      }
    });
  
    user = await newUser.save();
  }

  return user;
}


async function generatePDF(data) {
  const pdfDirectory = path.join(__dirname, 'pdfs');
  if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory);
  }

  const doc = new PDFDocument();
  const pdfPath = path.join(pdfDirectory, 'job_offer_letter.pdf');

  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(25).text('Job Offer Letter', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Dear ${data.candidateName},`);
  doc.moveDown();
  doc.text(`We are pleased to offer you the position of ${data.position} at ${data.companyName}.`);
  doc.moveDown();
  doc.text(`Salary: ${data.salary}`);
  doc.moveDown();
  doc.text(`Start Date: ${data.startDate}`);
  doc.moveDown();
  doc.text(`Hiring Manager: ${data.hiringManagerName}`);
  if (data.additionalTerms && data.additionalTerms.toLowerCase() !== 'none') {
    doc.moveDown();
    doc.text(`Additional Terms: ${data.additionalTerms}`);
  }
  doc.moveDown();
  doc.text(`We look forward to having you on our team.`);
  doc.moveDown();
  doc.text(`Sincerely,`);
  doc.text(data.hiringManagerName);
  doc.text(data.companyName);

  doc.end();

  return pdfPath;
}


app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/whatsapp', async (req, res) => {
  const twiml = new MessagingResponse();
  const userId = req.body.From;
  const userState = await getUser(userId);

  const response = req.body.Body;

  if(response.trim().toLowerCase() == "hi"){
    twiml.message("Welcome to the Job Offer Letter Generator Bot! How can I assist you today?\n1. Create New Offer Letter\n2. View Last Offer Letter");
    userState.currentStep = "name";
  }
  else if(userState.currentStep === "name"){
    if(response == '1'||response.trim().toLowerCase() == "create new offer letter"){
      twiml.message("Please enter the candidate's name.");
      userState.currentStep = "position";
    }
    if(response == '2'||response.trim().toLowerCase() == "view last offer letter"){
      userState.currentStep = "end";
      const pdfPath = await generatePDF(userState.data);
      const mediaUrl = `https://8612-103-159-214-189.ngrok-free.app/pdfs/${path.basename(pdfPath)}`;
      console.log("Media URL:", mediaUrl);
      twiml.message('Here is your job offer letter PDF:').media(mediaUrl);
    }
  }
  else if(userState.currentStep === "position"){
    userState.data.candidateName = response;
    twiml.message("Please enter the position being offered.");
    userState.currentStep = "salary";
  }
  else if(userState.currentStep === "salary"){
    userState.data.position = response;
    twiml.message("Please enter the salary being offered (e.g., $80,000 per annum).");
    userState.currentStep = "startDate";
  }
  else if(userState.currentStep === "startDate"){
    userState.data.salary = response;
    twiml.message("Please enter the start date (e.g., YYYY-MM-DD).");
    userState.currentStep = "companyName";
  }
  else if(userState.currentStep === "companyName"){
    userState.data.startDate = response;
    twiml.message("Please enter the company name.");
    userState.currentStep = "managerName";
  }
  else if(userState.currentStep === "managerName"){
    userState.data.companyName = response;
    twiml.message("Please enter the hiring manager's name.");
    userState.currentStep = "additional";
  }
  else if(userState.currentStep === "additional"){
    userState.data.hiringManagerName = response;
    twiml.message('Please enter any additional terms or type "none".');
    userState.currentStep = "end";
  }
  else{
    userState.data.additionalTerms = response;
    const pdfPath = await generatePDF(userState.data);
    const mediaUrl = `https://8612-103-159-214-189.ngrok-free.app/pdfs/${path.basename(pdfPath)}`;
    twiml.message('Here is your job offer letter PDF:').media(mediaUrl);
  }

  await userState.save();
  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});

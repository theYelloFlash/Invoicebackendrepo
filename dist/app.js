"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_js_1 = __importDefault(require("./db.js"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const port = 8002;
let app = (0, express_1.default)();
(0, db_js_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// app.get('/', (req, res) => { 
//     res.sendFile('/home/pulse11/Angular/invoice/src/app/app.component.html');
// })
const invoice_Schema = new mongoose_1.default.Schema({
    myinfo: Object,
    buyersInfo: Object,
    product: [{
            itemName: String,
            itemquantity: String,
            itemAmount: String
        }]
    // Mutable Unbounded Arrays in mongo db
});
const invoice_Model = mongoose_1.default.model('file', invoice_Schema);
// const product_Model = mongoose.model('product' , productSchema);
app.post('/invoice', (req, res) => {
    // console.log('Received form submission:', req.body);
    // res.json({ message: 'Form submitted successfully!' });
    const newInvoice = new invoice_Model({
        myinfo: req.body.yourInfo,
        buyersInfo: req.body.customerInfo,
        product: req.body.itemFormArray
    });
    // console.log(newInvoice);
    // const newProduct = new product_Model({
    // }
    let total_item_Quantity = 0;
    let total_Ammount = 0;
    newInvoice.product.forEach((element) => {
        total_item_Quantity += parseInt(element.itemquantity) || 0;
    });
    // console.log(total_item_Quantity);
    newInvoice.product.forEach((element) => {
        total_Ammount += parseInt(element.itemAmount) || 0;
    });
    // console.log(newInvoice._id);
    res.json({
        message: "total quantity and total Ammount",
        totalAmmount: total_Ammount,
        totalQuantity: total_item_Quantity,
        invoice_id: newInvoice._id
    });
    // console.log(inv)
    // let product : Object[] = newInvoice.product;
    // let total_quantity = totalQuantity(product);
    // let total_Ammount = totalAmmount(product);
    // if(total_Ammount > 20000 || total_quantity > 10){
    //     total_Ammount = discount(total_Ammount);
    // }
    // console.log(total_quantity);
    // console.log(total_Ammount);
    newInvoice.save();
    // console.log("Database", newInvoice);
});
app.post('/get-data-by-id', async (req, res) => {
    const id = req.body.id;
    console.log(req.body.id);
    try {
        // Find the invoice in the database by ID
        const invoice_data = await invoice_Model.findById(id);
        // Check if the invoice is found
        if (!invoice_data) {
            return res.status(404).json({ error: 'Invoice not found in the database' });
        }
        // If the invoice is found, send the response with the data
        res.json(invoice_data);
    }
    catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.put('/update-invoice/:id', async (req, res) => {
    console.log(req.body);
    console.log(req.params.id);
    const id = req.params.id;
    const updatedData = schemaForDataUpdation(req.body);
    const updatedInvoice = await invoice_Model.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedInvoice);
    console.log(updatedInvoice);
});
function schemaForDataUpdation(body) {
    return {
        myinfo: {
            firstName: body.firstName,
            lastName: body.LastName,
            address: body.address,
            phone: body.phone,
            email: body.email,
        },
        buyersInfo: {
            cName: body.customerName,
            cLasrName: body.customerLastName,
            cAddress: body.customerAddress,
            cPhone: body.customerPhone,
            cEmail: body.customerEmail,
        }
    };
}
app.get('/get-collection', async (req, res) => {
    try {
        const allInvoices = await invoice_Model.find();
        res.json(allInvoices);
    }
    catch (error) {
        console.log(error);
    }
});
const pdfsDirectory = path_1.default.join(__dirname, 'pdfs');
if (!fs_1.default.existsSync(pdfsDirectory)) {
    fs_1.default.mkdirSync(pdfsDirectory);
}
``;
app.post('/getpdf', async (req, res) => {
    try {
        console.log("PDF Api got hit");
        // console.log(req.body.htmlContent);
        // console.log(req.body.style);
        const htmlContent = req.body.htmlContent;
        const style = req.body.style;
        const browser = await puppeteer_1.default.launch();
        const page = await browser.newPage();
        await page.setContent(`<html><head><style> ${style} </style></head> <body>  ${htmlContent} </body><html>`);
        const outputPath = path_1.default.join(__dirname, 'pdfs', `output_${Date.now()}.pdf`);
        await page.pdf({ path: outputPath, format: 'A4' });
        await browser.close();
        res.json({ pdfPath: outputPath });
    }
    catch (e) {
        console.log(e);
    }
});
const credentials_arr = [
    {
        userName: "senakshay71@gmail.com",
        password: "1234"
    },
    {
        userName: "vanya",
        password: "1234"
    },
    {
        userName: "lennister",
        password: "1234"
    }
];
app.post('/login-details', async (req, res) => {
    let userDetails = {
        userName: req.body.username,
        password: req.body.password
    };
    let result = false;
    let userName = userDetails.userName;
    credentials_arr.forEach((element, index) => {
        if (userName === element.userName && userDetails.password === element.password) {
            result = true;
        }
    });
    res.send({ result });
});
app.post('/send-email', async (req, res) => {
    console.log("Email api got hit");
    const cEmail = req.body.email;
    const htmlContent = req.body.htmlContent;
    const style = req.body.style;
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.setContent(`<html><head><style> ${style} </style></head> <body>  ${htmlContent} </body><html>`);
    const outputPath = path_1.default.join(__dirname, 'pdfs', `output_${Date.now()}.pdf`);
    await page.pdf({ path: outputPath, format: 'A4' });
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'blanche.bernhard97@ethereal.email',
            pass: 'MQbTJ5sEZHzxZ1Ww4C'
        }
    });
    let mailOptions = {
        from: '"Akshay Sen" <blanche.bernhard97@ethereal.email>',
        to: cEmail,
        subject: 'Invoice of the transaction',
        text: 'This is a plain text sample mail testing',
        html: req.body.htmlContent,
        attachments: [
            {
                filename: `output_${Date.now()}.pdf`,
                path: outputPath,
                contentType: 'application/pdf'
            }
        ]
    };
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent : %s', info, info.messageId);
    res.json(info);
});
function totalQuantity(obj) {
    let quantity_sum = 0;
    for (let k in obj) {
        if (k.includes("quantity")) {
            quantity_sum += obj[k];
        }
    }
    return quantity_sum;
}
function totalAmmount(obj) {
    let ammount_sum = 0;
    const key = 'key';
    for (let k in obj) {
        if (k.includes("amount")) {
            ammount_sum += obj[k];
        }
    }
    return ammount_sum;
}
function discount(ammount) {
    return ammount - (ammount * (.10));
}
app.delete('/invoice-delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        // Check if the provided ID is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        // Attempt to delete the invoice
        const deletedInvoice = await invoice_Model.findByIdAndDelete(id);
        if (!deletedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted successfully', deletedInvoice });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.listen(port, () => {
    console.log("server is running on port");
});

import express, { Request, Response } from "express";
import bodyParser from 'body-parser'
import path from "path";
import fs from "fs";
import PDFDocument from 'pdfkit';
import cors from 'cors'
import mongoose, { Schema, Model, Document, mongo } from "mongoose";
import db from "./db.js";
import { MongoClient, ObjectId } from "mongodb";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer"



const port = 8002;

let app = express();

db();
app.use(cors());
app.use(bodyParser.json());
// app.get('/', (req, res) => { 
//     res.sendFile('/home/pulse11/Angular/invoice/src/app/app.component.html');
// })

const invoice_Schema = new mongoose.Schema({
    myinfo: Object,
    buyersInfo: Object,
    product: [{
        itemName: String,
        itemquantity: String,
        itemAmount: String
    }]
    // Mutable Unbounded Arrays in mongo db
})


const invoice_Model = mongoose.model('file', invoice_Schema);
// const product_Model = mongoose.model('product' , productSchema);


app.post('/invoice', (req: Request, res: Response) => {
    // console.log('Received form submission:', req.body);
    // res.json({ message: 'Form submitted successfully!' });

    const newInvoice = new invoice_Model({
        myinfo: req.body.yourInfo,
        buyersInfo: req.body.customerInfo,
        product: req.body.itemFormArray
    })
    // console.log(newInvoice);
    // const newProduct = new product_Model({

    // }
    let total_item_Quantity: number = 0;
    let total_Ammount: number = 0;

    newInvoice.product.forEach((element) => {
        total_item_Quantity += parseInt(element.itemquantity!) || 0;
    })

    // console.log(total_item_Quantity);

    newInvoice.product.forEach((element) => {
        total_Ammount += parseInt(element.itemAmount!) || 0;
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


app.post('/get-data-by-id', async (req: Request, res: Response) => {
    const id = req.body.id;
    console.log(req.body.id)
    try {
        // Find the invoice in the database by ID
        const invoice_data = await invoice_Model.findById(id);

        // Check if the invoice is found
        if (!invoice_data) {
            return res.status(404).json({ error: 'Invoice not found in the database' });
        }

        // If the invoice is found, send the response with the data
        res.json(invoice_data);

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})



app.put('/update-invoice/:id', async (req: Request, res: Response) => {
    console.log(req.body);
    console.log(req.params.id);
    const id = req.params.id;
    const updatedData = schemaForDataUpdation(req.body);
    const updatedInvoice = await invoice_Model.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedInvoice);
    console.log(updatedInvoice);
});


function schemaForDataUpdation(body: any) {
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
    }
}

app.get('/get-collection', async (req: Request, res: Response) => {
    try {
        const allInvoices = await invoice_Model.find();
        res.json(allInvoices);
    } catch (error) {
        console.log(error);
    }
})

const pdfsDirectory = path.join(__dirname, 'pdfs');
if (!fs.existsSync(pdfsDirectory)) {
    fs.mkdirSync(pdfsDirectory);
}

``
app.post('/getpdf', async (req: Request, res: Response) => {
    try {
        console.log("PDF Api got hit");
        // console.log(req.body.htmlContent);
        // console.log(req.body.style);
        const htmlContent = req.body.htmlContent;
        const style = req.body.style;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(
            `<html><head><style> ${style} </style></head> <body>  ${htmlContent} </body><html>`
        )

        const outputPath = path.join(__dirname, 'pdfs', `output_${Date.now()}.pdf`);
        await page.pdf({ path: outputPath, format: 'A4' });


        await browser.close()

        res.json({ pdfPath: outputPath });
    }
    catch (e) {
        console.log(e);
    }
})

const credentials_arr: any[] = [
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
]


app.post('/login-details', async (req: Request, res: Response) => {
    let userDetails = {
        userName: req.body.username,
        password: req.body.password
    }

    let result = false;

    let userName: String = userDetails.userName;

    credentials_arr.forEach((element, index) => {
        if (userName === element.userName && userDetails.password === element.password) {
            result = true;
        }
    });

    res.send({result});
})




app.post('/send-email', async (req: Request, res: Response) => {
    console.log("Email api got hit");

    const cEmail = req.body.email;
    const htmlContent = req.body.htmlContent;
    const style = req.body.style;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(
        `<html><head><style> ${style} </style></head> <body>  ${htmlContent} </body><html>`
    )

    const outputPath = path.join(__dirname, 'pdfs', `output_${Date.now()}.pdf`);
    await page.pdf({ path: outputPath, format: 'A4' });


    const transporter = nodemailer.createTransport({
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
})



function totalQuantity(obj: Object) {
    let quantity_sum = 0;

    for (let k in obj) {
        if (k.includes("quantity")) {
            quantity_sum += (obj as any)[k];
        }
    }
    return quantity_sum;
}

function totalAmmount(obj: object) {
    let ammount_sum = 0;
    const key: string = 'key';
    for (let k in obj) {
        if (k.includes("amount")) {
            ammount_sum += (obj as any)[k];
        }
    }
    return ammount_sum;
}


function discount(ammount: number) {
    return ammount - (ammount * (.10));
}



app.delete('/invoice-delete/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        console.log(id);
        // Check if the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Attempt to delete the invoice
        const deletedInvoice = await invoice_Model.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json({ message: 'Invoice deleted successfully', deletedInvoice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




app.listen(port, () => {
    console.log("server is running on port");
})
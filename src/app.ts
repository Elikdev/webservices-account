require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import bodyParserXML from "express-xml-bodyparser";
import xmlParser from "body-parser-xml";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";
import axios from "axios"

const app = express();

dotenv.config();

const morganFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
app.use(morgan(morganFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(helmet());

// Use body-parser-xml middleware for XML requests
xmlParser(bodyParser);
app.use(bodyParser.xml());

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "Successful",
    message: "Welcome to web-services-account v1.0 - JSON format",
  });
});

app.get("/xml", (req: Request, res: Response) => {
  res.set("Content-Type", "application/xml");
  return res.status(200).send(`
 <status>Successful</status>
 <message>Welcome to web-services-account v1.0 - XML format</message>
 `);
});

const {
  NUBAN_API_KEY
} = process.env;

async function getAccountDetailsFromNuban(account_number: string) {
  try {
    const url = `https://app.nuban.com.ng/api/${NUBAN_API_KEY}?acc_no=${account_number}`

    const { data } = await axios.get(url)

    if (data.error) {
      return {
        isError: true,
        message: data?.message
          ? data.message
          : "An error occured while trying to get account details",
      }
    }

    return {
      isError: false,
      data,
    }
  } catch (error: any) {
    if (error.response) {
      console.log(error)
      return {
        isError: true,
        message: error.response?.data
          ? error.response.data?.message
          : "An error occured while trying to get account details",
      }
    } else if (error.request) {
      console.log(error)
      return {
        isError: true,
        message: "An error occurred while trying to get account details",
      }
    } else {
      console.log(error)
      return {
        isError: true,
        message: "An error occurred while trying to make the request",
      }
    }
  }
}

app.post("/account-details-xml", async (req: Request, res: Response) => {
  res.set("Content-Type", "application/xml");
  const { account_number } = req.body.root;

  if(!account_number) {
    return res.status(400).send(`
    <status>Failed</status>
    <message>Invalid request parameters</message>
    `);
  }

  try {
    //const responseData =  await getAccountDetailsFromNuban(account_number)

    return res.status(200).send(`
 <status>Successful</status>
 <messageAccount details fetched successfully</message>
 <data>
    <accountName>TESTING TEST</accountName>
    <bankName>BANK TEST</bankName>
    <bankCode>000</bankCode>
 </data>
 `);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`
 <status>Failed</status>
 <message>Internal server error</message>
 `);
  }
});

app.post("/account-details-json", async (req: Request, res: Response) => {
  const { account_number } = req.body;

  if (!account_number) {
    return res.status(400).json({
      status: "Failed",
      message: "Invalid request parameters",
    });
  }

  try {
   //const responseData =  await getAccountDetailsFromNuban(account_number)

  //  if(responseData.isError) {
  //   return res.status(400).json({
  //     status: "Failed",
  //     message: responseData.message || "failed to get account details"
  //   });
  //  }
    return res.status(200).json({
      status: "Successful",
      message: "Account details fetched successfully",
      data: {
        accountName: "TESTING TEST",
        bankName: "BANK TEST",
        bankCode: "000" 
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
    });
  }
});

app.use('*', (req, res) => {
 return res.status(200).json({
  status: "Failed",
  message: "Route not found - JSON format",
});
});

export default app;
